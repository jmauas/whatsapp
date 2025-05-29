
import { obtenerConfig }  from '../global/config.global.js';

const config = await obtenerConfig();

export const enviarMensaje = async (numero, mensaje) => {
    try {
        const obj = {
            mensaje: mensaje,
            numero: numero
        }
        await postMensaje(obj);
    } catch (e) {
        console.log(new Date().toLocaleString()+'  -  '+'Error en enviarMensaje:', e)
    }
}

export const enviarHumano = async (nombre, numero_remite) => {
    try {
        const nros = config.telHumano.split(';');
        if (nros.length > 0) {
            for (let nro of nros) {
                const obj = {
                    mensaje: `El Cliente ${nombre} con el Número ${numero_remite} Pidió Hablar con un Humano.`,
                    numero: `549${nro}`                    
                }
                await postMensaje(obj);
            }
        }
    } catch (e) {
        console.log(new Date().toLocaleString()+'  -  '+'Error en enviarHumano:', e)
    }
}


export const postMensaje = async (obj) => {
    try {
        obj.media = [];
        obj.token = process.env.TOKEN_HUMANO;
        const url = `http://localhost:${config.puerto}/${process.env.CUENTA_HUMANO}`;
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(obj)
        })
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
        return response;
    } catch (e) {
        console.log(new Date().toLocaleString()+'  -  '+'Error en postMensaje:', e)
    }
}
