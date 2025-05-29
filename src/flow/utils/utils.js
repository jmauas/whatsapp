import { getBlackList, estadoBot } from '../../services/cuentas/cuentas.js';
import { existeFrase } from '../../services/utils/index.js';
import { pedirEventos } from '../../services/calendar/calendar.js';
import { formatoFecha, esNumero, formatoSepMiles } from '../../utils/auxiliares.js';
import { obtenerConfig } from '../../services/global/config.global.js';
import puppeteer from 'puppeteer';
import path from 'path';

export const tiempoEspera = 1000 * 60 * 15; //15 minutos

export const botActivo = async (ctx, f) => {
    try {
        if (f && f.provider && f.provider.globalVendorArgs && f.provider.globalVendorArgs.id) {
            const idCuenta = f.provider.globalVendorArgs.id;
            const cuenta = f.provider.globalVendorArgs.name;
            const cmd = await comandos(idCuenta, ctx, f);
            console.log(new Date().toLocaleString()+'  -  '+`[INFO]:`, cmd)
            if (!cmd) return false;
            const dato = await getBlackList(idCuenta);
            const bot = dato.bot;
            const bl = dato.blackList;
            if (!bot) {
                console.log(new Date().toLocaleString()+'  -  '+`[INFO]:`, `Cuenta ${cuenta} sin Bot.`)
                return false;
            }
            if (bl && bl != '') {
                const tel = ctx.from.replace('549', '');
                if (bl.includes(tel)) {
                    console.log(new Date().toLocaleString()+'  -  '+`[INFO]:`, `Se terminó el flujo ${ctx.from} por estar en la blacklist`)
                    return false;
                }
            }
            return true;
        }
        console.log(new Date().toLocaleString()+'  -  '+`[INFO]:`, `Sin Datos Bot`)
        return false;
    } catch (error) {
        console.log(new Date().toLocaleString()+'  -  '+`[ERROR]:`, error)
        return true;
    }
}

export const validarUsuario = async (ctx) => {
    let config = await obtenerConfig();
    if (config && config.validaciones && config.validaciones.length > 0) {
        const valido = config.validaciones.find((val) => {
            if (ctx.from.indexOf(val.numero)>=0) return true;
        });
        if (valido) {
            if (valido.activo === true) {
                return {
                    ok: true,
                    bd: valido.base,
                    token: valido.token
                }
            }
        }
    }
    return {ok: false}
}

const comandos = async (id, ctx, f) => {
    const msg = ctx.body.toLowerCase();
    let index = msg.indexOf('#desactivar')
    if (index >= 0) {
        await estadoBot(id, false);
        let min = '';
        if (msg.length > index + 11) {
            min = msg.substring(index + 11);
            min = min.trim();
            if (esNumero(min)) {
                setTimeout(() => {
                    estadoBot(id, true);
                    console.log(new Date().toLocaleString()+'  -  '+`[INFO]:`, 'Se Activa por tiempo')
                }, parseInt(min) * 1000 * 60);
            }
        }
        let res = `Se Desactiva el Bot por comando desactivar`
        if (min != '') res += ` por ${min} minutos`
        console.log(new Date().toLocaleString()+'  -  '+`[INFO]:`, res)
        f.flowDynamic(res);
        f.endFlow();
        return false;
    } else if (msg.indexOf('#activar') >= 0) {
        await estadoBot(id, true);
        let res = `Se Activa por comando activar`;
        console.log(new Date().toLocaleString()+'  -  '+`[INFO]:`, res)
        f.flowDynamic(res);
        f.endFlow();
        return true;
    } else {
        return true;
    }
}

export const controlTiempo = async (ctx, f) => {
    const lastMessage = f.state.getMyState()?.lastMessage ?? new Date()
    if (new Date().getTime() - lastMessage.getTime() > tiempoEspera) {
        f.state.update({ history: [] })
        f.endFlow();
        console.log(new Date().toLocaleString()+'  -  '+`[INFO]:`, `Se terminó el flujo ${ctx.from} por inactividad`)
    }
}

export const controlHumano = async (ctx, f, newHistory) => {
    let humano = await existeFrase(newHistory, '#humano1#')
    if (humano) return true;
    f.provider.store.messages[ctx.key.remoteJid].array.map(m => {
        m.message && m.message.extendedTextMessage &&
            m.message.extendedTextMessage.text.toLowerCase().indexOf('#humano1#') >= 0
            ? humano = true
            : null
    })
    f.provider.store.messages[ctx.key.remoteJid].array.map(m => {
        m.message && m.message.conversation &&
            m.message.conversation.toLowerCase().indexOf('#humano1#') >= 0
            ? humano = true
            : null
    })
    return humano
}

export const handleHistory = async (inside, _state) => {
    const history = _state.get('history') ?? []
    history.push(inside)
    await _state.update({ history })
}

