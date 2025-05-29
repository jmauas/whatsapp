import { run, runDetermine } from '../openai/index.js';
import { runClaude } from '../anthropic/index.js';
import { runGemini } from '../gemini/index.js';
import { generatePrompt, generatePromptDetermine } from './prompt.js';
import { obtenerConfig }  from '../../global/config.global.js';

const config = await obtenerConfig()
const servicio = config.ia || 'openai';

export const runChat = async (determine, mensajes, name, datosRespuesta, token) => {
    
    const prompt = determine ? await generatePromptDetermine() : await generatePrompt(name, datosRespuesta);
    
    switch (servicio) {
        case 'openai':
            return determine ? runDetermine(mensajes, prompt, token) : run(mensajes, prompt, token);
        case 'anthropic':
            return runClaude(determine, mensajes, prompt)
        case 'gemini':
            return runGemini(determine, mensajes, prompt)
        default:
            return null;
    }

}