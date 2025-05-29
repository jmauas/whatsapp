import Anthropic from '@anthropic-ai/sdk';
import { obtenerConfig }  from '../../global/config.global.js';

const config = await obtenerConfig();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const model = config.iaModel || 'claude-3-sonnet-20240229';

export const runClaude = async (determine, mensajes, prompt) => {
    try {
        const temp = determine ? 0 : 0.5;
        const tokens = determine ? 50 : 1024;
        const top_p = determine ? 0.1 : 1;

        const msgs = controlMensajes(mensajes);
        
        const message = await anthropic.messages.create({
            max_tokens: tokens,
            messages: msgs,
            model: model,
            system: prompt,
            temperature: temp,
            top_p: top_p
        });

        return message.content[0].text;
    } catch (err) {
        console.log(new Date().toLocaleString()+'  -  '+`[ERROR]:`, err)
        return '';
    }
}

const controlMensajes = (mensajes) => {
    let mensajesControlados = [];
    let i = 0;
    mensajes.map((mensaje) => {
        if (i===0) {
            mensajesControlados.push(mensaje);
        } else {
            if (mensaje.role === mensajesControlados[mensajesControlados.length-1].role) {
                mensajesControlados[mensajesControlados.length-1].content += ' ' + mensaje.content;
            }
        }
    });
    return mensajesControlados;
}