export const getHistory = (_state, k = 6) => {
    const history = _state.get('history') ?? []
    const limitHistory = history.slice(-k)
    return limitHistory
}

export const getHistoryParse = (_state, k = 6) => {
    const history = _state.get('history') ?? []
    const limitHistory = history.slice(-k)
    return limitHistory.reduce((prev, current) => {
        const msg = current.role === 'user' ? `\nCliente: "${current.content}"` : `\nVendedor: "${current.content}"`
        prev += msg
        return prev
    }, ``)
}

export const consultarTurnos = async (turnos) => {
    let res = ''
    if (turnos && turnos.length > 0) {
        res = 'Estos son los turnos que tenes agendados:\n';
        turnos.map((turno) => {
            const nombre = turno.extendedProperties && turno.extendedProperties.private && turno.extendedProperties.private ? turno.extendedProperties.private.nombre : '';
            const servicio = turno.extendedProperties && turno.extendedProperties.private && turno.extendedProperties.private ? turno.extendedProperties.private.servicio : '';
            res += `✅ Fecha: ${formatoFecha(turno.start.dateTime, true, true, false, true)}
🧑‍⚕️ Paciente: ${nombre}
🦷 Tipo Turno: ${servicio}

`
        })
    }
    return res;
}

export const buscarTurnos = async (ctx) => {
    let celular = ctx.from;
    const data = await pedirEventos(new Date(), null);
    if (data & data.ok) {
        let turnos = data.eventos;
        turnos = turnos.filter((turno) => {
            if (turno.extendedProperties && turno.extendedProperties.private && turno.extendedProperties.private.celular) {            
                if (turno.extendedProperties.private.celular === celular) {
                    const titulo = turno.summary.toLowerCase();
                    let es = true;
                    if (titulo.indexOf('cancelado') >= 0) es = false;
                    return es;
                } else {
                    return false
                }
            } else {
                return false
            }
        });
        return turnos;
    } else {
        return [];
    }
}

export const buscarTurnosByDNI = async (dni) => {
    const data = await pedirEventos(new Date(), null);
    if (data & data.ok) {
        let turnos = data.eventos;
        turnos = turnos.filter((turno) => {
            if (turno.extendedProperties && turno.extendedProperties.private && turno.extendedProperties.private.dni) {
                if (turno.extendedProperties.private.dni === dni) {
                    const titulo = turno.summary.toLowerCase();
                    let es = true;
                    if (titulo.indexOf('cancelado') >= 0) es = false;
                    return es;
                } else {
                    return false
                }
            } else {
                return false
            }
        });
        return turnos;
    } else {
        return [];

    }
}


export const arraySi = ['si', 'ok', 'acepto', 'confirmo', 'correcto', '✅', 'sí', '☑️', '✔️', '👍', '🆗'];

export const unificarTipos = (doctores) => {
    let tipos = [];
    if (!doctores || !Array.isArray(doctores)) return tipos;
    doctores.map((doctor) => {
        if (!doctor.tiposTurno || !Array.isArray(doctor.tiposTurno)) return;
        doctor.tiposTurno.map((tipo1) => {
            const control = tipos.filter(tipo2 => tipo2.nombre == tipo1.nombre);
            if (control.length === 0) {
                tipos.push(tipo1);
            } else {
                if (Number(control[0].dias) < Number(tipo1.dias)) {
                    tipos[tipos.indexOf(control[0])].dias = tipo1.dias;
                }
            }
        })
    })
    return tipos;
}

export const array2Img = async (array) => {
    const tableHtml = `
        <html>
        <head>
            <style>
                table {
                    border-collapse: collapse;
                    font-family: Coolvetica,system-ui,sans-serif;
                }
                th, td {
                    border: 1px solid black;
                    padding: 10px;
                    text-align: left;
                }
                th {
                    background-color: #f2f2f2;
                    text-align: center;
                }
            </style>
        </head>
        <body>
            <table>
                <thead>
                    <tr>
                        ${Object.keys(array[0]).map(key => `<th>${key}</th>`).join('')}
                    </tr>
                </thead>
               <tbody>
                    ${array.map(row => `
                        <tr>
                            ${Object.values(row).map(value => `
                            <td>${typeof value == 'object' 
                                    ? formatoFecha(value, true, true, false, true) 
                                    : value
                            }</td>`).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </body>
        </html>
    `;
    let browser
    const imgName = `img-${Date.now()}.png`;
    const root = process.cwd();
    const imgPath = path.join(root, 'uploads', imgName);
    try {
        browser = await puppeteer.launch({
            headless: false,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setContent(tableHtml, { waitUntil: 'networkidle0' });
        const table = await page.waitForSelector('table');
        await table.screenshot({ path: imgPath, optimizeForSpeed: true, type: 'png'});
    } catch (error) {
        console.error('Error generating table image:', error);
    } finally {
        if (browser) {
            await browser.close();
        }
        return imgPath;
    }
}