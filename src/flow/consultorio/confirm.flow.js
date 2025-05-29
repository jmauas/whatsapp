import { addKeyword, EVENTS } from "@builderbot/bot";
import { getPaciente } from "../../services/pacientes/pacientes.js";
import { registrarFlow } from "./registrar.flow.js";
import { pedirDatosFlow } from "./pedirDatos.flow.js";
import { arraySi } from '../utils/utils.js';

export const confirmFlow = addKeyword(EVENTS.ACTION)
    .addAction(async (ctx, f) => {
        const datos = await getPaciente('celular', ctx.from);
        if (!datos || !datos.ok || !datos.paciente || datos.paciente.length === 0) {
            f.gotoFlow(pedirDatosFlow);
            return;
        }
        const paciente = datos.paciente[0];
        await f.flowDynamic(`Ya tenemos tus datos registrados. Confirmanos si estan ok. ! 🎉`)
        await f.flowDynamic(`Nombre: ${paciente.nombre} ${paciente.apellido}`);
        await f.flowDynamic(`DNI: ${paciente.dni}`);
        await f.flowDynamic(`Email: ${paciente.email}`);
        await f.flowDynamic(`Cobertura: ${paciente.cobertura}`);
        await f.flowDynamic(`Si estan bien, respondé si. ✅`);
        await f.flowDynamic(`Si querés modificar algo, respondé no. ❌`);
        await f.state.update({ paciente: paciente });
    })
    .addAction({ capture: true },
        async (ctx, f) => {
            if (arraySi.includes(ctx.body.toLowerCase())) {
                const paciente = f.state.get('paciente');
                await f.state.update({ nombre: paciente.nombre })
                await f.state.update({ apellido: paciente.apellido })
                await f.state.update({ dni: paciente.dni })
                await f.state.update({ email: paciente.email })
                await f.state.update({ cobertura: paciente.cobertura })
                f.gotoFlow(registrarFlow);
            } else {
                f.gotoFlow(pedirDatosFlow);
            }
        })