import { addKeyword, EVENTS } from "@builderbot/bot";
import { consultorioFlow } from "./consultorio.flow.js";
import { buscarTurnosByDNI, consultarTurnos } from '../utils/utils.js';
import { eliminarFlow } from './eliminar.flow.js';

export const pedirDNIFlow = addKeyword(EVENTS.ACTION)
    .addAnswer(`Te voy a pedir que Ingreses tu DNI sin puntos, para poder hacer la Busqueda... 🔎`)
    .addAnswer(`Si queres cancelar, respondé cancelar. ❌`,
        { capture: true },
        async (ctx, f ) => {
            if (ctx.body.toLowerCase() == 'cancelar') {
                f.state.clear();
                f.endFlow();
            }
            const eliminar = f.state.get('eliminarTurnos');

            if(ctx.body.length < 5) {
                 return f.fallBack('Nombre muy Corto. ❌')
            }
            const turnos = await buscarTurnosByDNI(ctx.body);
            let res = '';
            if (turnos.length > 0) {
                if (eliminar) {
                    await f.state.update({ turnos })
                    return f.gotoFlow(eliminarFlow)
                } else {
                    res = await consultarTurnos(turnos)
                }
            } else {                
                res = 'No encontramos turnos agendados para tu número de DNI. ❌';
            }
            f.flowDynamic(res);
            f.state.clear();
            f.endFlow();
        }
    )