import fs from 'fs/promises'
import path from 'path';

export const obtenerConfig = async () => {
    try {
        const root = process.cwd();
        const datos = JSON.parse(await fs.readFile(path.join(root, 'locales', 'config.json'), 'utf8'))
        if (datos) {
            return datos;
        } else {
            return {};
        }
    } catch (error) {
        console.log(new Date().toLocaleString()+'  -  '+error)
        return {};   
    }
}

export const registrarConfig = async (datos) => {
    try {
        const root = process.cwd();
        await fs.writeFile(path.join(root, 'locales', 'config.json'), JSON.stringify(datos, null, 2));
        return true;
    } catch (error) {
        console.log(new Date().toLocaleString()+'  -  '+error);
        return false;
    }       
}

export const obtenerPrompt = async (nombre) => {
    try {
        const root = process.cwd();
        const datos = await fs.readFile(path.join(root, 'locales', `${nombre}.txt`), 'utf8')
        if (datos) {
            return datos;
        } else {
            return '';
        }
    } catch (error) {
        console.log(new Date().toLocaleString()+'  -  '+error)
        return '';   
    }
}

export const registrarPrompt = async (datos, nombre) => {
    try {
        const root = process.cwd();
        await fs.writeFile(path.join(root, 'locales', `${nombre}.txt`), datos, 'utf8');
        return true;
    } catch (error) {
        console.log(new Date().toLocaleString()+'  -  '+error);
        return false;
    }       
}

