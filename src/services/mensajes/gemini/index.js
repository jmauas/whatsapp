import { GoogleGenerativeAI } from "@google/generative-ai";
import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import { obtenerConfig } from '../../global/config.global.js';

const config = await obtenerConfig();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const runGemini = async (determine, mensajes, prompt) => {
    try {
        const temp = determine ? 0.0 : 0.5;
        const tokens = determine ? 50 : 1024;
        
        const model = genAI.getGenerativeModel({
            model: config.iaModel,
            generationConfig: {
                maxOutputTokens: tokens,
                temperature: temp,
            },
            safetySettings: [
                {
                    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                    threshold: HarmBlockThreshold.BLOCK_NONE,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                    threshold: HarmBlockThreshold.BLOCK_NONE,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                    threshold: HarmBlockThreshold.BLOCK_NONE,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                    threshold: HarmBlockThreshold.BLOCK_NONE,
                },
            ],
        });
        
        let history = mensajes.length > 1 ? mensajes.slice(0, -1) : [];
        let mensaje = mensajes[mensajes.length - 1].content;

        prompt += `
        <Mensajes Anteriores>` 
        history.map((h) => {
            prompt += `
            <Mensaje>
                <Role>${h.role}</Role>
                <Content>${h.content}</Content>
            </Mensaje>
            ` 
        });
        prompt += `
        </Mensajes Anteriores>
        <Mensaje Actual a Responder>
            <Role>user</Role>
            <Content>${mensaje}</Content>
        </Mensaje Actual a Responder>
        `;
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        return text;
    } catch (err) {
        console.log(new Date().toLocaleString()+'  -  '+`[ERROR]:`, err)
        return '';
    }
}