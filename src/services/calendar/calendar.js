import fs from 'fs/promises'
import path from 'path';
import { obtenerConfig } from '../global/config.global.js';
import { google } from 'googleapis';
import { validarEmail } from '../../utils/auxiliares.js';

const config = await obtenerConfig();

const auth2Client = new google.auth.OAuth2(
    process.env.CALENDAR_CLIENT_ID,
    process.env.CALENDAR_CLIENT_SECRET,
    config.urlApp+config.redireccion
);

const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events'
];

export const getAuthUrl = async (req, res) => {
    try {
        const url = auth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes
        });
        res.redirect(url);

    } catch (e) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ ok: false, msgError: e.message }));
    }
}

export const getRefreshToken = async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json');
        const code = req.query.code;
        await saveCode(code);
        await pedirTokens();
        res.end(JSON.stringify({ ok: true }));
    } catch (e) {
        res.end(JSON.stringify({ ok: false, msgError: e.message }));
    }
}

export const nuevosTokens = async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json');
		await forzarRenovarToken();
        res.end(JSON.stringify({ ok: true }));
    } catch (e) {
        res.end(JSON.stringify({ ok: false, msgError: e.message }));
    }
}

const getCod = async () => {
    try {
        const root = process.cwd();
        const datos = JSON.parse(await fs.readFile(path.join(root, 'locales', 'googleCodes.json'), 'utf8'))
        const code = datos.code;
        if (code && code != '') {
            return code;
        } else {
            return null;
        }
    } catch (error) {
        return null;
    }
}

const getTokens = async () => {
    try {
        const root = process.cwd();
        const datos = JSON.parse(await fs.readFile(path.join(root, 'locales', 'googleCodes.json'), 'utf8'))
        const rt = JSON.parse(await fs.readFile(path.join(root, 'locales', 'googleRefreshToken.json'), 'utf8'))
        let tokens = datos.tokens;
		if (!tokens) tokens = {};
        if (rt.refresh_token && rt.refresh_token.length>10) tokens.refresh_token = rt.refresh_token;
        if (tokens) {
            return tokens;
        } else {
            return null;
        }
    } catch (error) {
        return null;
    }
}

const saveCode = async (code) => {
    try {
        const root = process.cwd();
        const datos = JSON.parse(await fs.readFile(path.join(root, 'locales', 'googleCodes.json'), 'utf8'))
        datos.code = code;
        await fs.writeFile(path.join(root, 'locales', 'googleCodes.json'), JSON.stringify(datos, null, 2));
        return true;
    } catch (error) {
        try {
            const root = process.cwd();
            const datos = { code };
            await fs.writeFile(path.join(root, 'locales', 'googleCodes.json'), JSON.stringify(datos, null, 2));
        } catch (error) {
            console.log(new Date().toLocaleString()+'  -  '+error);
            return false;
        }
    }
}

const saveCalendar = async (cal) => {
    try {
        const root = process.cwd();
        await fs.writeFile(path.join(root, 'locales', 'calendar.json'), JSON.stringify(cal, null, 2));
        return true;
    } catch (error) {
        console.log(new Date().toLocaleString()+'  -  '+error);
    }
}

const saveTokens = async (tokens) => {
    try {
        const root = process.cwd();
        const datos = JSON.parse(await fs.readFile(path.join(root, 'locales', 'googleCodes.json'), 'utf8'))
        datos.tokens = tokens;
        await fs.writeFile(path.join(root, 'locales', 'googleCodes.json'), JSON.stringify(datos, null, 2));
        return true;
    } catch (error) {
        console.log(new Date().toLocaleString()+'  -  '+error);
        try {
            const root = process.cwd();
            const datos = { tokens };
            await fs.writeFile(path.join(root, 'locales', 'googleCodes.json'), JSON.stringify(datos, null, 2));
        } catch (error) {
            console.log(new Date().toLocaleString()+'  -  '+error);
            return false;
        }
    }
}

const saveRefreshToken = async (rt) => {
    try {
		if (!rt || rt === null || rt === undefined) return true
        const root = process.cwd();
        const datos = JSON.parse(await fs.readFile(path.join(root, 'locales', 'googleRefreshToken.json'), 'utf8'))
        datos.refresh_token = rt;
        await fs.writeFile(path.join(root, 'locales', 'googleRefreshToken.json'), JSON.stringify(datos, null, 2));
        return true;
    } catch (error) {
        console.log(new Date().toLocaleString()+'  -  '+error);
        try {
            const root = process.cwd();
            const datos = { refresh_token: rt };
            await fs.writeFile(path.join(root, 'locales', 'googleRefreshToken.json'), JSON.stringify(datos, null, 2));
        } catch (error) {
            console.log(new Date().toLocaleString()+'  -  '+error);
            return false;
        }
    }
}

