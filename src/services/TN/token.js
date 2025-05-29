import { registrarTokenTN } from '../config/config.js';


const urlTN = 'https://www.tiendanube.com/apps/authorize/token';

export const postTokenTN = async (req, res) => {
    try {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        const tn = req.body;
        if (!tn.code) {
            res.end(JSON.stringify({ ok: false, msgError: 'No se recibió el código de autorización' }));
            return;
        }
        const body = {
            client_id: process.env.TN_APP_ID,
            client_secret: process.env.TN_CLIENT_SECRET,
            code: tn.code,
            grant_type: 'authorization_code'
        };
        const response = await fetch(urlTN, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        const data = await response.json();
        if (data.access_token && data.user_id) {
            await registrarTokenTN(data.user_id, data.access_token);
            res.end(JSON.stringify({ ok: true }));
        } else {
            res.end(JSON.stringify({ ok: false, msgError: 'No se recibió el token de autorización' }));
        }
    } catch (e) {
        res.end(JSON.stringify({ ok: false, msgError: e.message }));
    }
}

