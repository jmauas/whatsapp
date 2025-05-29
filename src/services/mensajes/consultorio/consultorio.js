import { run, runDetermine } from '../openai/index.js';
import { runClaude } from '../anthropic/index.js';
import { runGemini } from '../gemini/index.js';
import { generatePromptConsultorio, generatePromptServicio } from './prompt.js';
import { obtenerConfig }  from '../../global/config.global.js';

const config = await obtenerConfig()
const servicio = config.ia || 'openai';

export const runChatConsultorio = async (mensajes, ctx, f) => {
    const prompt = await generatePromptConsultorio(ctx, f);

    switch (servicio) {
        case 'openai':
            return run(mensajes, prompt);
        case 'anthropic':
            return runClaude(false, mensajes, prompt)
        case 'gemini':
            return runGemini(false, mensajes, prompt)
        default:
            return null;
    }

}

export const runChatServicio = async (mensajes, f, tipo) => {
    const prompt = await generatePromptServicio(f, tipo);

    switch (servicio) {
        case 'openai':
            return runDetermine(mensajes, prompt);
        case 'anthropic':
            return runClaude(true, mensajes, prompt)
        case 'gemini':
            return runGemini(true, mensajes, prompt)
        default:
            return null;
    }

}