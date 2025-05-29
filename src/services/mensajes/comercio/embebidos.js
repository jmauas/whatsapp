
export const generarTxtEmbebido = async (p) => {
    let txt = '<Producto>';
    txt += `<Código SKU del Producto>${p.sku}></Código SKU del Producto>`;
    txt += `<Código del Producto ${p.sku}>${p.IdP}></Código del Producto ${p.sku}>`;
    txt += `<Titulo del Producto ${p.sku}>${p.titulo}></Titulo del Producto ${p.sku}>`;
    txt += `<Descripción del Producto ${p.sku}>${p.descrip}></Descripción del Producto ${p.sku}>`;
    txt += `<Categoria del Producto ${p.sku}>${p.categoria}></Categoria del Producto ${p.sku}>`;
    txt += `<Url del Link del Producto ${p.sku} a la web de la empresa>${!p.link2 || p.link2.trim() == '' ? p.link1 : p.link2==='sinPubli' ? '' : p.link2 }</url del Link del Producto ${p.sku} a la web de la empresa>`;
    txt += `<Precio del Producto ${p.sku}>${p.precioLista}</Precio del Producto ${p.sku}>`;
    txt += `<Precio en Promoción ${p.sku}>${p.precio}</Precio en Promoción ${p.sku}>`;
    txt += `<Porcentaje Bonificación del Producto ${p.sku}>${p.boniProd}</Porcentaje Bonificación del Producto ${p.sku}>`;
    txt += `<Variantes del Producto ${p.sku}>`;
    if (p.vtes && p.vtes.length > 0) {
        p.vtes.forEach(v => {
            txt += `<Variante>`;
            txt += `    <Código de la Variante>${v.id}</Código de la Variante>`;
            txt += `    <Nombre de la Variante ${v.id}>${v.nombre}</Nombre de la Variante ${v.id}>`;
            txt += `    <Stock de la Variante ${v.id}>${v.stock}</Stock de la Variante ${v.id}>`;
            txt += `</Variante>`;
        });
    }
    txt += `<Sets del producto ${p.sku}>`;
    if (p.sets && p.sets.length > 0) {
        p.sets.forEach(s => {
            txt += `<Set>`;
            txt += `    <Código del Set>${s.id}</Código del Set>`;
            txt += `    <Cantidad del Set ${s.id}>${s.cant}</Cantidad del Set ${s.id}>`;
            txt += `    <Bonificación del Set ${s.id}>${s.bonif}</Bonificación del Set  ${s.id}>`;
            txt += `    <Precio Unitario Comprando en el Set ${s.id}>${Math.round(p.precioLista * (1 - (s.bonif / 100)))}</Precio Unitario Comprando en el Set ${s.id}>`;
            txt += `</Set>`;
        });
    }
    txt += `</Sets del producto ${p.sku}>`;
    txt += '</Producto>';
    return txt;
}