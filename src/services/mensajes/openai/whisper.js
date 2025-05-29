import fs from "fs";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 *
 * @param {*} path url mp3
 */
export const voiceToText = async (path, token) => {
  if (!fs.existsSync(path)) {
    throw new Error("No se encuentra el archivo");
  }
  if (token && token != '') {
    openai.apiKey = token;
  }
  try {
      const transcription = await openai.audio.transcriptions.create({
          file: fs.createReadStream(path),
          model: "whisper-1"
      })
    
  
        return transcription.text;
  } catch (err) {
    console.log(new Date().toLocaleString()+'  -  '+err)
    return "ERROR";
  }
};
