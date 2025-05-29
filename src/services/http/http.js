import { upload, subida } from "../multer/index.js";
import { enviarMensaje } from '../mensajes/index.js'
import { getQr, estado } from './estado.js';
import { getAuthUrl, getRefreshToken, nuevosTokens  } from "../calendar/calendar.js";
import { postTokenTN } from "../TN/token.js";
import { getConfig, postConfig, getPrompt, postPrompt, getCuentas, postCuentas } from '../config/config.js';
import { getPacienteBusqueda } from "../pacientes/pacientes.js";
import { obtenerConfig } from '../global/config.global.js';
import { altaTurno, modifTurno } from '../turno/turno.js';
import { getDisponibilidad } from '../disponibilidad/disponibilidad.js';
import { servirHtml, getContentType } from '../renderHtml/index.js';
import path from 'path';
import fs from 'fs';

const root = process.cwd();
const config = await obtenerConfig();
// const port = Number(config.puerto) ?? 3000;
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

export const initServer = async (providers) => {
    
    //const app = providers[0].provider
    // const httpServer = providers[0].server
    // const ctx = providers[0].ctx
    // const provider = providers[0].provider
    
    let i = 0;
    providers.forEach(p => {   
        // Middleware para servir archivos estáticos
        p.provider.server.use((req, res, next) => {
            const filePath = path.join(root, 'src', 'public', req.url);
            fs.stat(filePath, (err, stats) => {
                if (!err && stats.isFile()) {
                    res.setHeader('Content-Type', getContentType(filePath));
                    fs.createReadStream(filePath).pipe(res);
                } else {
                    next();
                }
            });
        });

        p.provider.server.post('/upload', upload.single("myFile"), subida);
        
        p.provider.server.post('/config', postConfig)
        
        p.provider.server.post('/config/prompt', postPrompt)
        
        p.provider.server.post('/config/cuentas', postCuentas)
        
        p.provider.server.post('/config/turno', altaTurno)
        
        p.provider.server.put('/config/turno', modifTurno)
        
        p.provider.server.post('/config/tn', postTokenTN)    
    
        
        p.provider.server.get('/home', async (req, res) => {
            console.log(new Date().toLocaleString()+'  -  '+'index')
            return servirHtml(req, res, 'index.html');
        });

        p.provider.server.get('/nuevo', async (req, res) => {
            return servirHtml(req, res, 'nuevo.html');
        });
        
        p.provider.server.get('/paciente', async (req, res) => {
            // Para redirección en Polka, configura los encabezados manualmente
            res.writeHead(302, { 
                'Location': 'https://ccapp.mauasyasoc.com.ar/turnos/disponibilidad' 
            });
            // Finaliza la respuesta
            res.end();
            return servirHtml(req, res, 'paciente.html');
        });
        
        p.provider.server.get('/pp', async (req, res) => {
            return servirHtml(req, res, 'pp.html');
        });
        
        p.provider.server.get('/calendar', getAuthUrl);
        
        p.provider.server.get('/calendar/auth', getRefreshToken);
        
        p.provider.server.get('/calendar/nuevosTokens', nuevosTokens);
        
        p.provider.server.get('/config', getConfig);
        
        p.provider.server.get('/config/prompt', getPrompt);
        
        p.provider.server.get('/config/cuentas', getCuentas);
        
        p.provider.server.get('/config/paciente', getPacienteBusqueda);
        
        p.provider.server.get('/turnos', getDisponibilidad);    
   
        p.provider.server.get(`/estado/${p.nombre}`, p.ctx(async (bot, req, res) => {
            const es = estado(p.provider, bot);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: true, msgError: '', ...es }));
        }));
        p.provider.server.post(`/${p.nombre}`, p.ctx(async (bot, req, res) => {
            return enviarMensaje(bot, req, res, p.token);
        }));
        p.provider.server.get(`/${p.nombre}`, p.ctx(async (bot, req, res) => {
            getQr(bot, req, res, p.nombre);
        }));
        p.server(port+i)
        i++;
    });

}

