import { select, execute } from './index.js';


export const cuentas = async () => {
    const sql = `SELECT id, nombre, token, IsNull(bot, 'False') as bot, IsNull(blackList, '') as blackList
         FROM cuentasWhatsapp order by nombre asc`;
    let data = await select(sql);
    if (data.error == false) {
        if (data.datos && data.datos.length > 0) {
            return data.datos;
        } else {
            return [];
        }
    } else {
        return [];
    }
}

export const blackList = async (id) => {
	const sql = `SELECT blackList, IsNull(bot, 'False') as bot FROM cuentasWhatsapp WHERE id=${id}`;
    let data = await select(sql);
    if (data.error == false) {
        return data.datos[0];
    } else {
        return '';
    }
}

export const estadoBot = async (id, es) => {
	const sql = `UPDATE cuentasWhatsapp SET Bot bot='${es}' WHERE id=${id}`;
    let data = await execute(sql);
    if (data.error == false) {
        return true;
    } else {
        return false;
    }
}

export const actualizarCuentas = async (id, bot, nombre, bl, url) => {
    const sql = `UPDATE cuentasWhatsapp SET bot='${bot}', nombre='${nombre}', blackList='${bl}', url='${url}' WHERE id=${id}`;
    let data = await execute(sql);
    if (data.error == false) {
        return true;
    } else {
        return false;
    }
}