import { crearEvento, pedirEventos, modificarEstadoEvento } from "../calendar/calendar.js";
import { formatoFecha } from "../../utils/auxiliares.js";
import { savePaciente } from "../pacientes/pacientes.js";
import { enviarMensaje } from "../sender/index.js";
import { obtenerConfig } from '../../services/global/config.global.js';

const config = await obtenerConfig();

export const altaTurno = async (req, res) => {
    try {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        const turno = req.body;
        if (turno.celular.length > 3) {
            if (turno.celular.substring(0, 3) !== '549') {
                turno.celular = '549' + turno.celular;
            }
        }
        savePaciente(turno);

        if (!turno.confirmado) {
            const data = await pedirEventos(turno.desde, turno.hasta);
            const controlTurno = data.eventos;
            if (controlTurno && controlTurno.length > 0) {
                res.end(JSON.stringify({ ok: false, message: 'Ya hay un turno en ese horario', turno: controlTurno[0] }));
                return;
            }
        }
        const rspta = await crearEvento(turno) 

        if (turno.celular.length >= 10) {
            const msg = `Hola ${turno.nombre}. 👋
Desde *${config.nombreConsultorio}*, te confirmamos tu Turno Agendado. 👍

✅ Te Detallamos los datos:
🧑‍⚕️ Paciente: ${turno.nombre} ${turno.apellido}.
📅 Fecha del Turno: *${formatoFecha(turno.desde, true, true, false, true)}*.
🦷 Tipo Turno: ${turno.servicio}.
💉 Profesional: ${turno.doctor}.
🏥 Domicilio: *${config.domicilio}*.
📧 Email: ${config.mail}.

Recordá llegar 5 minutos antes.
Gracias, y que tengas buen día! 👋👋👋.
            `;
            await enviarMensaje(turno.celular, msg);
            if (rspta != '' && turno.email != '' && turno.email != 'no') {
                await enviarMensaje(turno.celular, `📅 Te pasamos el Link por si queres Agendártelo en Google Calendar.`)
                await enviarMensaje(turno.celular, rspta)
            }
        }
        res.end(JSON.stringify({ ok: true }))
    } catch (error) {
        console.log(new Date().toLocaleString()+'  -  '+'ERROR', error)
        res.end(JSON.stringify({ ok: false, message: error.ReferenceError }));
    }
}


export const modifTurno = async (req, res) => {
    try {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        const id = req.body.id;
        const estado = req.body.estado;
        const evento = await modificarEstadoEvento(id, estado)
        const turno = evento.extendedProperties.private;

        if (turno.celular.length >= 10) {
            const msg = `Hola ${turno.nombre}. 👋
Desde *${config.nombreConsultorio}*, te notificamos un cambio de estado de tu turno. 👍

✅ Te Detallamos los datos:
🧑‍⚕️ Paciente: ${turno.nombre} ${turno.apellido}.
📅 Fecha del Turno: *${formatoFecha(turno.desde, true, true, false, true)}*.
🦷 Tipo Turno: ${turno.servicio}.
💉 Profesional: ${turno.doctor}.

El Turno cambió a Estado: *${turno.estado}*.

Gracias, y que tengas buen día! 👋👋👋.
            `;
            await enviarMensaje(turno.celular, msg);
        }
        res.end(JSON.stringify({ ok: true }))
    } catch (error) {
        console.log(new Date().toLocaleString()+'  -  '+'ERROR', error)
        res.end(JSON.stringify({ ok: false, message: error.ReferenceError }));
    }
}