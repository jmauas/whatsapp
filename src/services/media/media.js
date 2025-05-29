import fs from "fs";
import path from 'path';
const root = process.cwd();

export default function media(m) {
    const file = fs.readFileSync(path.join(root, 'uploads', m));
    const ext = path.extname(m).toLowerCase();
    const nombre = path.basename(m);
    switch (ext) {
        case '.jpg':
        case '.jpeg':
        case '.png':
        case '.gif':
        case '.bmp':
        case '.tif':
        case '.tiff':
        case '.webp':
            return {
                image: file,
                caption: nombre,
            };
        case '.mp4':
        case '.mov':
        case '.avi':
        case '.mkv':
            return {
                video: file,
                caption: nombre,
                // gifPlayback: true,
            };
        case '.mp3':
        case '.wav':
        case '.ogg':
        case '.m4a':
        case '.flac':
            return {
                audio: file,
                caption: nombre,
            };
        default:
            return {
                document: file,
                caption: nombre,
                fileName: nombre,
                mimetype: mime(ext)
            };        
    }
            
}

const mime = (ext) => {
    switch (ext) {
        case '.pdf':
            return 'application/pdf';
        case '.xls':
        case '.xlsx':
            return 'application/vnd.ms-excel';
        case '.doc':
        case '.docx':
            return 'application/msword';
        case '.txt':
            return 'text';
        case 'csv':
            return 'text/csv';
            case '.zip':
            case '.rar':
                return 'application/zip';
            case '.tar':
                return 'application/x-tar';
            case '.7z':
                return 'application/x-7z-compressed';
            case '.gz':
                return 'application/gzip';
            case '.bz2':
                return 'application/x-bzip2';
            case '.xz':
                return 'application/x-xz';
            case '.json':
                return 'application/json';
            case '.xml':
                return 'application/xml';
            case '.html':
            case '.htm':
                return 'text/html';
            case '.css':
                return 'text/css';
            case '.js':
                return 'text/javascript';
            case '.md':
                return 'text/markdown';
            case '.svg':
                return 'image/svg+xml';
            case '.ico':
                return 'image/x-icon';
    }
}