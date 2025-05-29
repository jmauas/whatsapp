let turno = {};
let doctores = [];
let tipos = [];
let pacientes = [];
let ccr;
let asa;

const pedirDatos = async () => {
    try {
        const res = await fetch("/config")
        const data = res.json()
        return data
    } catch (error) {
        console.log(new Date().toLocaleString()+'  -  '+'ERROR', error)
        return {}
    }
}

window.onload = async () => {
    const now = new Date();
    now.setHours(now.getHours() - 3);
    const fh = document.getElementById('fecha');
    fh.value = now.toISOString().slice(0, 16);

    const data = await pedirDatos();

    if (data.doctores && Array.isArray(data.doctores)) {
        doctores = data.doctores;
        const select = document.getElementById('doctor');
        doctores.forEach((doctor) => {
            const option = document.createElement('option');
            option.value = doctor.nombre;
            option.text = `${doctor.emoji} ${doctor.nombre}`;
            option.classList.add('select');
            select.appendChild(option);
        });
        cambioDoctor();
    }


};

const cambioDoctor = () => {
    if (doctores && Array.isArray(doctores)) {
        const dr = document.getElementById('doctor').value;
        tipos = doctores.find(doctor => doctor.nombre === dr).tiposTurno;
        const select = document.getElementById('servicio');
        while (select.firstChild) {
            select.removeChild(select.firstChild);
        }
        tipos.forEach((tipo) => {
            const option = document.createElement('option');
            option.value = tipo.nombre;
            option.text = `${tipo.nombre} - ${tipo.duracion} Min.`;
            select.appendChild(option);
        });
        cambioServicio();
    }
}

const cambioServicio = () => {
    const serv = document.getElementById('servicio').value;
    const tipo = tipos.find(tipo => tipo.nombre === serv);
    if (tipo) {
        document.getElementById('duracion').value = Number(tipo.duracion) > 0 ? tipo.duracion : 30;
    }
}


const cambioDNI = async () => {
    const dni = document.getElementById('dni').value;
    limpiarPaciente('dni');
    if (dni && dni.length >= 7) {
        try {
            const res = await fetch(`/config/paciente?dni=${dni}`)
            const data = await res.json();
            if (data.ok) {
                pacientes = data.paciente;
                if (pacientes.length > 1) {
                    modalPacientes();
                } else {
                    const paciente = pacientes[0];
                    setPaciente(paciente);
                }
            }
        } catch (error) {
            console.log(new Date().toLocaleString()+'  -  '+'ERROR', error)
            return {}
        }
    }
}

const cambioCelu = async () => {
    let celu = document.getElementById('celular').value;
    limpiarPaciente('celular');
    if (celu && celu.length >= 8) {
        try {
            if (celu.substring(0, 3) != '549') celu = '549' + celu;
            const res = await fetch(`/config/paciente?celular=${celu}`)
            const data = await res.json();
            if (data.ok) {
                pacientes = data.paciente;
                if (pacientes.length > 1) {
                    modalPacientes();
                } else {
                    const paciente = pacientes[0];
                    setPaciente(paciente);
                }
            }
        } catch (error) {
            console.log(new Date().toLocaleString()+'  -  '+'ERROR', error)
            return {}
        }
    }
}

const cambioNombre = async () => {
    const nombre = document.getElementById('nombre').value;
    limpiarPaciente('nombre');
    if (nombre && nombre.length >= 3) {
        try {
            const res = await fetch(`/config/paciente?nombre=${nombre}`)
            const data = await res.json();
            if (data.ok) {
                pacientes = data.paciente;
                if (pacientes.length > 1) {
                    modalPacientes();
                } else {
                    const paciente = pacientes[0];
                    setPaciente(paciente);
                }
            }
        } catch (error) {
            console.log(new Date().toLocaleString()+'  -  '+'ERROR', error)
            return {}
        }
    }
}

const modalPacientes = () => {
    const select = document.getElementById('selectPaciente');
    while (select.firstChild) {
        select.removeChild(select.firstChild);
    }
    pacientes.forEach((paciente) => {
        const option = document.createElement('option');
        option.value = pacientes.indexOf(paciente);
        option.text = `${paciente.nombre} ${paciente.apellido}`;
        option.classList.add('menuItem');
        select.appendChild(option);
    });
    select.setAttribute('size', pacientes.length);
    const menuPacientes = document.getElementById("modal");
    menuPacientes.showModal();
}

