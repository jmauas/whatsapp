import { addKeyword, EVENTS } from "@builderbot/bot";
import { crearEvento, pedirEventos } from "../../services/calendar/calendar.js";
import { formatoFecha } from "../../utils/auxiliares.js";
import { savePaciente } from "../../services/pacientes/pacientes.js";
import { consultorioFlow } from "./consultorio.flow.js";
import { solicitudTurnoFlow } from "./solicitudTurno.flow.js";
import { obtenerChat, agregarChat } from '../../services/mensajes/utils/utils.mensajes.js';
import { obtenerConfig } from '../../services/global/config.global.js';

export const registrarFlow = addKeyword(EVENTS.ACTION)
    .addAnswer(`Registrando Turno ... 🕰️`)
    .addAction(async (ctx, f) => {
        const fh1 = f.state.get('fh');
        const fh = new Date(fh1);
        const tipo = f.state.get('tipo');
        const doctor = f.state.get('doctor');
        if (!doctor || !tipo || !fh1) {
            await f.flowDynamic('No se pudo registrar el Turno. ❌');
            await f.flowDynamic('Falta algun dato. Te pedimos disculpas. 🙏');
            f.gotoFlow(solicitudTurnoFlow);
            return;
        }

        const duracion = Number(tipo.duracion) || 30;
        fh.setMinutes(fh.getMinutes() + duracion);
        const fh2 = fh.toISOString();
        const data = await pedirEventos(fh1, fh2);
        if (data & data.ok) {
            const controlTurno = data.eventos
            if (controlTurno && controlTurno.length > 0) {
                await eliminarConfirmacionDelChat(f)
                f.gotoFlow(consultorioFlow);
                return;
            }
        }
        
        const config = await obtenerConfig();

        let emoji = '';
        if (doctor.nombre == 'Indistinto') {
            emoji = '🚥';
        } else {
            emoji = config.doctores.filter(d => d.nombre === doctor.nombre)[0].emoji;
        }
        
        const turno = {
            nombre: f.state.get('nombre'),
            dni: f.state.get('dni'),
            email: f.state.get('email'),
            cobertura: f.state.get('cobertura'),
            servicio: tipo.nombre,
            duracion: Number(tipo.duracion),
            doctor: doctor.nombre,
            emoji: emoji,
            desde: fh1,
            hasta: fh2,
            celular: ctx.from
        }
        
        savePaciente(turno)
        const res = await crearEvento(turno) 

        const msg = `Listo!. Ya tenés tu Turno Agendado. 👍
✅ Te Detallamos los datos:
🧑‍⚕️ Paciente: ${turno.nombre}  ${turno.apellido}.
📅 Fecha del Turno: *${formatoFecha(fh1, true, true, false, true)}*.
🦷 Tipo Turno: ${turno.servicio}.
💉 Profesional: ${turno.doctor}.
🏥 Domicilio: *${config.domicilio}*.
📧 Email: ${config.mail}.

Recordá llegar 5 minutos antes.
Gracias, y que tengas buen día! 👋👋👋.
        `;
        await f.flowDynamic(msg)
        if (res != '' && turno.email != '' && turno.email != 'no') {
            await f.flowDynamic(`📅 Te pasamos el Link por si queres Agendártelo en Google Calendar.`)
            await f.flowDynamic(res)
        }
        f.state.clear();
        f.endFlow();
    })


const eliminarConfirmacionDelChat = async (f) => {
    const msg = `Lo sentimos, pero ya se agendó un Turno para esa fecha y hora. Por favor, elegí otro horario.`;
    await f.flowDynamic(msg)
    let mensajes = await obtenerChat(f);
    mensajes = mensajes.map(m => {
        if (m.content.indexOf('#agendar') >= 0) {
            return { ...m, content: m.content.replaceAll('#agendar', '') };
        } else {
            return m;
        }
    });
    mensajes = agregarChat(mensajes, msg);
    await f.state.update({
        history: mensajes,
        lastMessage: new Date()
    });
}