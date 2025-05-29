import { addKeyword, EVENTS } from "@builderbot/bot";
import { formatoFecha } from "../../utils/auxiliares.js";
import { modificarEstadoEvento } from '../../services/calendar/calendar.js';
import { arraySi } from "../utils/utils.js";

export const eliminarFlow = addKeyword(EVENTS.ACTION)
    .addAction(async (ctx, f) => {
        const turnos = await f.state.getMyState().turnos;
        await f.flowDynamic(`✔️ Fecha: ${formatoFecha(turnos[0].start.dateTime, true, true, false, true)}`);
        await f.flowDynamic(`✔️ Paciente: ${turnos[0].extendedProperties && turnos[0].extendedProperties.private && turnos[0].extendedProperties.private.nombre ? turnos[0].extendedProperties.private.nombre : ''}`);
        await f.flowDynamic(`✔️ Tipo: ${turnos[0].extendedProperties && turnos[0].extendedProperties.private && turnos[0].extendedProperties.private.servicio ? turnos[0].extendedProperties.private.servicio : ''}`);
        await f.flowDynamic(`📅 Confirmás la cancelación de este turno ❓`);
    })
    .addAnswer(`Te voy a detallar el turno registrado, para que me confirmes la cancelación. 📅`, { capture: true },
        async (ctx, f) => {
            const turnos = f.state.getMyState().turnos;
            if (arraySi.includes(ctx.body.toLowerCase())) {
                await modificarEstadoEvento(turnos[0].id, 'cancelado')
                await f.flowDynamic(`Turno Cancelado Correctamente. 🎉`);
                f.state.clear();
                f.endFlow();
            }
        }
    )