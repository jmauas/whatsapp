import { conDatoSuc } from '../../sql/index.js';
import { getPrompt } from '../../prompts/index.js';
import { obtenerConfig } from '../../global/config.global.js';

const config = await obtenerConfig();
const generatePromptDetermine = async () => {
    const PROMPT_DETERMINE = await getPrompt('1')
    return PROMPT_DETERMINE
}


//PREGUNTA_DEL_CLIENTE="{question}"
//y solo en el caso que no se lo hayas preguntado anteriormente


const generatePrompt = async (name, context) => {
    const PROMPT = await getPrompt('2')
    const DATA_BASE = context.join('\n---\n');
    let d = {};
    switch (config.base) {
        case 'nm':
            d.nombre = `${await conDatoSuc('NomFan')} ${await conDatoSuc('NomSuc')}`;
            d.tel = `${await conDatoSuc('Celu')} - ${await conDatoSuc('Telef')}`;
            d.domi = `${await conDatoSuc('Domi')} - ${await conDatoSuc('Localidad')} - ${await conDatoSuc('Provincia')}`;
            d.email = `${await conDatoSuc('Mail')}`;
            d.horario = `${await conDatoSuc('Horario')}`;
            d.web = `https://${await conDatoSuc(`Web`)}`;
            d.descrip = config.resto;
            break;
        case 'tn':
            d = {
                nombre: config.nombreConsultorio,
                tel: config.telefono,
                domi: config.domicilio,
                email: config.mail,
                horario: config.horarioAtencion,
                web: config.coberturas,
                descrip: config.resto
            }
            break;            
    }
    let res = PROMPT.replaceAll('{customer_name}', name).replaceAll('{context}', DATA_BASE)
    res = res.replaceAll('{nombre_empresa}', d.nombre).replaceAll('{telefono_empresa}', d.tel).replaceAll('{direccion_empresa}', d.domi)
    res = res.replaceAll('{email_empresa}', d.email).replaceAll('{horario_empresa}', d.horario).replaceAll('{sitio_web_empresa}', d.web);
    res = res.replaceAll('{descripcion_empresa}', d.descrip);
    return res;
}

export { generatePrompt, generatePromptDetermine }