import BotWhatsapp from '@builderbot/bot';
import { crearChat, agregarChat } from '../../services/mensajes/utils/utils.mensajes.js';
import { botActivo, controlHumano, controlTiempo, tiempoEspera } from '../utils/utils.js';
import { handleVoice } from '../../services/voice/handleMedia.js';
import { enviarHumano } from '../../services/sender/index.js';
import { existeFrase } from '../../services/utils/index.js';
import { runChatConsultorio } from '../../services/mensajes/consultorio/consultorio.js';
import { confirmFlow } from './confirm.flow.js';
import { fechaValida } from '../../utils/auxiliares.js';
import { consultarTurnos, buscarTurnos } from '../utils/utils.js';
import { eliminarFlow } from './eliminar.flow.js';
import { solicitudTurnoFlow } from './solicitudTurno.flow.js';
import { pedirDNIFlow } from './pedirDNI.flow.js';

export const consultorioFlow = BotWhatsapp.addKeyword(BotWhatsapp.EVENTS.WELCOME)
    .addAction(async (ctx, f) => {
        try {
            const activo = await botActivo(ctx, f)
            if (!activo) {
                f.endFlow();
                return;
            }     

            let newHistory = crearChat(f, ctx)
            await f.state.update({
                history: newHistory,
                lastMessage: new Date()
            })
            
            let humano = await controlHumano(ctx, f, newHistory)
            if (humano) {
                f.endFlow();
                return;
            }
            
            const name = ctx?.pushName ?? '';
            console.log(new Date().toLocaleString()+'  -  '+`[PREGUNTA]:`, ctx.body, name);
            
            let response = await runChatConsultorio(newHistory, ctx, f);            
            console.log(new Date().toLocaleString()+'  -  '+`[RESPUESTA]:`, response);

            let index = response.indexOf('#solicitar');
            let existe = false;
            //let existe = await existeFrase(newHistory, '#solicitado')
            //if (index >= 0 && !existe) {
            if (index >= 0) {
                await f.flowDynamic(response)
                newHistory = agregarChat(newHistory, response)                    
                await f.state.update({
                    history: newHistory,
                    lastMessage: new Date()
                })
                return f.gotoFlow(solicitudTurnoFlow)
            }

            // index = response.indexOf('#agendar');
            // if (index >= 0) {
            //     const str = validarJSON(response, index);
            //     console.log(new Date().toLocaleString()+'  -  '+`[AGENDAR]:`, str)
            //     let turno = str.str;
            //     if (str.isJson) {
            //         let fhTxt = turno.turno;
            //         let fh = new Date();
            //         try {
            //             fh = new Date(fhTxt);
            //         } catch (e) {console.log(new Date().toLocaleString()+'  -  '+`[ERROR]:`, e)}
            //         console.log(new Date().toLocaleString()+'  -  '+`[FECHA 1]:`, fh)
            //         console.log(new Date().toLocaleString()+'  -  '+`[FECHA 2]:`, fhTxt, fechaValida(fh))
            //         if (fechaValida(fh)) {
            //             await f.state.update({fh: fhTxt})
            //             return f.gotoFlow(confirmFlow)
            //         } else {
            //             response = 'No pudimos Validar el turno solicitado. Disculpas 🙇‍♀️. Por favor, volvé a escribir la fecha y hora que queres. 🙏'
            //         }
            //     }
            // }

            if (response.indexOf('#consultaTurno') >= 0) {
                let turnos = await buscarTurnos(ctx);
                if (turnos.length > 0) {
                    response = await consultarTurnos(turnos)
                } else {           
                    await f.state.update({ eliminarTurnos: false })
                    return f.gotoFlow(pedirDNIFlow);
                }
                
            }

            if (response.indexOf('#eliminarTurno') >= 0) {
                let turnos = await buscarTurnos(ctx)
                if (turnos.length > 0) {
                    await f.state.update({ turnos })
                    return f.gotoFlow(eliminarFlow)
                } else {
                    await f.state.update({ eliminarTurnos: true })
                    return f.gotoFlow(pedirDNIFlow);                    
                }
            }

            if (newHistory.length >= 5 && newHistory.length <= 7) {
                existe = await existeFrase(newHistory, 'Si queres hablar con una persona')
                if (!existe) {
                    response += ". Si queres hablar con una persona, solo pedilo escribiendolo.";
                }
            }
                    
            const chunks = response.split(/\n+/);
            for (const chunk of chunks) {
                await f.flowDynamic(chunk)
            } 

            newHistory = agregarChat(newHistory, response)                    
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

            
        } catch (err) {
            console.log(new Date().toLocaleString()+'  -  '+`[ERROR]:`,err)
        }
    })

export const mediaConsultorioFlow = BotWhatsapp.addKeyword(BotWhatsapp.EVENTS.VOICE_NOTE)
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
        return f.gotoFlow(consultorioFlow)
    });


const validarJSON = (str, index) => {
    str = str.trim();
    str = str.substring(index);
    str = str.replace("'", '"');
    let inicio = str.indexOf('{');
    let fin = str.indexOf('}');
    if (inicio >= 0 && fin >= 0 && fin > inicio) {
        str = str.substring(inicio, fin + 1);
    }
    let isJson = true;
    try {
        str = JSON.parse(str);
    } catch (e) {
        isJson = false;
    }
    return {isJson, str}
}
