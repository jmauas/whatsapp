import path from 'path';
const root = process.cwd();
import fs from 'fs';

export const servirHtml = async (req, res, archivo) => {
    const filePath = path.join(root, 'src', 'public', archivo)
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.end('Error loading file');
        return;
      }
      res.setHeader('Content-Type', 'text/html');
      res.end(data);
    });
}

// Función para obtener el tipo de contenido basado en la extensión del archivo
export const getContentType = (filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
        case '.html': return 'text/html';
        case '.js': return 'application/javascript';
        case '.css': return 'text/css';
        case '.json': return 'application/json';
        case '.png': return 'image/png';
        case '.jpg': return 'image/jpeg';
        case '.gif': return 'image/gif';
        default: return 'application/octet-stream';
    }
};