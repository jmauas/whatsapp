import fs from 'fs';
import path from 'path';
import util from 'util';

const root = process.cwd();
const ruta = process.env.RUTA_OPENSSL;

export const deleteFiles = (nombre) => {
    try {
        fs.unlinkSync(path.join(root, `${nombre}_sessions`, 'baileys_store.json'));	
    } catch {

    }
}


export const existeFrase = async (history, frase) => {
    if (!history) return false;
    if (!Array.isArray(history)) return false;
    if (history.length === 0) return false;
    frase = frase.toLowerCase();
    for await (let h of history) {
        if (h.content) {
            const txt = h.content.toLowerCase();
            if (txt.indexOf(frase) >= 0) {
                return true;
            }
        }
    }
    return false;
}

