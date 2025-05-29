import { getPrompt } from '../../prompts/index.js';
import { formatoFecha } from '../../../utils/auxiliares.js';
import { obtenerConfig } from '../../global/config.global.js';
import { disponibilidad } from '../../disponibilidad/disponibilidad.js';
import { diaSemana } from '../../../utils/auxiliares.js';   

export const generatePromptIndex = async () => {
    const prompt = await getPrompt('Index')
    return prompt;
}

export const generatePromptConsultorio = async (ctx, f) => {
    const prompt = await getPrompt('Consultorio');
    const config = await obtenerConfig();
//     let agenda = [];
//     const tipo =  f.state.get('tipo');
//     const doctor = f.state.get('doctor');
//     if (tipo && doctor && tipo.duracion && doctor.nombre) agenda = await disponibilidad(Number(tipo.duracion), doctor.nombre);
//     let turnos: string = '';
//     if (agenda.length > 0) {
//         agenda.map((turno: any) => {
//             const fh = new Date(turno);
//             turnos += `<TURNO>
//     <FECHA Y HORA>${formatoFecha(fh, true, true, false, false)}</FECHA Y HORA>
//     <DIA DE LA SEMANA>${diaSemana(fh.getDay())}</DIA DE LA SEMANA>
// </TURNO>`;
//         });
//     } else {
//         turnos = 'No hay turnos disponibles';
//     }
//    let res: string = prompt.replaceAll('{TURNOS}', turnos)
//  res = res.replaceAll('{HOY}', formatoFecha(new Date(), true, true, false, false));
//  res = res.replaceAll('{LIMITE}', formatoFecha(config.limite, true, true, false, false));
    let res = prompt;
    res = res.replaceAll('{customer_name}', ctx.pushName);
    res = res.replaceAll('{customer_celular}', ctx.from);
    res = res.replaceAll('{nombreConsultorio}', config.nombreConsultorio);
    res = res.replaceAll('{telefono}', config.telefono);
    res = res.replaceAll('{domicilio}', config.domicilio);
    res = res.replaceAll('{mail}', config.mail);
    res = res.replaceAll('{horarioAtencion}', config.horarioAtencion);
    res = res.replaceAll('{coberturas}', config.coberturas);
    res = res.replaceAll('{otros_temas}', config.resto);
    
    let servicios = '';
    config.servicios.map(servicio => { 
        servicios += `<Servicio>
    <Nombre>${servicio.nombre}</Nombre>
    <Precio>${servicio.precio}</Precio>
    <Descripcion>${servicio.descripcion}</Descripcion>                
</Servicio>`;
    })
    res = res.replaceAll('{servicios}', servicios);
    
//     let tipos: string = '';
//     config.servicios.map(servicio => { 
//         if (servicio.duracion!='' && servicio.duracion!=null && servicio.duracion!=undefined && servicio.duracion!='0') {
//             tipos += `<Tipo de Turno>
//     <Nombre>${servicio.nombre}</Nombre>
//     <Duracion>${servicio.duracion}</Duracion>                
// </Tipo de Turno>`;
//         }
//     })
//     res = res.replaceAll('{tipos_de_turnos}', tipos);
    
//     let doctores: string = '';
//     config.doctores.map(doctor => {
//         doctores += `<Doctor>
//     <Nombre>${doctor.nombre}</Nombre>
// </Doctor>`
//     });
//     res = res.replaceAll('{doctores}', doctores);
    return res;
}

export const generatePromptServicio = async (ctx, tipo) => {
    let prompt = ''
    const config = await obtenerConfig();
    let res = '';
    switch (tipo) {
        case 'tipo':
            prompt = await getPrompt('Servicio');
            let tipos = '';
            config.servicios.map(servicio => { 
                if (servicio.duracion!='' && servicio.duracion!=null && servicio.duracion!=undefined && servicio.duracion!='0') {
                    tipos += `<Tipo de Turno>
    <Nombre>${servicio.nombre}</Nombre>
    <Duracion>${servicio.duracion}</Duracion>                
</Tipo de Turno>`;
                }
            })
            res = prompt.replaceAll('{tipos_de_turnos}', tipos);
            break;
        case 'doctor':
            prompt = await getPrompt('Doctor');
            let doctores = '';
            config.doctores.map(doctor => {
                doctores += `<Doctor>
            <Nombre>${doctor.nombre}</Nombre>
        </Doctor>`
            });
            res = res.replaceAll('{doctores}', doctores);
            break;
    }
    return res;
}
