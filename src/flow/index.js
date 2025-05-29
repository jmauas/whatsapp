import { createFlow } from '@builderbot/bot';
import { productosFlow, mediaProductosFlow } from './comercio/productos.flow.js';
import { pedirEnvioFlow } from './comercio/pedirEnvio.flow.js';
import { consultaBDFlow, mediaConsultaBDFlow } from './consultasBD/consultasBD.js';
import { seleccionBDFlow, seleccionBDFlow2 } from './consultasBD/seleccionBD.js'; 
import { consultorioFlow, mediaConsultorioFlow } from './consultorio/consultorio.flow.js';
import { confirmFlow } from './consultorio/confirm.flow.js';
import { pedirDatosFlow } from './consultorio/pedirDatos.flow.js';
import { pedirDNIFlow } from './consultorio/pedirDNI.flow.js';
import { registrarFlow } from './consultorio/registrar.flow.js';
import { eliminarFlow } from './consultorio/eliminar.flow.js';
import { solicitudTurnoFlow } from './consultorio/solicitudTurno.flow.js';
import { obtenerConfig } from '../services/global/config.global.js';

const config = await obtenerConfig();

const flows = [];

switch (config.modo) {
    case 'comercio':
        flows.push(productosFlow, mediaProductosFlow, pedirEnvioFlow);
        break;
    case 'consultas':
        flows.push(consultaBDFlow, mediaConsultaBDFlow, seleccionBDFlow, seleccionBDFlow2);
        break;
    case 'consultorio':
        flows.push(consultorioFlow, mediaConsultorioFlow, confirmFlow, pedirDatosFlow, registrarFlow, eliminarFlow, solicitudTurnoFlow, pedirDNIFlow);
        break;
    default:
        break;
}

/**
 * Debes de implementasr todos los flujos
 */

export default createFlow(flows)