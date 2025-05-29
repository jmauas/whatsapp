import { addKeyword, EVENTS } from '@builderbot/bot';
import { runChat } from '../../services/mensajes/consultaBD/consultaBD.js';
import { crearChat, agregarChat } from '../../services/mensajes/utils/utils.mensajes.js';
import { botActivo, validarUsuario } from '../utils/utils.js';
import { select } from '../../services/sql/index.js';
import { handleVoice } from '../../services/voice/handleMedia.js';
import { array2Img } from '../utils/utils.js';
import { seleccionBDFlow } from './seleccionBD.js';

export const consultaBDFlow = addKeyword(EVENTS.WELCOME)
    .addAction(async (ctx, f) => {
        try {
            console.log(new Date().toLocaleString()+'  -  '+'LLEGAMOS')
            const activo = await botActivo(ctx, f)
            if (!activo) {
                f.endFlow();
                return;
            }

            const usuario = await validarUsuario(ctx)
            if (!usuario.ok) {
                await f.flowDynamic(`🚫 No tenes permisos para realizar consultas a la base de datos. 🚫`)
                f.endFlow();
                return;
            }

            let consultaHumano = crearChat(f, ctx)
            consultaHumano = consultaHumano.slice(-7);
           
            const name = ctx?.pushName ?? '';

            f.state.update({pregunta: ctx.body});
            let bd = f.state.get('bd');
            if (!bd) {
                bd = usuario.bd.split(';');
                if (bd.length > 1) {
                    return f.gotoFlow(seleccionBDFlow)
                }
                bd = bd[0];
                f.state.update({bd: bd});
            }

            let datos = await runChat(true, consultaHumano, name, '', usuario.token);
            console.log(new Date().toLocaleString()+'  -  '+`${new Date().toLocaleString()} - [PREGUNTA]:`, ctx.body);
            console.log(new Date().toLocaleString()+'  -  '+`${new Date().toLocaleString()} - [SQL]:`, datos);
            datos = datos.replaceAll('`', '');
            datos = datos.replaceAll('json', '');
            datos = datos.trim();
            datos = JSON.parse(datos);
            let sql = datos.sql;
            const ok = datos.ok;
            if (sql === '' || !ok) {
                await f.flowDynamic(`${name}. No llegué a comprender tu consulta. 🙏🙏
Por Favor, agregame mas detalle para poder entenderte mejor. 🤔`);
                f.endFlow();
                return;
            }
            
            const res = await select(sql, bd);
            if (res.error) {
                console.log(new Date().toLocaleString()+'  -  '+`${new Date().toLocaleString()} - [ERROR]:`, res.error)
                return;
            }            
            
            let datosRespuesta = JSON.stringify(res.datos);
            
            //console.log(new Date().toLocaleString()+'  -  '+`${new Date().toLocaleString()} - [DATOS RESPUESTA]:`, datosRespuesta);
            
            let respuesta = await runChat(false, consultaHumano, name, datosRespuesta, usuario.token);
            
            // const chunks = respuesta.split(/\n+/);
            // for (const chunk of chunks) {
                // await f.flowDynamic(chunk)
                // }
            await f.flowDynamic(respuesta);
                
            if (res.datos.length > 1) {
                const img = await array2Img(res.datos);
                f.flowDynamic([{body: 'Cuadro de Información', media: img }]) 
            }

            consultaHumano = agregarChat(consultaHumano, respuesta)
                    
            await f.state.update({
                history: consultaHumano,
                lastMessage: new Date()
            })

        }catch(err){
            console.log(new Date().toLocaleString()+'  -  '+`${new Date().toLocaleString()} - [ERROR]:`, err)
        }
    })

export const mediaConsultaBDFlow = addKeyword(EVENTS.VOICE_NOTE)
    .addAction(async (ctx, f) => {
        await f.flowDynamic(`Escuchando tu Audio ... 👂👂👂👂`)
        const msg = await handleVoice(ctx, f.provider);
        await f.flowDynamic(`Lo que entendí que dijiste es: ${msg}`)
        ctx.body = msg;
        return f.gotoFlow(consultaBDFlow)
    });

// export const groupConsultaBDFlow = BotWhatsapp.addKeyword(BotWhatsapp.EVENTS)
//     .addAction(async (ctx, f) => {
//         console.lof(`[GROUP]:`, ctx)
       
//     });