const pedirTokens = async () => {
    try {
        const code = await getCod();
        if (code) {
            const { tokens } = await auth2Client.getToken(code);
            await saveTokens(tokens)
            if (tokens.refresh_token && tokens.refresh_token.length>10) {
                await saveRefreshToken(tokens.refresh_token)
            }
            auth2Client.setCredentials(tokens);
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.log(new Date().toLocaleString()+'  -  '+'ERROR AL SOLICITAR TOKENS');
        let err = '';
		if (error.response && error.response.data && error.response.data.error) {
			err = error.response.data.error;
		} else {
			err = error;
		}
		if (error.response && error.response.data && error.response.data.error_description) {
			err += ' -- '+error.response.data.error_description;
		}
		console.log(new Date().toLocaleString()+'  -  '+err);
        return false;
    }
}

const forzarRenovarToken = async () => {
	try {
		let tokens = await getTokens();
        auth2Client.setCredentials(tokens);
		const res = await auth2Client.refreshAccessToken();
		tokens = res.credentials;                           
		await saveTokens(tokens);
		auth2Client.setCredentials(tokens);
	} catch (error) {
        console.log(new Date().toLocaleString()+'  -  '+'ERROR AL RENOVAR TOKEN FORZADO');
		let err = '';
		if (error.response && error.response.data && error.response.data.error) {
			err = error.response.data.error;
		} else {
			err = error;
		}
		if (error.response && error.response.data && error.response.data.error_description) {
			err += ' -- '+error.response.data.error_description;
		}
		console.log(new Date().toLocaleString()+'  -  '+err);
	}
}

const renovarToken = async (origen) => {
    try {
        let tokens = await getTokens();
        auth2Client.setCredentials(tokens);
        let rt = '';
        try {
            if (!tokens) throw new Error('No se encontraron tokens');
            if (!tokens.refresh_token) throw new Error('No se encontró refresh_token');
            rt = tokens.refresh_token;
            const expirationTimestamp = Number(tokens.expiry_date) - (1000 * 60 * 30);// 30 minutos antes de expirar
            const currentTimestamp = Math.floor(Date.now());
            if (expirationTimestamp < currentTimestamp) {
                const res = await auth2Client.refreshAccessToken();
                tokens = res.credentials;                
            } 
        } catch (error) {
            console.log(new Date().toLocaleString()+'  -  '+'ERROR AL RENOVAR TOKEN');
            let err = '';
            if (error.response && error.response.data && error.response.data.error) {
                err = error.response.data.error;
            } else {
                err = error;
            }
            if (error.response && error.response.data && error.response.data.error_description) {
                err += ' -- '+error.response.data.error_description;
            }
            console.log(new Date().toLocaleString()+'  -  '+err);
        }
        if (rt != '') {
            tokens.refresh_token = rt;
        }
        await saveTokens(tokens);
        auth2Client.setCredentials(tokens);
        console.log(new Date().toLocaleString()+'  -  '+'PROCESO RENOVAR TOKEN TERMINADO. ORIGEN: ', origen);
        return {ok: true};
    } catch (error) {
        console.log(new Date().toLocaleString()+'  -  '+'ERROR AL RENOVAR TOKEN');
		let err = '';
		if (error.response && error.response.data && error.response.data.error) {
			err = error.response.data.error;
		} else {
			err = error;
		}
		if (error.response && error.response.data && error.response.data.error_description) {
			err += ' -- '+error.response.data.error_description;
		}
		console.log(new Date().toLocaleString()+'  -  '+err);
        return {ok: false, mensaje: `ERROR AL RENOVAR TOKEN. ${err}`};
    }
}

export const crearEvento = async (evento) => {
    try {
        const res = await renovarToken('CREAR EVENTO');
        if (!res.ok) return res.mensaje;
        const calendar = google.calendar({
            version: 'v3',
            auth: auth2Client
        });

        evento.estado = 'confirmado';
        const event = {
            summary: `${evento.emoji} TURNO ${evento.nombre} ${evento.apellido}`,
            location: '',
            description: `
---------------------------------------
✔️ Paciente: <b>${evento.nombre} ${evento.apellido}.</b> ➖ 
✔️ Celular: ${evento.celular}. ➖
✔️ EMail: ${evento.email}. ➖ 
✔️ DNI: ${evento.dni}. ➖
✔️ Cobertura: ${evento.cobertura}. ➖
✔️ Tipo Turno: <b>${evento.servicio}.</b> ➖
✔️ Duración: ${evento.duracion} Min. ➖
✔️ Dr.: ${evento.emoji} ${evento.doctor}. ➖
✏️ <b>WhatsApp: <a href="https://wa.me/${evento.celular}" target=_blank" src="WhatsAppButtonGreenLarge.svg">Enviar Mensaje .📩</a> ➖</b>
---------------------------------------
${evento.observaciones ? `✔️ Observaciones: <b>${evento.observaciones}.</b> ➖
---------------------------------------` : ''}`
            ,
            start: {
                dateTime: evento.desde,
                timeZone: '-3'
            },
            end: {
                dateTime: evento.hasta,
                timeZone: '-3'
            },
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'email', minutes: 24 * 60 },
                    { method: 'popup', minutes: 10 }
                ]
            },
            extendedProperties: {
                private: { ...evento }
            }
        }
        if (validarEmail(evento.email)) {
            event.attendees = [{ email: evento.email }];
        }
        const calendarId = config && config.calendario ? config.calendario : 'primary'
        const result = await calendar.events.insert({ calendarId, requestBody: event });
        console.log(new Date().toLocaleString()+'  -  '+'Evento creado: % ', result.data.htmlLink);
        return result.data.htmlLink;
    } catch (error) {
        console.log(new Date().toLocaleString()+'  -  '+'ERROR AL AGENDAR EVENTO');
        let err = '';
		if (error.response && error.response.data && error.response.data.error) {
			err = error.response.data.error;
		} else {
			err = error;
		}
		if (error.response && error.response.data && error.response.data.error_description) {
			err += ' -- '+error.response.data.error_description;
		}
		console.log(new Date().toLocaleString()+'  -  '+err);
        return '';
    }
}

