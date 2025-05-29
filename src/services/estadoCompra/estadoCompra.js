import { formatoFecha, formatoSepMiles } from '../../utils/auxiliares.js';
import { obtenerConfig } from '../global/config.global.js';
import { getVentaTNByCel } from '../TN/ventasTN.js';

const config = await obtenerConfig();

export const estadoCompra = async (ctx, f) => {
    try {
        switch (config.ventaTN) {
            case true:
                const venta = await getVentaTNByCel(ctx.fom);
                if (venta) {
                    return mensajeCompra(f, venta);
                } else {
                    return '';
                }
            default:
                return '';
        }            
    } catch (error) {
        console.log(new Date().toLocaleString()+'  -  '+'ERROR', error);
        return '';
    }
}

export const mensajeCompra = async (f, venta) => {
    let msg = `
${venta.customer.name}. Te detallamos la info de tu compra:
🔢 Número de Orden: ${venta.id}
📅 De fecha: ${formatoFecha(new Date(venta.completed_at.date), true, false, false, true)}
💲Importe Total $: ${formatoSepMiles(Number(venta.total), 0)}
🛒Items Comprados:

`;
    venta.products.map(item => {
        msg += `    ✔️ ${item.name} - ${item.quantity} x $ ${formatoSepMiles(Number(item.price))}\n`
    })
    if (venta.shipping_option && venta.shipping_option != null) {
        msg += `
                
🚚 Método de Envío: ${venta.shipping_option}

`;
    }
    switch (venta.shipping_status) {
        case 'unpacked':
            msg += `⏳ Estado: En Preparación.
                    `;
            break;
        case 'unshipped':
            msg += `📦 Estado: Empaquetado, Listo para Despachar.
                    `;
        case 'shipped':
            const fh = formatoFecha(new Date(venta.shipped_at), true, false, false, false);
            msg += `✅ Estado: Despachado el ${fh}`;
            break;
    }
    if (venta.shipping_tracking_url != null) {
        msg += `
🚛 Seguimiento en Línea: ${venta.shipping_tracking_url}
`;
    }
    f.flowDynamic(msg)
    return 'ok';
}