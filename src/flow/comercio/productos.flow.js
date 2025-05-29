import BotWhatsapp from '@builderbot/bot';
import { runChat } from '../../services/mensajes/comercio/comercio.js';
import { crearChat, agregarChat } from '../../services/mensajes/utils/utils.mensajes.js';
import { buscarProductos } from '../../services/productos/productos.js';
import { generarTxtEmbebido } from '../../services/mensajes/comercio/embebidos.js';
import { botActivo, controlHumano, controlTiempo, tiempoEspera } from '../utils/utils.js';
import { existeFrase } from '../../services/utils/index.js';
import { enviarHumano } from '../../services/sender/index.js';
import { handleVoice } from '../../services/voice/handleMedia.js';
import { estadoCompra } from '../../services/estadoCompra/estadoCompra.js';
import { pedirEnvioFlow } from './pedirEnvio.flow.js';

export const productosFlow = BotWhatsapp.addKeyword(BotWhatsapp.EVENTS.WELCOME)
    .addAction(async (ctx, f) => {
        try {
            const activo = await botActivo(ctx, f)
            if (!activo) {
                f.endFlow();
                return;
            }

            let newHistory = crearChat(f, ctx)

            let humano = await controlHumano(ctx, f, newHistory)
            if (humano) {
                f.endFlow();
                return;
            }
            const name = ctx?.pushName ?? '';

            let total_resultados = 5;
        
            //f.flowDynamic(`... 🕵️‍♀️ 🕵️‍♀️ 🕵️‍♀️`)

            const palabrasABuscar = await runChat(true, newHistory, name, '');

            console.log(new Date().toLocaleString()+'  -  '+'-----------------------------------------')
            console.log(new Date().toLocaleString()+'  -  '+`[PREGUNTA]:`, ctx.body);
            console.log(new Date().toLocaleString()+'  -  '+`[PALABRAS A BUSCAR]:`, palabrasABuscar);
        
            const productos = await buscarProductos(palabrasABuscar, total_resultados)
        
            productos.forEach((prod) => {
                console.log(new Date().toLocaleString()+'  -  '+`[PROD]:`, prod.sku, prod.titulo, '[--]', prod.match_count);
            })
            console.log(new Date().toLocaleString()+'  -  '+`[CANT]:`, productos.length, '[NOMBRE]:', name);
            console.log(new Date().toLocaleString()+'  -  '+'-----------------------------------------')
        
            const context = [];
            for await (let prod of productos) {
                const txt = await generarTxtEmbebido(prod);
                context.push(txt);
            }

            let largeResponse = await runChat(false, newHistory, name, context);
            
            if(largeResponse.toLowerCase().includes('#estadocompra')){
                let res = await estadoCompra(ctx, f)
                if (res === 'ok') {
                    largeResponse = '✅ Esta es La información de tu compra: \n\n';
                } else {
                    f.gotoFlow(pedirEnvioFlow);
                    return;
                }
            }

            if (newHistory.length >= 5 && newHistory.length <= 7) {
                const existe = await existeFrase(newHistory, 'Si queres hablar con una persona')
                if (!existe) {
                    largeResponse += ". Si queres hablar con una persona, solo pedilo escribiendolo.";
                }
            }
            
                
            //  if(largeResponse.toLowerCase().includes('chatbot')){
            //      return gotoFlow(chatbotFlow)
            //  }
                    
             const chunks = largeResponse.split(/\n+/);
             for (const chunk of chunks) {
                 await f.flowDynamic(chunk)
             }
            
            newHistory = agregarChat(newHistory, largeResponse)
                    
            await f.state.update({
                history: newHistory,
                lastMessage: new Date()
            })

            humano = await existeFrase(newHistory, '#humano1#')
            if (humano) {
                enviarHumano(name, ctx.from)
            }
        
            setTimeout(() => {
                controlTiempo(ctx, f)
            }, tiempoEspera - 10);

        }catch(err){
            console.log(new Date().toLocaleString()+'  -  '+`[ERROR]:`,err)
        }
    })

export const mediaProductosFlow = BotWhatsapp.addKeyword(BotWhatsapp.EVENTS.VOICE_NOTE)
    .addAction(async (ctx, f) => {
        const activo = await botActivo(ctx, f)
        if (!activo) {
            f.endFlow();
            return;
        }   
        await f.flowDynamic(`Escuchando tu Audio ... 👂👂👂👂`)
        const msg = await handleVoice(ctx, f.provider);
        await f.flowDynamic(`Lo que entendí que dijiste es: ${msg}`)
        ctx.body = msg;
        return f.gotoFlow(productosFlow)
    });