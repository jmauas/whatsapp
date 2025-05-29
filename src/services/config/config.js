import { exec } from 'child_process';
import { getCuentas as get, actualizarCuentas } from '../cuentas/cuentas.js';
import { obtenerConfig,  registrarConfig, obtenerPrompt, registrarPrompt } from '../global/config.global.js';


export const getConfig = async (req, res) => {
    let config = await obtenerConfig();
    config = await {...config, tokenTN: '', storeTN: ''};
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(config));
    return;
}

export const postConfig = async (req, res) => {
    try {
        const config = await req.body;
        const config2 = await obtenerConfig();
        config.tokenTN = config2.tokenTN;
        config.storeTN = config2.storeTN;
        await registrarConfig(config);
        //await agendarWa();
        res.writeHead(200, { 'Content-Type': 'application/json' })
        if (config.reiniciar) {
            exec('npm restart', (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error al ejecutar el comando: ${error} - ${stderr}`);
                    return res.end('Error al reiniciar el servidor');
                }
                console.log(new Date().toLocaleString()+'  -  '+`Resultado de la ejecución del comando: ${stdout}`);
                return res.end(JSON.stringify({ ok: true }));
            });
        } else {
            return res.end(JSON.stringify({ ok: true }));
        }
    } catch (error) {
        console.log(new Date().toLocaleString()+'  -  '+error);
        res.end(JSON.stringify({ ok: false }));
        return;
    }
}

export const getPrompt = async (req, res) => {
    const nombre = req.query.nombre;
    const prompt = await obtenerPrompt(nombre);
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ prompt: prompt }));
    return;
}

export const postPrompt = async (req, res) => {
    try {
        const nombre = req.query.nombre;
        const prompt = await req.body;
        res.writeHead(200, { 'Content-Type': 'application/json' })
        if (!nombre || !prompt.prompt || prompt.prompt.length < 20) {
            res.status(400).send('Falta el nombre del prompt');
            return;
        }
        await registrarPrompt(prompt.prompt, nombre);
        return res.end(JSON.stringify({ ok: true }));
    } catch (error) {
        console.log(new Date().toLocaleString()+'  -  '+error);
        res.end(JSON.stringify({ ok: false }));
        return;
    }
}


export const getCuentas = async (req, res) => {
    let cuentas = await get();
    cuentas = cuentas.map(c => {
        delete c.token;
        return c;
    });
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ cuentas: cuentas }));
    return;
}

export const postCuentas = async (req, res) => {
    try {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        const cuentas = await req.body.cuentas;
        cuentas.map(async c => {
            await actualizarCuentas(c.id, c.bot, c.nombre, c.blackList, c.url);
        });
        return res.end(JSON.stringify({ ok: true }));
    } catch (error) {
        console.log(new Date().toLocaleString()+'  -  '+error);
        res.end(JSON.stringify({ ok: false }));
        return;
    }
}

export const registrarTokenTN = async (store, token) => {
    const config = await obtenerConfig();
    config.tokenTN = token;
    config.storeTN = store;
    await registrarConfig(config);
    return;
}