const seleccionarPaciente = () => {
    const select = document.getElementById('selectPaciente');
    const paciente = pacientes[Number(select.value)];
    setPaciente(paciente);
    const menuPacientes = document.getElementById("modal");
    menuPacientes.close();
}

const limpiarPaciente = (tipo) => {
    if (!tipo==='nombre') {
        document.getElementById('nombre').value = '';
        document.getElementById('apellido').value = '';
    }
    if (!tipo === 'dni') document.getElementById('dni').value = '';
    if (!tipo === 'celular') document.getElementById('celular').value = '';
    document.getElementById('mail').value = '';
    document.getElementById('cobertura').value = '';
    document.getElementById('observaciones').value = '';
}

const setPaciente = (paciente) => {
    document.getElementById('nombre').value = paciente.nombre;
    document.getElementById('apellido').value = paciente.apellido;
    document.getElementById('dni').value = paciente.dni;
    document.getElementById('celular').value = paciente.celular;
    document.getElementById('mail').value = paciente.email;
    document.getElementById('cobertura').value = paciente.cobertura;
    document.getElementById('mensajeTurno1').innerHTML = '';
    if (paciente.turnos) {
        asa = paciente.turnos.asa;
        ccr = paciente.turnos.ccr;
        if (paciente.turnos.turno && paciente.turnos.turno.description) {
            const turno = paciente.turnos.turno;
            if (turno) {
                let index = turno.description.lastIndexOf('✏️');
                if (index > 0) {
                    turno.description = turno.description.substring(0, index - 1);
                    turno.description = turno.description.replaceAll('\n', '<br />');
                }
                document.getElementById('cartelTurno1').style.display = 'flex';
                let fecha = formatoFecha(new Date(turno.start.dateTime), true, true, false, true);
                document.getElementById('mensajeTurno1').innerHTML = `
<div style="padding: 5px; margin: 15px 0px; border: 0.5px solid black; border-radius: 10px;">
    <p><i class="fa-solid fa-warning fa-2xl"></i> Tiene turno agendado. ❌</p>
    <p>Para el <span style="font-size: 18px;"><b>${fecha}</b></span></p>
    <br />
    ✔️ Paciente: ${turno.extendedProperties.private.nombre} ${turno.extendedProperties.private.apellido}
    <br />
    ✔️ Tipo: ${turno.extendedProperties.private.servicio}
    <br />
    ✔️ Dr. : ${turno.extendedProperties.private.doctor}
    <br /> <br />
    ¿Querés Cancelarlo  ❓
    <br /> <br />
    <button onclick="cancelarTurno('${turno.id}')" class="btn-turno">
        <i class="fa-solid fa-times fa-2xl"></i>
        Cancelar Turno
    </button>
</div>`;
            }
        }
    }
    if (asa) {
        document.getElementById('cartelTurno1').style.display = 'flex';
        let fecha = formatoFecha(new Date(asa.start.dateTime), true, true, false, true);
        document.getElementById('mensajeTurno1').innerHTML += `
<div style="padding: 5px; margin: 15px 0px; border: 0.5px solid black; border-radius: 10px;">
    <p><i class="fa-solid fa-ban fa-2xl" style="color: red;"></i> Tiene ASA ❌</p>
    <p>Por Turno del <span style="font-size: 18px;"><b>${fecha}</b></span></p>
    <br />
    ✔️ Paciente: ${asa.extendedProperties.private.nombre} ${asa.extendedProperties.private.apellido}
    <br />
    ✔️ Tipo: ${asa.extendedProperties.private.servicio}
    <br />
    ✔️ Dr. : ${asa.extendedProperties.private.doctor}
</div>`;
    }
    if (ccr) {
        document.getElementById('cartelTurno1').style.display = 'flex';
        let fecha = formatoFecha(new Date(ccr.start.dateTime), true, true, false, true);
        document.getElementById('mensajeTurno1').innerHTML += `
<div style="padding: 5px; margin: 15px 0px; border: 0.5px solid black; border-radius: 10px;">
    <p><i class="fa-solid fa-ban fa-2xl" style="color: red;"></i> Tiene CCR ❌</p>
    <p>Por Turno del <span style="font-size: 18px;"><b>${fecha}</b></span></p>
    <br />
    ✔️ Paciente: ${ccr.extendedProperties.private.nombre} ${ccr.extendedProperties.private.apellido}
    <br />
    ✔️ Tipo: ${ccr.extendedProperties.private.servicio}
    <br />
    ✔️ Dr. : ${ccr.extendedProperties.private.doctor}
</div>`;
    }
}

