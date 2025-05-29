import { cuentas, blackList, estadoBot as estado, actualizarCuentas as actualizar } from '../sql/cuentas.js';
import fs from 'fs/promises'
import path from 'path';
import { obtenerConfig } from '../global/config.global.js';

const config = await obtenerConfig();
const enJson = config.cuentas === 'json';
const root = process.cwd();

export const getCuentas = async () => {
    try {
        let data = [];
        if (enJson) {
            data = JSON.parse(await fs.readFile(path.join(root, 'locales', 'cuentas.json'), 'utf8'))
        } else {
            data = await cuentas();                
        }
        return  data;
    } catch (error) {
        return {ok: false, error};   
    }
};

export const getBlackList = async (id) => {
    try {
        let data = '';
        if (enJson) {
            const datos = JSON.parse(await fs.readFile(path.join(root, 'locales', 'cuentas.json'), 'utf8'))
            data = datos.find(c => c.id === id);
        } else {
            data = await blackList(id);      
        }
        return  data;
    } catch (error) {
        return {ok: false, error};   
    }
}

export const estadoBot = async (id, bot) => {
    try {
        if (enJson) {
            const root = process.cwd();
            let datos = JSON.parse(await fs.readFile(path.join(root, 'locales', 'cuentas.json'), 'utf8'))
            datos = datos.map(c => {
                if (c.id === id) {
                    c.bot = bot;
                }
                return c;
            });
            await fs.writeFile(path.join(root, 'locales', 'cuentas.json'), JSON.stringify(datos, null, 2));
            return true
        } else {
            await estado(id, bot);      
            return  true;
        }
    } catch (error) {
        console.log(new Date().toLocaleString()+'  -  '+error)
        return false;   
    }
}

export const actualizarCuentas = async (id, bot, nombre, bl, url) => {
    try {
        if (enJson) {
            const root = process.cwd();
            let datos = JSON.parse(await fs.readFile(path.join(root, 'locales', 'cuentas.json'), 'utf8'))
            datos = datos.map(c => {
                if (c.id === id) {
                    c.bot = bot;
                    c.nombre = nombre;
                    c.blackList = bl;
                    c.url = url;
                }
                return c;
            });
            await fs.writeFile(path.join(root, 'locales', 'cuentas.json'), JSON.stringify(datos, null, 2));
            return true
        } else {
            await actualizar(id, bot, nombre, bl, url);      
            return  true;
        }
    } catch (error) {
        console.log(new Date().toLocaleString()+'  -  '+error)
        return false;   
    }
}
