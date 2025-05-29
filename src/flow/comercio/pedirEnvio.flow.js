import { addKeyword, EVENTS } from "@builderbot/bot";
import { esNumero } from '../../utils/auxiliares.js';
import { productosFlow } from "./productos.flow.js";
import { mensajeCompra } from '../../services/estadoCompra/estadoCompra.js';
import { getVentaTNByDni, getVentaTNById } from '../../services/TN/ventasTN.js';

export const pedirEnvioFlow = addKeyword(EVENTS.ACTION)
    .addAnswer(`Te voy a pedir que ingreses a continuación el número # de pedido. 🔎`)
    .addAnswer(`Si no lo tenés a mano, podemos intentar buscarlo por el número de DNI o CUIT con el que te registrste. Para ello, ingresa la palabra dni o cuit, y luego el número. 🆔`)
    .addAnswer(`Si preferis cancelar la busqueda, respondé cancelar. ❌`,
        { capture: true },
        async (ctx, f ) => {
            if (ctx.body.toLowerCase() == 'cancelar') {
                f.state.clear();
                f.endFlow();
                return;
            }
            let id = ctx.body.replaceAll(' ', '')
            id = id.trim();
            if(esNumero(id)) {
                const venta = await getVentaTNById(id);
                if (venta) {
                    await mensajeCompra(f, venta);
                    f.state.clear();
                    return;
                } else {
                    return f.fallBack('No se encontró ese ID. ❌')
                }
            } else if (id.toLowerCase().includes('dni') || id.toLowerCase().includes('cuit')) {
                id = id.toLowerCase();
                id = id.replaceAll('dni', '')
                id = id.replaceAll('cuit', '')
                id = id.trim();
                if(esNumero(id)) {
                    const venta = await getVentaTNByDni(id);
                    if (venta) {
                        await mensajeCompra(f, venta);
                        f.state.clear();
                        return;
                    } else {
                        return f.fallBack('No se encontró ese DNI o CUIT. ❌')
                    }
                } else {
                    return f.fallBack('DNI o CUIT inválido. ❌')
                }
            }
        }
    )