import fs from 'fs/promises'
import path from 'path';
import { pedirEventos } from '../calendar/calendar.js';

export const getPaciente = async (filter, dato) => {
    try {
        dato = dato.replaceAll('.', '').replaceAll('-', '');
        dato = dato.toLowerCase();
        const root = process.cwd();
        let pacientes = JSON.parse(await fs.readFile(path.join(root, 'locales', 'pacientes.json'), 'utf8'));
        pacientes = pacientes.map(p => ({ ...p, apellido: p.apellido ? p.apellido : ''}));
        let paciente = [];
        if (filter != 'nombre') {
            paciente = pacientes.filter(paciente => paciente[filter] == dato);
        } else {
            paciente = pacientes.filter(paciente => {
                if (paciente.nombre && paciente.nombre.toLowerCase().includes(dato)) return true
                if (paciente.apellido &&  paciente.apellido.toLowerCase().includes(dato)) return true
                return false
            });
        }
        if (paciente && paciente.length > 0) {
            const fh1 = new Date();
            fh1.setDate(fh1.getDate() - 90);
            const fh2 = new Date();
            fh2.setDate(fh2.getDate() + 90);
            let turnos = await pedirEventos(fh1.toISOString(), fh2.toISOString());
            turnos = turnos.eventos;
            paciente = paciente.map(p => {
                const turnoPaciente = turnos.filter(t => t.extendedProperties && t.extendedProperties.private && t.extendedProperties.private.dni == p.dni);
                const turno = turnoPaciente.find(turno => {
                    const titulo = turno.summary.toLowerCase();
                    let es = true;
                    if (titulo.indexOf('cancelado') >= 0) es = false;
                    const fh = new Date(turno.start.dateTime);
                    const hoy = new Date();
                    return es && fh > hoy;
                });
                const asa = turnoPaciente.filter(turno => turno.summary.toLowerCase().indexOf('asa') >= 0);
                const ccr = turnoPaciente.filter(turno => turno.summary.toLowerCase().indexOf('ccr') >= 0);
                p.turnos = { turno: turno, asa: asa, ccr: ccr };
                return p;
            });
            return { ok: true, paciente };
        } else {
            return { ok: false, message: 'Paciente no encontrado' };
        }
    } catch (error) {
        console.log(new Date().toLocaleString()+'  -  '+error);
        return { ok: false, message: error.message };
    }
}


export const savePaciente = async (paciente) => {
    try {
        paciente.dni = paciente.dni.replaceAll('.', '').replaceAll('-', '').replaceAll(' ', '');
        const root = process.cwd();
        let pacientes = JSON.parse(await fs.readFile(path.join(root, 'locales', 'pacientes.json'), 'utf8'))
        pacientes = pacientes.filter(p => p.celular != paciente.celular);
        pacientes.push(paciente);
        await fs.writeFile(path.join(root, 'locales', 'pacientes.json'), JSON.stringify(pacientes, null, 2));
        return true;
    } catch (error) {
        try {
            const root = process.cwd();
            const datos = [paciente];
            await fs.writeFile(path.join(root, 'locales', 'pacientes.json'), JSON.stringify(datos, null, 2));
        } catch (error) {
            console.log(new Date().toLocaleString()+'  -  '+error);
            return false;
        }
    }
}


export const getPacienteBusqueda = async (req, res) => {
    try {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        const dni = req.query.dni;
        const celular = req.query.celular;
        const nombre = req.query.nombre;
        let paciente = [];
        if (dni && dni != null && dni != undefined && dni != '') {
            paciente = await getPaciente('dni', dni);
        } else if (celular && celular != null && celular != undefined && celular != '') {
            paciente = await getPaciente('celular', celular);
        } else {
            paciente = await getPaciente('nombre', nombre);
        }
        res.end(JSON.stringify(paciente));
    } catch (e) {
        res.end(JSON.stringify({ ok: false, msgError: e.message }));
    }
}