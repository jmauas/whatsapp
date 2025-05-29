import { getPrompt } from '../../prompts/index.js';
import { obtenerConfig } from '../../global/config.global.js';

const config = await obtenerConfig();
const generatePromptDetermine = async () => {
    const PROMPT_DETERMINE = await getPrompt('ConsultaBD')
    return PROMPT_DETERMINE
}


const generatePrompt = async (name, datosRespuesta) => {
    const PROMPT = await getPrompt('RespuestaBD')
    let res = PROMPT.replaceAll('{datos_respuesta}', datosRespuesta);
    return res;
}

export { generatePrompt, generatePromptDetermine }