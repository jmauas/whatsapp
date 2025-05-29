import fs from 'fs/promises'
import path from 'path';

export const  getPrompt = async (id) => {
    try {
        const root = process.cwd();
        const data = await fs.readFile(path.join(root, 'locales', `prompt${id}.txt`), 'utf8')
        //console.log(new Date().toLocaleString()+'  -  '+data);
    return  data;
    } catch (error) {
        console.log(new Date().toLocaleString()+'  -  '+error);
        return {ok: false, error};   
    }
 };