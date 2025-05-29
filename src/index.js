import "dotenv/config"
import { createBot } from '@builderbot/bot';
import database from './database/index.js';
import provider from './provider/index.js';
import flow from './flow/index.js';
import { initServer } from "./services/http/http.js";
import { deleteFiles } from './services/utils/index.js';
import { getCuentas } from './services/cuentas/cuentas.js';
import { agendarWa } from './services/sender/trabajosAgendados.js';
import { agendarActualizarTN } from './services/TN/agendarActualizacion.js';
import { crearCarpetasTemporales } from "./utils/auxiliares.js";
import { obtenerConfig } from "./services/global/config.global.js";

const main = async () => {
    try {
        const cuentas = await getCuentas()
        const providers = [];
        const config = await obtenerConfig();
        for await (let cuenta of cuentas) {
            
            deleteFiles(cuenta.nombre)
            const providerInstance = provider(cuenta.nombre, cuenta.id, cuenta.bot, config)

            //DEFAULT_CONNECTION_CONFIG = { markOnlineOnConnect: false }
            // EN \node_modules\@bot-whatsapp\provider-baileys\node_modules\@whiskeysockets\baileys\lib\Defaults\index.js

            const botInstance = await createBot({
                database: database,
                provider: providerInstance,
                flow: flow,
            });

            const { handleCtx, httpServer } = botInstance;

            providerInstance.on('ready', (msg) => {
                console.log(new Date().toLocaleString()+'  -  '+`Bot ${cuenta.nombre} is ready. ID ${cuenta.id}`, msg)
            });

            providerInstance.on('error', (msg) => {
                console.log(new Date().toLocaleString()+'  -  '+`Error in ${cuenta.nombre}`, msg)
            });

            providers.push({ ...cuenta, provider: providerInstance, ctx: handleCtx, server: httpServer })
            
        }

        await initServer(providers)   

        //agendarWa();
        //agendarActualizarTN();
        //crearCarpetasTemporales();
    } catch (error) {
		console.log('ERROR: ', error)
	}
}

main()