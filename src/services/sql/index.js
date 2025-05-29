import mssql from 'mssql';
import { obtenerConfig }  from '../global/config.global.js';

const configLocal = await obtenerConfig();

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    port : 1433,
    database: process.env.DB_NAME,
    options: {
        instanceName: process.env.DB_INSTANCIA,
        encrypt: false, // for azure
        trustServerCertificate: true // change to true for local dev / self-signed certs
    },
    // pool: {
    //     max: 10,
    //     min: 0,
    //     idleTimeoutMillis: 300000
    // }
}

export const select = async (sql, bd = '') => {
    try {
        if (bd!='') config.database = bd;	
        const pool = await mssql.connect(config);
        try {
            const datos = await pool.query(sql)
            let data = {errorConn: false, error: false, datos: datos.recordset}
            return data
        } catch (error) {
            return logErrorSQL(error, false, sql)
        } finally {
            pool.close();
        }
    } catch (error) {   
        return logErrorSQL(error, true, sql)
    }
}

export const execute = async (sql) => { 
    return mssql.connect(config)
    .then( async (pool) => {
        try {
            await pool.query(sql)
            let data = {errorConn: false, error: false, datos: true}
            return data
        } catch (error) {
            return logErrorSQL(error, false, sql)
        } 
    })
    .catch((error) => {
        return logErrorSQL(error, true, sql)
    });
}

export const conDatoPerfilML = async (perfilML, dato) => {
    let sql = `SELECT ${dato} FROM ML_Opciones WHERE IdPerfil=${perfilML}`;
    let data = await select(sql);
    if (data.error == false) {
        if (data.datos.length > 0) {
            return data.datos[0][dato];
        } else {
            return '';
        }
    } else {
        return '';
    }   
}    

export const conStockPerfilML = async (perfilML) => {
    let sql = `SELECT TOP 1 IdSuc FROM ML_Opciones_Suc WHERE Perfil=${perfilML}`;
    let data = await select(sql);
    if (data.error == false) {
        if (data.datos.length > 0) {
            return data.datos[0].IdSuc;
        } else {
            return '';
        }
    } else {
        return '';
    }   
}

export const datoProducto = async (id, perfilML, sucP, sucS, lp, cp, fp, pend, urlWeb) => {
    try {
        let stock = 'stock'
        if (pend) stock = '(stock+pendIng-pendVL-preFc-pendPed)';
        
        let sql = `SELECT IsNull(ml.IdP, p.IdP) as sku, p.IdP as IdP, dfp.precio as precioLista, REPLACE(IsNull(ml.titulo, p.NombreP), '#coma', ',') as titulo, REPLACE(IsNull(ml.descrip, ''), '#coma', ',') as descrip
        , CONVERT(int, IsNull((SELECT TOP 1 Bonif FROM RBonifProd WHERE IdProd=p.IdP AND IdSuc=${sucP} AND IdLista=${lp} AND FechaD<=GETDATE() AND FechaH>=GETDATE()), 0)) as boniProd
        , p.RRubro as cat, p.NomR as categoria, '${urlWeb}/producto/'+IsNull(ML.slug, '')+'?id=0' as link1, IsNull(ml.Link, 'sinPubli') as link2      
        FROM RProductos as p LEFT JOIN ML ON CONVERT(varchar, p.IdP)=ml.IdP INNER JOIN DatosFijos_Precio as dfp ON p.IdP=CONVERT(varchar, dfp.prod)    
        WHERE p.IdP='${id}' AND dfp.suc=${sucP} AND dfp.lp=${lp} AND dfp.cp=${cp} AND dfp.fp='${fp}' AND dfp.var='0' AND IsNull(ML.Perfil, ${perfilML})=${perfilML}`;
        let data = await select(sql);
        let prod = {};
        if (data.error == false) {
            if (data.datos.length > 0) {
                prod = data.datos[0];
                const boni = Math.max(prod.boniProd, 0)
                prod.precio = Math.round(prod.precioLista * (1 - (boni / 100)));
                sql = `Select v.IdV as id, v.NombreV as nombre, IsNull((SELECT TOP 1 ${stock} FROM DatosFijos_Stock WHERE CONVERT(varchar, prod)='${prod.IdP}' AND CONVERT(varchar, var)=v.IdV AND suc=${sucS}), 0) as stock 
                FROM RVariantes as v WHERE v.IdP=${prod.IdP} AND EstadoV>0 AND IsNull(NoML, 0)=0 
                ORDER BY id Asc`;
                data = await select(sql);
                if (data.error == false) {
                    if (data.datos.length > 0) {
                        prod.vtes = data.datos
                    } else {
                        prod.vtes = [];
                    }
                }
                if (prod.sku.substring(0, 3) !== 'SET') {
                    sql = `SELECT r.IdS as id, r.CantP as cant, r.Bonif as bonif FROM RegSet as r INNER JOIN SetP as S ON r.Ids=s.IdS WHERE r.IdP=${prod.IdP} AND r.Lista=${lp} AND r.Suc=${sucP}
                    AND s.Estado>0 AND (select COUNT(IdP) FROM RegSet WHERE IdS=r.IdS AND Lista=${lp} AND Suc=${sucP})=1 AND r.Bonif<99 ORDER BY r.boniF desc, r.CantP Asc`;
                    data = await select(sql);
                    prod.sets = [];
                    if (data.error == false) {
                        if (data.datos.length > 0) {
                            prod.sets = data.datos
                        }
                    }
                } else {
                    prod.sets = [];
                }
            }
        }
        return prod;
    } catch (error) {
        console.log(new Date().toLocaleString()+'  -  '+'Error en datoProducto:', error);
        return {};
    }
}

export const conDatoSuc = async (dato) => {
    const suc = Number(configLocal.sucursal) || 1;
    let sql = `SELECT ${dato} FROM RSucursales WHERE IdSuc=${suc}`;
    let data = await select(sql);
    if (data.error == false) {
        if (data.datos.length > 0) {
            return data.datos[0][dato];
        } else {
            return '';
        }
    } else {
        return '';
    }   
}

const logErrorSQL = (error, conn, sql) => {
    let data = {errorConn: conn, error: !conn}
    if (!error) {
        data.datos = 'Error Indeterminado';
    } else if (!error.originalError) {
        data.datos =  error;
    } else if (!error.originalError.info) {
        data.datos =  error.originalError;
    } else if (!error.originalError.info.message) {
        data.datos =  error.originalError.info;
    } else if (!error.originalError.info.message.info) {
        data.datos = error.originalError.info.message;
    } else {
        data.datos = error.originalError.info.message.info;
    }
    console.log(new Date().toLocaleString()+'  -  '+data.datos, 'Sentecia SQL: ', sql);
    return data;
}