import BotWhatsapp from '@builderbot/bot';
import { botActivo, validarUsuario } from '../utils/utils.js';
import { consultaBDFlow } from './consultasBD.js';

export const seleccionBDFlow = BotWhatsapp.addKeyword(['base'])
    .addAction(async (ctx, f) => {
        try {
            const activo = await botActivo(ctx, f)
            if (!activo) {
                f.endFlow();
                return;
            }

            const usuario = await validarUsuario(ctx)
            if (!usuario.ok) {
                await f.flowDynamic(`🚫 No tenes permisos para realizar consultas a la base de datos. 🚫`)
                f.endFlow();
                return;
            }            
            
            let bd = usuario.bd.split(';');
            if (bd.length > 1) {
                await f.flowDynamic(`📚 Seleccioná la base de Datos a Consultar 📚`)
                let i = 1;
                for await (let b of bd) {
                    await f.flowDynamic(`${i} 🔹 ${b} 🔹`)
                    i++;
                }
                return f.gotoFlow(seleccionBDFlow2)
            } else {
                f.state.update({bd: bd[0]});
            }

            console.log(new Date().toLocaleString()+'  -  '+'BASE', f.state.bd);
            ctx.body = f.state.pregunta || '';
            return f.gotoFlow(consultaBDFlow)
        }catch(err){
            console.log(new Date().toLocaleString()+'  -  '+`${new Date().toLocaleString()} - [ERROR]:`, err)
        }
    })


    export const seleccionBDFlow2 = BotWhatsapp.addKeyword(BotWhatsapp.EVENTS.ACTION)
        .addAnswer(`📚 Ingresá el Número de la Base: 📚`,
        { capture: true },
        async (ctx, f ) => {            
            const usuario = await validarUsuario(ctx)
            let bd = usuario.bd.split(';');
            bd = bd.map((b) => b.trim());
            let i = ctx.body.trim();
            if (!i || isNaN(i)) {
                return f.fallBack(`🚫 Número de Base Incorrecto. 🚫`)
            }
            i = parseInt(i);
            if (i < 1 || i > bd.length) {
                return f.fallBack(`🚫 Número de Base Incorrecto. 🚫`)
            }
            await f.state.update({bd: bd[i-1]});
            await f.flowDynamic(`Base Seleccionada🔹 ${bd[i-1]} 🔹`)
            console.log(new Date().toLocaleString()+'  -  '+'BASE', f.state.bd);
            ctx.body = f.state.get('pregunta') || '';
            return f.gotoFlow(consultaBDFlow)
        })
