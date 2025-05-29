import { select, conDatoPerfilML, conStockPerfilML } from './index.js';
import { datoProducto } from './index.js';
import { obtenerConfig } from '../global/config.global.js';
import { esNumero } from '../../utils/auxiliares.js';

const config = await obtenerConfig();
const sinPublicacon = config.sinPubli;

export const buscarProductos = async (busqueda, maximo) => {
    if (busqueda === '') return [];
    
    const perfilML = Number(config.perfil) || 4;
    const sucP = await conDatoPerfilML(perfilML, 'SucML');
    const sucS = await conStockPerfilML(perfilML);
    const lp = await conDatoPerfilML(perfilML, 'ListaML');
    const cp = await conDatoPerfilML(perfilML, 'CPML');
    const fp = await conDatoPerfilML(perfilML, 'FPML');
    const pend = await conDatoPerfilML(perfilML, 'Prod');
    const urlWeb = await conDatoPerfilML(perfilML, 'urlWeb');

    const datosExcluir = config.excluir;
    const palabrasAExcluir = []

    const latin = 'COLLATE Latin1_General_CI_AI ';
    const palabras = busqueda.split(' ');
    const match = `(
        ${palabras.map((palabra, index) => {
            palabra = palabra.trim();
            palabra = palabra.replace(/[^a-z0-9áéíóúüñ]/gi, '');
            if (palabra.length <= 3 && !esNumero(palabra)) return (index < palabras.length - 1 ? '' : '0');
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
            
            return `CASE WHEN @campo ${latin} LIKE '%${palabra}%' ${latin} THEN 1 ELSE 0 END` +
                (index < palabras.length - 1 ? ' + ' : '')
        }).join('')}
    )`;

    let union = sinPublicacon ? 'LEFT JOIN' : 'INNER JOIN';
    let sql = `SELECT IsNull(ml.IdP, p.IdP) as sku, p.IdP as IdP, IsNull(ml.Titulo, p.NombreP) as titulo, (${match})*@coef as match_count
        FROM RProductos as p ${union} ML ON CONVERT(varchar, p.IdP)=ml.IdP     
        WHERE IsNull(ML.Perfil, ${perfilML})=${perfilML} AND ${match}>0 AND IsNull(ML.EstadoML, 0)=0 AND p.Estado>0 
        AND (SELECT COUNT(IdP) FROM RVariantes WHERE IdP=p.IdP AND EstadoV>0)>0`;
    
    if (palabrasAExcluir.length > 0) {
        palabrasAExcluir.map(palabras => {
            palabras.map(palabra => {
                sql += ` AND @campo ${latin} NOT LIKE '%${palabra}%' ${latin}`
            })
        })
    }
    
    let sql2 = `SELECT TOP ${maximo} * FROM (
                ${sql.replaceAll('@campo', 'ml.Descrip').replaceAll('@coef', '1')}
                UNION ALL 
                ${sql.replaceAll('@campo', 'ISNULL(ml.Titulo, p.NombreP)').replaceAll('@coef', '3')}
                ) as sub ORDER BY match_count DESC`;
    
    let data = await select(sql2);
    let prods = [];
    if (data.error == false) {
        for await (let i of data.datos) {
            const prod = await datoProducto(i.IdP, perfilML, sucP, sucS, lp, cp, fp, pend, urlWeb);
            prods.push({ ...prod, match_count: i.match_count });
        }
    }
    return prods;
}

