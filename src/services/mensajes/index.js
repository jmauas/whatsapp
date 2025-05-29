import fs from "fs";
import path from 'path';
const root = process.cwd();

export const enviarMensaje = async (bot, req, res, tokenCuenta) => {
    try {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        const token = req.body.token;
        if (token !== tokenCuenta) {
            res.end(JSON.stringify({ ok: false, msgError: 'Token incorrecto' }));
            return;
        }
        const obj = req.body;
        console.log(new Date().toLocaleString()+'  -  '+obj)
        const numero = obj.numero;
        const mensaje = obj.mensaje;
        const masivo = obj.masivo;
        if (obj?.media) {
            for await (let m of obj.media) {
                let adj = m;
                let nombre = '';
                if (m.indexOf('http') < 0) {
                    adj = path.join(root, 'uploads', m)
                    nombre = m;
                }
                if (m.indexOf('$') > 0) {
                    nombre = m.substring(0, m.indexOf('$'));
                }
                console.log(new Date().toLocaleString()+'  -  '+`Enviando archivo ${adj} a ${numero}`)
                await bot.sendMessage(numero, nombre, { media: adj});                    
            }
            if (mensaje && mensaje.length > 0) {
                await bot.sendMessage(numero, mensaje, '');
            }
            if (masivo != true) {
                for await (let m of obj.media) {
                    try {
                        if (m.indexOf('http') < 0) {
                            fs.unlinkSync(path.join(root, 'uploads', m))
                        }
                    } catch (e) {
                        console.log(new Date().toLocaleString()+'  -  '+`Error al borrar archivo: ${e.message}`)
                    }
                }
            }
        } else {
            await bot.sendMessage(numero, mensaje, '')          
        }
        res.end(JSON.stringify({ ok: true, msgError: '' }))
    } catch (e) {
        console.log(new Date().toLocaleString()+'  -  '+`Error: ${e.message}`)
        res.end(JSON.stringify({ ok: false, msgError: e.message }));
    }
}