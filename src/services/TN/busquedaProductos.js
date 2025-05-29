import fs from 'fs/promises'
import path from 'path';
import { esNumero } from '../../utils/auxiliares.js';
import { obtenerConfig } from '../global/config.global.js';

const config = await obtenerConfig();

export const buscarProductos = async (busqueda, maximo) => {
    if (busqueda === '') return [];
    
    const root = process.cwd();
    const datosExcluir = config.excluir;
    const prodsTN = JSON.parse(await fs.readFile(path.join(root, 'locales', 'productosTN.json'), 'utf8'))
    const palabrasAExcluir = []
    let found = [];

    const palabras = busqueda.split(' ').map((palabra, index) => {
        palabra = palabra.trim();
        palabra = palabra.replace(/[^a-z0-9áéíóúüñ]/gi, '');
        if (palabra.length <= 3 && !esNumero(palabra)) return '';
        if (palabra.slice(-1) === 's' || palabra.slice(-1) === 'S') palabra = palabra.slice(0, -1);
        
        const existe = datosExcluir.filter(p => p.siEsta.includes(palabra.toLowerCase()))
        if (existe.length > 0) {
            existe.map(e => {
                let esta = false
                e.palabrasAExcluirSiNoEstan.map(pala => {
                    if (busqueda.toLowerCase().includes(pala)) {
                        esta = true;
                    }
                });
                if (!esta) {
                    palabrasAExcluir.push(e.palabrasAExcluirSiNoEstan)
                }
            })
        }        
        return palabra
    })

    prodsTN.map((prod, i) => {
        palabras.map(palabra => {
            if (prod.titulo.toLowerCase().includes(palabra.toLowerCase())) {
                let exclu = false;
                if (palabrasAExcluir.length > 0) {
                    palabrasAExcluir.map(excluir => {
                        excluir.map(excl => {
                            if (prod.titulo.toLowerCase().includes(excl.toLowerCase())) {
                                exclu = true;
                            }
                        })
                    })
                }
                if (!exclu) {
                    if (found.filter(f => f.index === i).length === 0) {
                        found.push({ index: i, match: 2, sku: prod.sku, titulo: prod.titulo });
                    } else {
                        found.filter(f => f.index === i)[0].match += 2;
                    }
                }
            } else if (prod.descrip.toLowerCase().includes(palabra.toLowerCase())) {
                let exclu = false;
                if (palabrasAExcluir.length > 0) {
                    palabrasAExcluir.map(excluir => {
                        excluir.map(excl => {
                            if (prod.descrip.toLowerCase().includes(excl.toLowerCase())) {
                                exclu = true;
                            }
                        })
                    })
                }
                if (!exclu) {                    
                    if (found.filter(f => f.index === i).length === 0) {
                        found.push({ index: i, match: 1, sku: prod.sku, titulo: prod.titulo  });
                    } else {
                        found.filter(f => f.index === i)[0].match += 1;
                    }
                }
            }
        });
    });
    found.sort((a, b) => b.match - a.match);
    found = found.slice(0, maximo);
    const prods = found.map(f => ({...prodsTN[f.index], match_count: f.match}));
    return prods;
}