const registrarTurno = async (confirmado) => {
    const btn = document.getElementById('btnRegistrar');
    btn.style.display = 'none   ';
    const desde = new Date(document.getElementById('fecha').value);
    const hasta = new Date(desde);
    hasta.setMinutes(hasta.getMinutes() + Number(document.getElementById('duracion').value));
    const nombre = document.getElementById('nombre').value;
    const apellido = document.getElementById('apellido').value;
    const dni = document.getElementById('dni').value
    if (!nombre || !apellido || !dni) {
        const cartelError = document.getElementById('cartelError');
        cartelError.style.display = 'flex';
        document.getElementById('mensajeError').innerText = 'Error al registrar le turno. Tenes que completar Nombre, Apellido y DNI';
        btn.style.display = 'block';
        return
    }

    turno = {
        desde: desde,
        hasta: hasta,
        doctor: document.getElementById('doctor').value,
        emoji: doctores.find(doctor => doctor.nombre === document.getElementById('doctor').value).emoji,
        servicio: document.getElementById('servicio').value,
        duracion: document.getElementById('duracion').value,
        nombre: document.getElementById('nombre').value,
        apellido: document.getElementById('apellido').value,
        dni: document.getElementById('dni').value,
        celular: document.getElementById('celular').value,
        email: document.getElementById('mail').value,
        cobertura: document.getElementById('cobertura').value,
        observaciones: document.getElementById('observaciones').value,
        confirmado
    }

    try {
        const res = await fetch('/config/turno', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(turno)
        });
        const data = await res.json();
        const cartel = document.getElementById('cartelOk');
        const cartelError = document.getElementById('cartelError');
        const cartelTurno1 = document.getElementById('cartelTurno1');
        const cartelTurno2 = document.getElementById('cartelTurno2');
        cartel.style.display = 'none';
        cartelError.style.display = 'none';
        cartelTurno1.style.display = 'none';
        cartelTurno2.style.display = 'none';
        if (data.ok) {
            cartel.style.display = 'flex';
            btn.style.display = 'block';
        } else {
            if (data.turno) {
                let index = data.turno.description.lastIndexOf('✏️');
                if (index > 0) {
                    data.turno.description = data.turno.description.substring(0, index - 1);
                    data.turno.description = data.turno.description.replaceAll('\n', '<br />');
                }
                cartelTurno2.style.display = 'flex';
                let desde = formatoFecha(new Date(data.turno.start.dateTime), true, false, false, false);
                let hasta = formatoFecha(new Date(data.turno.end.dateTime), true, false, false, false);
                desde = desde.substring(desde.indexOf(' ') + 1);
                hasta = hasta.substring(hasta.indexOf(' ') + 1);
                document.getElementById('mensajeTurno').innerHTML = `
<i class="fa-solid fa-warning fa-xl"></i> Ya hay un turno en ese horario. ❌<br />
de <span style="font-size: 18px;"><b>${desde}</b> a <b>${hasta}</b></span>
${data.turno.description}`;
            } else {
                cartelError.style.display = 'flex';
                document.getElementById('mensajeError').innerText = `Error al registrar le turno. ${data.message}`;
                btn.style.display = 'block';
            }
        }
    } catch (error) {
        console.log(new Date().toLocaleString()+'  -  '+'ERROR', error)
        btn.style.display = 'block';
        return {}
    }
}

const modificarTurno = async () => {
    const btn = document.getElementById('btnRegistrar');
    const cartelError = document.getElementById('cartelError');
    const cartel = document.getElementById('cartelOk');
    const cartelTurno1 = document.getElementById('cartelTurno1');
    const cartelTurno2 = document.getElementById('cartelTurno2');
    btn.style.display = 'block';
    cartelError.style.display = 'none';
    cartel.style.display = 'none';
    cartelTurno1.style.display = 'none';
    cartelTurno2.style.display = 'none';
}
