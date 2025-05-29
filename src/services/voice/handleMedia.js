import fs from 'fs/promises';
import path from 'path';
const root = process.cwd();

import { voiceToText } from '../mensajes/openai/whisper.js';

export const handleVoice = async (ctx, provider) => {
  const pathTmpMp3 = await provider.saveFile(ctx, {path: path.join(root, `uploads`)});
  const text = await voiceToText(pathTmpMp3);
  try {
    fs.unlink(pathTmpOgg);
    fs.unlink(pathTmpMp3);
  } catch (e) { }
  return text;
  
};