import { addKeyword, EVENTS } from "@builderbot/bot";
import { validarEmail } from "../../utils/auxiliares.js";
import { registrarFlow } from "./registrar.flow.js";
import { consultorioFlow } from "./consultorio.flow.js";

export const pedirDatosFlow = addKeyword(EVENTS.ACTION)
    .addAnswer(`Te voy a pedir Algunos Datos, para Agendar. 📅`)
    .addAnswer(`Si en algun punto queres cancelar el registro del turno, respondé cancelar. ❌`)
    .addAnswer(`¿ Como es tu nombre completo ?  📝`,
        { capture: true },
        async (ctx, f ) => {
            if (ctx.body.toLowerCase() == 'cancelar') {
                f.state.clear();
                f.endFlow();
            }

            if(ctx.body.length < 5) {
                 return f.fallBack('Nombre muy Corto. ❌')
            }
            await f.state.update({ nombre: ctx.body })
        }
    ).addAnswer('Ahora te pido tu número de documento. 📄',
        { capture: true },
        async(ctx, f) => {                
            if (ctx.body.toLowerCase() == 'cancelar') {
                f.state.clear();
                f.endFlow();
            }
            if(ctx.body.length < 6) {
                return f.fallBack('DNI Inválido. ! ❌')
            }
            await f.state.update({dni: ctx.body.toLowerCase()})
        }
    ).addAnswer(`Si te parece, ingresà un email, para recibir notificación de la confirmación del Turno.
        Si no, simplemente responde NO.`, { capture: true },
        async(ctx, f) => {                
            if (ctx.body.toLowerCase() == 'cancelar') {
                f.state.clear();
                f.endFlow();
            }
            if (ctx.body.toLowerCase() == 'no') ctx.body = ''
            if(!validarEmail(ctx.body) && ctx.body.toLowerCase() != 'no') {
                return f.fallBack('EMail inválido ! ❌')
            }
            await f.state.update({email: ctx.body.toLowerCase()})
        }
    ).addAnswer(`Por Último, decime que cobertura médica y plan tenés, o si es particular.`,
        { capture: true },
        async(ctx, f) => {                
            if (ctx.body.toLowerCase() == 'cancelar') {
                f.state.clear();
                f.endFlow();
            }
            if(ctx.body.length < 4) {
                return f.fallBack('Muy Corto. ! ❌')
            }
            await f.state.update({ cobertura: ctx.body })
            f.gotoFlow(registrarFlow)
        }
    )