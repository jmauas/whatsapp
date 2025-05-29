import cron from 'node-cron';
import { obtenerConfig } from '../global/config.global.js';
import { pedirEventos } from '../calendar/calendar.js';
import { formatoFecha } from "../../utils/auxiliares.js";
import { postMensaje } from './index.js';

let tareaWhatsapp = [];
const config = await obtenerConfig();

export const agendarWa = async () => {
    try {
        await eliminarWa();
        if (!config.envio || !config.horaEnvio || !config.diasEnvio) return true;
        const ops = config.horaEnvio.split(':');
        const hora = ops[0];
        const minutos = ops[1];
        const dias = config.diasEnvio;
        const sc = {
            scheduled: true,
            timezone: 'America/Argentina/Buenos_Aires'
        }
        // SEG MIN HORAS DIA_MES MES DIA_SEMANA
        // * TODOS LOS VALORES
        // ? CUALQUIER VALOR
        // , VALORES DE UNA LISTA
        // - RANGO DE VALORES
        // / INCREMENTOS DE UN INTERVALO
        //
        // let tarea1 = cron.schedule('0 00 08 * * MON-FRI', () => {
        //     enviarMailCarritos()
        // }, sc);
        let tarea = cron.schedule(`0 ${minutos} ${hora} * * *`, () => {
            procesoConfirmaciones(dias)
        }, sc);
        tareaWhatsapp.push(tarea);
        return true;
    } catch (error) {
        console.log(new Date().toLocaleString()+'  -  '+error)
        return false;
    }
}

const eliminarWa = async () => {
    if (tareaWhatsapp.length === 0) return;
    tareaWhatsapp.forEach(tarea => {
        if (tarea && typeof tarea.destroy === 'function') {
            tarea.destroy()
        }
    });
    tareaWhatsapp = []; // Limpiar el array después de destruir las tareas
}

const procesoConfirmaciones = async (cantDias) => {
    try {
        let fh1 = new Date();
        cantDias = Number(cantDias);
        fh1.setDate(fh1.getDate() + cantDias);
        fh1 = new Date(fh1.getFullYear(), fh1.getMonth(), fh1.getDate(), 0, 0, 0);
        let fh2 = new Date(fh1.getFullYear(), fh1.getMonth(), fh1.getDate(), 23, 59, 59);
        const data = await pedirEventos(fh1, fh2);
        const turnos = data.eventos;
        const config = await obtenerConfig();
        if (turnos && turnos.length > 0) {
            for await (let turno of turnos) {
                if (turno.extendedProperties && turno.extendedProperties.private && turno.extendedProperties.private.celular) {
                    const celular = turno.extendedProperties.private.celular;
                    const nombre = turno.extendedProperties.private.nombre;
                    const servicio = turno.extendedProperties.private.servicio;
                    const fecha = formatoFecha(turno.start.dateTime, true, true, false, true);
                    const domicilio = config.domicilio;
                    const mail = config.mail;
                    const msg = `Hola ${nombre}. 👋
Desde *${config.nombreConsultorio}*, te queremos recordar que tenés un turno 
📅 Programado para el *${fecha}*.

🦷 Tipo Turno: ${servicio}.

🏥 Domicilio: *${domicilio}*.
📧 Email: ${mail}.

En caso que no puedas venir, por favor escribime para reprogramarlo. 🙏🙏
✅ Recordá llegar 5 minutos antes.
Gracias, y que tengas buen día! 👋👋👋.
`;
                    const obj = {
                        mensaje: msg,
                        numero: celular
                    }
                    const res = await postMensaje(obj);
                }
            }
        }
    } catch (e) {
        console.log(new Date().toLocaleString()+'  -  '+'Error en proceso Confirmaciones:', e)
    }
}