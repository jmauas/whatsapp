import { BaileysProvider } from '@builderbot/provider-baileys'
import { WPPConnectProvider } from '@builderbot/provider-wppconnect'
import { createProvider } from '@builderbot/bot'

const provider = (nombre, id, bot, config) => {
    const proveedor = config?.provider || 'baileys';
    if (proveedor === 'wppconnect') {
        return createProvider(WPPConnectProvider, {
            name: nombre,
            id: id,
            bot: bot
        })
    } else {
        return createProvider(BaileysProvider, {
            name: nombre,
            id: id,
            bot: bot,
            experimentalStore: true,  // Significantly reduces resource consumption
            timeRelease: 10800000,    // Cleans up data every 3 hours (in milliseconds)
            version: [2, 3000, 1023223821],
        })
    }
}

export default provider;