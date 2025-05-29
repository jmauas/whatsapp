import { createReadStream } from "fs";
import path from 'path';

export const estado = (provider, bot) => {
    let estado = 'desconectado';
    if (provider && provider.store && provider.store.state && provider.store.state.connection) {
        estado = provider.store.state.connection
    }
    if (provider.vendor.connected) estado = provider.vendor.connected;
    let so = ''
    let numero = ''
    let nombre = '';
    let id = '';
    if (provider && provider.vendor && provider.vendor.ws && provider.vendor.ws.config
        && provider.vendor.ws.config.auth && provider.vendor.ws.config.auth.creds
        && provider.vendor.ws.config.auth.creds.me && provider.vendor.ws.config.auth.creds.platform) {
        id = provider.vendor.ws.config.auth.creds.me.id;
        numero = provider.vendor.ws.config.auth.creds.me.id;
        nombre = provider.vendor.ws.config.auth.creds.me.name;
        so = provider.vendor.ws.config.auth.creds.platform;
        if (numero.includes(':')) {
            numero = numero.split(':')[0];
            id = numero + '@s.whatsapp.net'
        }
        if (estado === 'open') {
            bot.sendMessage(id, 'Hola, estoy en línea.\nMensaje Enviado con Éxito.', '');            
        }
    }
    return {
        estado,
        so,
        numero,
        nombre,
        id
    }
}

export const estadoCuenta = async (bot, req, res, provider) => {
    try {
        const es = estado(provider, bot);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ ok: true, msgError: '', ...es }));
    } catch (e) {
        res.end(JSON.stringify({ ok: false, msgError: e.message, estado: '', so: '', numero: '', nombre: '', id: '' }));
    }
}

export const getQr = async (bot, req, res, cuenta) => {
    try {
        const PATH_QR = path.join(process.cwd(), `${cuenta}.qr.png`);
        let fileStream;
        try {
            fileStream = createReadStream(PATH_QR);
        } catch (e) {
            res.end(JSON.stringify({ ok: false, msgError: 'QR no encontrado' }));
            return;
        }
        fileStream.pipe(res);
    } catch (error) {
        res.end(JSON.stringify({ ok: false, msgError: error.message }));
    }
}
