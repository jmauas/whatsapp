import fs from 'fs/promises'
import path from 'path';


export const getVentaTNByCel = async (cel) => {
    try {
        const ventas = await getVentasTN();
        const celu = `+${cel}`;
        const venta = ventas.find(venta => venta.customer.phone === celu);
        if (venta) {
            return venta;
        } else {
            return {};
        }
    } catch (error) {
        console.log(new Date().toLocaleString()+'  -  '+'ERROR', error);
        return {};
    }
}

export const getVentaTNByDni = async (dni) => {
    try {
        const ventas = await getVentasTN();
        const celu = `+${ctx.from}`;
        const venta = ventas.find(venta => venta.customer.identification == dni);
        if (venta) {
            return venta;
        } else {
            return {};
        }
    } catch (error) {
        console.log(new Date().toLocaleString()+'  -  '+'ERROR', error);
        return {};
    }
}

export const getVentaTNById = async (id) => {
    try {
        const ventas = await getVentasTN();
        const venta = ventas.find(venta => venta.number == id);
        if (venta) {
            return venta;
        } else {
            return {};
        }
    } catch (error) {
        console.log(new Date().toLocaleString()+'  -  '+'ERROR', error);
        return {};
    }
}

const getVentasTN = async () => {
    try {
        const root = process.cwd();
        const ventas = JSON.parse(await fs.readFile(path.join(root, 'locales', 'ventasTN.json'), 'utf8'))
        return ventas;
    } catch (error) {
        console.log(new Date().toLocaleString()+'  -  '+'ERROR', error);
        return [];
    }
}