export const pedirEventos = async (desde = null, hasta = null) => {
    try {
        const res = await renovarToken('PEDIR EVENTOS');
        if (!res.ok) return {ok: false, eventos: [], mensaje: res.mensaje}
        const calendar = google.calendar({
            version: 'v3',
            auth: auth2Client
        });
        const params = {
            calendarId: config && config.calendario ? config.calendario : 'primary',
            timeMin: new Date().toISOString(),
            maxResults: 1000,
            singleEvents: true,
            orderBy: 'startTime'
        }
        if (desde && hasta) {
            params.timeMin = desde;
            params['timeMax'] = hasta;
        }
        const result = await calendar.events.list(params);
	
        if (result && result.data && result.data.items && Array.isArray(result.data.items)) {
            saveCalendar(result.data.items)
            return {ok: true, eventos: result.data.items};
        } else {
            return {ok: false, eventos: [], error: 'No se encontraron eventos'};
        }
    } catch (error) {
        console.log(new Date().toLocaleString()+'  -  '+'ERROR AL SOLICITAR EVENTOS');
        let err = '';
		if (error.response && error.response.data && error.response.data.error) {
			err = error.response.data.error;
		} else {
			err = error;
		}
		if (error.response && error.response.data && error.response.data.error_description) {
			err += ' -- '+error.response.data.error_description;
		}
		console.log(new Date().toLocaleString()+'  -  '+err);
        return {ok: false, eventos: [], error: err};
    }
}

export const eliminarEvento = async (id) => {
    try {
        const res = await renovarToken('ELIMINAR EVENTO');
        if (!res.ok) return {ok: false, eventos: [], error: res.mensaje}
        const calendar = google.calendar({
            version: 'v3',
            auth: auth2Client
        });
        const result = await calendar.events.delete({
            calendarId: config && config.calendario ? config.calendario : 'primary',
            eventId: id,
        });

        console.log(new Date().toLocaleString()+'  -  '+'Evento eliminado');
    } catch (error) {
        console.log(new Date().toLocaleString()+'  -  '+'Error al eliminar el evento', error);
    }
}

export const modificarEstadoEvento = async (id, es) => {
    try {
        const res = await renovarToken('MODIFICAR ESTADO EVENTO');
        if (!res.ok) return {ok: false, eventos: [], error: res.mensaje}
        const calendar = google.calendar({
            version: 'v3',
            auth: auth2Client
        });
        const evento = await calendar.events.get({
            calendarId: config && config.calendario ? config.calendario : 'primary',
            eventId: id,
        });
        evento.data.extendedProperties.private.estado = es;
        evento.data.extendedProperties.private.fhCambioEstado = new Date().toISOString();
        if (es == 'cancelado') {
            const turno = new Date(evento.data.start.dateTime);
            const ahora = new Date();
            const diffInMs = turno - ahora;
            console.log(new Date().toLocaleString()+'  -  '+'Diferencia en ms:', diffInMs)
            const diffInHours = diffInMs / 1000 / 60 / 60;
            console.log(new Date().toLocaleString()+'  -  '+'Diferencia en horas:', diffInHours)
            evento.data.extendedProperties.private.hsAviso = diffInHours.toString();
            if (diffInHours <= 0) {
                evento.data.extendedProperties.private.penal = 'ASA';
                evento.data.summary = `🚫❌ CANCELADO ASA ${evento.data.summary}`;
            } else if (diffInHours < 48) {
                evento.data.extendedProperties.private.penal = 'CCR';
                evento.data.summary = `🚫❌ CANCELADO CCR ${evento.data.summary}`;
            } else {
                evento.data.summary = `❌ Cancelado ${evento.data.summary}`;
            }
            const colorId = 4;
            evento.data.colorId = colorId.toString();
        }

        await calendar.events.update({
            calendarId: config && config.calendario ? config.calendario : 'primary',
            eventId: id,
            requestBody: evento.data,
        });

        console.log(new Date().toLocaleString()+'  -  '+'Evento Modificado a Estado:', es);
        return evento.data;
    } catch (error) {
        console.log(new Date().toLocaleString()+'  -  '+'Error al modificar el evento', error);
    }
}