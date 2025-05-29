import fs from 'fs/promises'
import path from 'path';
import { obtenerConfig } from '../global/config.global.js';
import { formatoFecha } from '../../utils/auxiliares.js';
import { convert } from 'html-to-text';

const config = await obtenerConfig();
const appIdTN = process.env.TN_APP_ID;
const grant = "authorization_code";
const client_secret = process.env.TN_CLIENT_SECRET;
const apiUrl = "https://api.tiendanube.com/v1";
const store = config.storeTN;
const token = config.tokenTN;
const root = process.cwd();

export const getProdsTN = async () => {
    try {
        let cant = 200;
        let page = 1;
        let prods = [];
        while (cant === 200) {
            const prodsPage = await getProdsTNPage(page);
            if (Array.isArray(prodsPage) && prodsPage.length > 0) {
                prods.push(...prodsPage.map(prod => {
                    return {
                        sku: prod.variants[0].sku,
                        IdP: prod.id,
                        titulo: prod.name.es,
                        descrip: convert(prod.description.es, { wordwrap: 130 }),
                        precioLista: '',
                        precio: prod.variants[0].promotional_price === null ? Number(prod.variants[0].price) : Number(prod.variants[0].promotional_price),
                        boniProd: 0,
                        cat: 0,
                        categoria: '',
                        link1: prod.canonical_url,
                        link2: prod.canonical_url,
                        vtes: prod.variants.map(variante => {
                            return {
                                id: variante.id,
                                nombre: variante.values.length > 0 ? variante.values[0].es : 'Único',
                                stock: variante.stock
                            }
                        })
                    }
                }));
                cant = prodsPage.length;
                page++;
            } else {
                cant = 0;
            }
        };
        console.log(new Date().toLocaleString()+'  -  '+'PRODUCTOS', prods.length);
        await fs.writeFile(path.join(root, 'locales', 'productosTN.json'), JSON.stringify(prods, null, 2));
    } catch (error) {
        console.log(new Date().toLocaleString()+'  -  '+error);
    }
}

export const getVentasTN = async () => {
    try {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() - 30);
        let cant = 200;
        let page = 1;
        let ventas = [];
        while (cant === 200) {
            const ventasPage = await getVentasTNPage(page, fecha);
            ventas = [...ventas, ...ventasPage];
            cant = ventasPage.length;
            page++;
        };
        console.log(new Date().toLocaleString()+'  -  '+'VENTAS', ventas.length);
        await fs.writeFile(path.join(root, 'locales', 'ventasTN.json'), JSON.stringify(ventas, null, 2));
    } catch (error) {
        console.log(new Date().toLocaleString()+'  -  '+error);
        return [];
    }
}

const getVentasTNPage = async (page, desde) => {
    try {
        const url = `${apiUrl}/${store}/orders?created_at_min=${formatoFecha(desde, false, false, true, false)}`;
        const ventas = await getTN(url);
        return ventas;
    } catch (error) {
        console.log(new Date().toLocaleString()+'  -  '+error);
        return [];
    }
}

const getProdsTNPage = async (page) => {
    try {
        const url = `${apiUrl}/${store}/products?page=${page}&published=true&per_page=200&fields=id,name,published,variants,canonical_url,description`;
        const prods = await getTN(url)
        return prods;
    } catch (error) {
        console.log(new Date().toLocaleString()+'  -  '+error);
        return [];
    }
}

const getTN = async (url) => {
    try {
        const res = await fetch(
            url,
            {
                headers: {
                    'Authentication': `bearer ${token}`,
                    'User-Agent': `NewManag (j@estudiomq.com.ar)`
                }
            }
        );
        const array = await res.json();
        return array;
    } catch (error) {
        console.log(new Date().toLocaleString()+'  -  '+error);
        return [];
    }
}