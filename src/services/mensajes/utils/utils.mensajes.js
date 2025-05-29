

export const crearChat = (f, ctx) => {
    const newHistory = (f.state.getMyState()?.history ?? []);
    newHistory.push({
        role: 'user',
        content: ctx.body,
    })
    return newHistory;
};

export const obtenerChat = (f) => {
    return (f.state.getMyState()?.history ?? []);
};

export const agregarChat = (mensajes, mensaje) => {
    mensajes.push({
        role: 'assistant',
        content: mensaje,
    })
    return mensajes;
};