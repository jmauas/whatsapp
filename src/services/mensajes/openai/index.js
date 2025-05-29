import OpenAI from "openai";
import { obtenerConfig } from '../../global/config.global.js';

const config = await obtenerConfig();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * 
 * @param name 
 * @param history 
 */
const run = async (history, prompt, token) => {
    try {
        if (token && token != '') {           
            openai.apiKey = token;
        }
        const response = await openai.chat.completions.create({
            model: config.iaModel || 'gpt-3.5-turbo',
            messages: [
                {
                    "role": "system",
                    "content": prompt
                },
                ...history
            ],
            temperature: 0.5,
            max_tokens: 2048,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
        });
        return response.choices[0].message.content
    } catch (err) {
        console.log(new Date().toLocaleString()+'  -  '+`[ERROR]:`, err)
        return '';
    }
}

const runDetermine = async (history, prompt, token) => {
    try {
        if (token && token != '') {
            openai.apiKey = token;
        }
        const response = await openai.chat.completions.create({
            model: config.iaModel || 'gpt-3.5-turbo',
            messages: [
                {
                    "role": "system",
                    "content": prompt
                },
                ...history
            ],
            temperature: 0,
            max_tokens: 2048,
            top_p: 0.1,
            frequency_penalty: 0,
            presence_penalty: 0,
        });
        return response.choices[0].message.content
    } catch (err) {
        console.log(new Date().toLocaleString()+'  -  '+`[ERROR]:`, err)
        return '';
    }
}

export { run, runDetermine }


