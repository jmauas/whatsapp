import multer from "multer";
import storage from "./storage.js";

export const upload = multer({ storage });

export const subida = (req, res) => {
        try {
            const file = req.file;
            res.writeHead(200, { 'Content-Type': 'application/json' })
            if (!file) {
                res.end(JSON.stringify({ ok: false, msgError: 'No se Subió Archivo.' }));
                return;
            }
            res.end(JSON.stringify({ ok: true, msgError: '', file: file.filename }));
        } catch (e) {
            res.end(JSON.stringify({ ok: false, msgError: e.message, file: '' }));
        }
    }
