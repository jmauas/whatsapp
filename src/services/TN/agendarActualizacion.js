import { obtenerConfig } from '../global/config.global.js';
import { getProdsTN, getVentasTN } from './index.tn.js';

let tareaActualizarTN = [];
const config = await obtenerConfig();

export const agendarActualizarTN = async () => {
    try {
        await eliminarAgendarTN();
        
        if (config.base === "tn") {
            getProdsTN();            
            const minutos = 5;    
            const tarea = setInterval(() => {
                getProdsTN();
            }, 1000 * 60 * minutos);            
            tareaActualizarTN.push(tarea);
        };

        if (config.ventasTN) {
            getVentasTN();            
            const minutos = 5;    
            const tarea = setInterval(() => {
                getVentasTN();
            }, 1000 * 60 * minutos);           
            tareaActualizarTN.push(tarea);
        };
        return true;
        
    } catch (error) {
        console.log(new Date().toLocaleString()+'  -  '+error)
        return false;
    }
}

const eliminarAgendarTN = async () => {
    if (tareaActualizarTN.length === 0) return;
    tareaActualizarTN.forEach(tarea => {
        if (tarea && typeof tarea.destroy === 'function') {
            tarea.destroy()
        }
    });
    tareaActualizarTN = []; // Limpiar el array después de destruir las tareas
}
