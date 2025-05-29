import { obtenerConfig } from '../global/config.global.js';
import { buscarProductos as buscarSQL} from '../sql/busquedaProductos.js';
import { buscarProductos as buscarTN } from '../TN/busquedaProductos.js';

const config = await obtenerConfig();

export const buscarProductos = async (busqueda, maximo) => {
    switch (config.base) {
        case 'nm':
            return await buscarSQL(busqueda, maximo);
        case 'tn':
            return await buscarTN(busqueda, maximo);
        default:
            return [];
    }
}