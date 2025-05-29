import { addKeyword, EVENTS } from "@builderbot/bot";
import { obtenerConfig } from '../../services/global/config.global.js';
import { agregarChat } from '../../services/mensajes/utils/utils.mensajes.js';

const config = await obtenerConfig();
const urlTurnos = config.urlApp + '/paciente?celu=';

const mensaje = `Para agendar un turno, te pasamos el link de nuestra App, en la que vas a poder ver los turnos, y agendar el que mas te convenga. 👩🏼‍⚕
Hacé Click en el enlace y seguí los pasos. 📅`

export const solicitudTurnoFlow = addKeyword(EVENTS.WELCOME)
    .addAnswer(mensaje)
    .addAction(async (ctx, f) => {
        let msg = urlTurnos + ctx.from;
        f.flowDynamic(msg);
        let mensajes = f.state.get('history');
        mensajes = agregarChat(mensajes, msg + `. #solicitado`)
        await f.state.update({
            history: mensajes,
            lastMessage: new Date()
        })
    })


