let turno = {};
let doctores = [];
let tipos = [];
let pacientes = [];
let duracion = 0;
let ccr = [];
let asa = [];

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
    const data = await pedirDatos();
    if (data.doctores && Array.isArray(data.doctores)) {
        doctores = data.doctores;
        const select = document.getElementById('doctor');
        while (select.firstChild) {
            select.removeChild(select.firstChild);
        }
        let option = document.createElement('option');
        if (doctores.length > 1) {
            option.value = '';
            option.text = `Seleccioná un Doctor`;
            option.classList.add('select');
            option.disabled = true;
            option.selected = true;
            select.appendChild(option);
            doctores.forEach((doctor) => {
                option = document.createElement('option');
                option.value = doctor.nombre;
                option.text = `${doctor.emoji} ${doctor.nombre}`;
                option.classList.add('select');
                select.appendChild(option);
            });
            option = document.createElement('option');
            option.value = 'Indistinto';
            option.text = `✅ Indistinto`;
            option.classList.add('select');
            select.appendChild(option);
        } else {
            doctores.forEach((doctor) => {
                option = document.createElement('option');
                option.value = doctor.nombre;
                option.text = `${doctor.emoji} ${doctor.nombre}`;
                option.classList.add('select');
                select.appendChild(option);
            });
            document.getElementById('doctor').value = doctores[0].nombre;
            cambioDoctor();
        };
    }
};

const cambioDoctor = () => {
    document.getElementById('seccPaciente').classList.remove('show');
    if (doctores && Array.isArray(doctores)) {
        const dr = document.getElementById('doctor').value;
        if (dr === '') return;
        document.getElementById('seccTipoTurno').style.display = 'flex';
        if (dr === 'Indistinto') {
            tipos = unificarTipos(doctores)
        } else {
            tipos = doctores.find(doctor => doctor.nombre === dr).tiposTurno.map(tipo => {
                if (Number(tipo.duracion) > 0) {
                    return tipo;
                }
            });
        }
        const select = document.getElementById('servicio');
        while (select.firstChild) {
            select.removeChild(select.firstChild);
        }
        let option = document.createElement('option');
        const tiposH = tipos.filter(tipo => tipo.habilitado);
        if (tiposH.length > 1) {
            option.value = '';
            option.text = `Seleccioná un Tipo de Turno.`;
            option.classList.add('select');
            option.disabled = true;
            option.selected = true;
            select.appendChild(option);
            tiposH.forEach((tipo) => {
                if (!tipo.habilitado) return;
                option = document.createElement('option');
                option.value = tipo.nombre;
                option.text = `✅ ${tipo.nombre}`;
                option.classList.add('select');
                select.appendChild(option);
            });
        } else {
            tiposH.forEach((tipo) => {
                if (!tipo.habilitado) return;
                option = document.createElement('option');
                option.value = tipo.nombre;
                option.text = `✅ ${tipo.nombre}`;
                option.classList.add('select');
                select.appendChild(option);
            });
            document.getElementById('servicio').value = tiposH[0].nombre;
            cambioServicio();
        }
    }
}

const cambioServicio = async () => {
    const serv = document.getElementById('servicio').value;
    const tipo = tipos.find(tipo => tipo.nombre === serv);
    if (tipo) {
        duracion = Number(tipo.duracion) > 0 ? Number(tipo.duracion) : 30;
        document.getElementById('seccDNI').style.display = 'flex';
        const params = new URLSearchParams(window.location.search);
        const celu = params.get('celu');
        if (celu) {
            const res = await fetch(`/config/paciente?celular=${celu}`)
            const data = await res.json();
            if (data.ok) {
                document.getElementById('seccPaciente').classList.add('show');
                setPaciente(data.paciente[0]);
            } else {
                document.getElementById('celular').value = celu;
            }
        }
    }
}


const cambioDNI = async () => {
    asa = [];
    ccr = [];
    const dni = document.getElementById('dni').value;
    limpiarPaciente();
    if (dni && dni.length >= 7) {
        try {
            document.getElementById('seccPaciente').classList.add('show');
            const res = await fetch(`/config/paciente?dni=${dni}`)
            const data = await res.json();
            if (data.ok) {
                setPaciente(data.paciente[0]);
            }
        } catch (error) {
            console.log(new Date().toLocaleString()+'  -  '+'ERROR', error)
            return {}
        }
    }
}

const limpiarPaciente = () => {
    document.getElementById('nombre').value = '';
    document.getElementById('apellido').value = '';
    document.getElementById('celular').value = '';
    document.getElementById('mail').value = '';
    document.getElementById('cobertura').value = '';
    document.getElementById('observaciones').value = '';
    document.getElementById('mensajeTurno').innerHTML = '';
    document.getElementById('cartelTurno').style.display = 'none';
    document.getElementById('btn-verTurnos').style.display = 'flex';
    document.getElementById('seccPaciente').classList.remove('show');
    document.getElementById('parte2').classList.remove('show');
    document.getElementById('parte1').classList.add('show');
    document.getElementById('agenda').innerHTML = '';
}


const setPaciente = (paciente) => {
    document.getElementById('nombre').value = paciente.nombre;
    document.getElementById('apellido').value = paciente.apellido;
    document.getElementById('dni').value = paciente.dni;
    document.getElementById('celular').value = paciente.celular;
    document.getElementById('mail').value = paciente.email;
    document.getElementById('cobertura').value = paciente.cobertura;
    document.getElementById('mensajeTurno').innerHTML = '';
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
                document.getElementById('cartelTurno').style.display = 'flex';
                let fecha = formatoFecha(new Date(turno.start.dateTime), true, true, false, true);
                document.getElementById('mensajeTurno').innerHTML = `
<div style="padding: 5px; border: 0.5px solid black; border-radius: 10px;">
    <p><i class="fa-solid fa-warning fa-xl"></i> Ya tenés un turno agendado. ❌</p>
    <p>Para el <span style="font-size: 18px;"><b>${fecha}</b></span></p>
    <br />
    ✔️ Paciente: ${turno.extendedProperties.private.nombre} ${turno.extendedProperties.private.apellido}
    <br />
    ✔️ Tipo: ${turno.extendedProperties.private.servicio}
    <br />
    ✔️ Dr. : ${turno.extendedProperties.private.doctor}
    <br /> <br />
    ¿Querés Cancelarlo para Pedir Uno nuevo ❓
    <br /> <br />
    <button onclick="cancelarTurno('${turno.id}')" class="btn-turno">
        <i class="fa-solid fa-times fa-2xl"></i>
        Cancelar Turno
    </button>
</div>
    `;
                document.getElementById('btn-verTurnos').style.display = 'none';
            }
        }
    }
}

const verTurnos = async () => {
    const cartelError = document.getElementById('cartelErrorTurno');
    cartelError.style.display = 'none';
    const nombre = document.getElementById('nombre');
    const apellido = document.getElementById('apellido');
    const dni = document.getElementById('dni');
    const cel = document.getElementById('celular');
    const cob = document.getElementById('cobertura');
    const serv = document.getElementById('servicio');
    let error = false;
    if (nombre.value.length < 3 || apellido.value.length < 3) {
        nombre.style.border = '3px solid red';
        apellido.style.border = '3px solid red';
        error = true;
    } else {
        nombre.style.border = '1px solid #ccc';
        apellido.style.border = '1px solid #ccc';
    }
    if (dni.value.length < 7) {
        dni.style.border = '3px solid red';
        error = true;
    } else {
        dni.style.border = '1px solid #ccc';
    }
    if (cel.value.length < 8) {
        cel.style.border = '3px solid red';
        error = true;
    } else {
        cel.style.border = '1px solid #ccc';
    }
    if (cob.value.length <= 3) {
        cob.style.border = '3px solid red';
        error = true;
    } else {
        cob.style.border = '1px solid #ccc';
    }
    if (duracion === 0 || !serv.value || serv.value === '') {
        serv.style.border = '3px solid red';
        error = true;
    } else {
        serv.style.border = '1px solid #ccc';
    }
    if (error) {
        cartelError.style.display = 'flex';
        document.getElementById('mensajeErrorTurno').innerText = 'Error al buscar los turnos. Tenes que completar los campos en Rojo correctamente.';
        return
    }

    document.getElementById('loading').style.display = 'flex';
    document.getElementById('parte2').classList.add('show');
    document.getElementById('parte1').classList.remove('show');
    document.getElementById('agenda').style.display = 'block';

    let html = '';
    const div = document.getElementById('agenda');
    const doctor = document.getElementById('doctor').value;
    const data = await fetch(`/turnos?doctor=${doctor}&duracion=${duracion}&asa=${asa.length>0 ? 'si' : 'no'}&ccr=${ccr.length>0 ? 'si' : 'no'}`)
    const res = await data.json();
    if (res.ok===false) {
        html = `<div class="filaFecha">
            <div class="fechaTurno">Error Buscando Agenda: ${res.mensaje}.</div>
            <i class="fa-solid fa-sad-tear fa-5x" style="color: palevioletred"></i>
        </div>`;
    }	
    if (res.agenda) {
        const agenda = res.agenda
        if (agenda && Array.isArray(agenda) && agenda.length > 0) {
            agenda.forEach((dia) => {
				html += `<div class="filaFecha">
                            <div class="fechaTurno">${formatoFecha(dia.fecha, false, false, false, false)}</div>
                            <div>${dia.diaSemana}</div>
                            <div class="verMas" onclick="verHoras('${dia.fecha}')"><i class="fa-solid fa-chevron-down"></i> Clic Desplegar Horarios</div>
                            <div class="filaHoras" id="fila${dia.fecha}">`;
								dia.turnos.map(turno => {
									html += `
										<div class="filaHora">
											<div class="horaTurno">${turno.hora}:${turno.min} Hs.</div>
											<div>
												<button onclick="seleccionarTurno('${dia.fecha}', ${turno.hora}, ${turno.min}, '${turno.doctor}')" class="btn-turno">
													<i class="fa-solid fa-check fa-2xl"></i>
													Seleccionar
												</button>
											</div>
										</div>`;
								});
				html += '	</div>';
				html += '</div>';
            });
        } else {
            html = `<div class="filaFecha">
                        <div class="fechaTurno">No hay turnos Disponibles en este Momento.</div>
                        <i class="fa-solid fa-sad-tear fa-5x" style="color: palevioletred"></i>
                    </div>`;
        }
    }
    div.innerHTML = html;
    document.getElementById('loading').style.display = 'none';
}

const verHoras = (fecha) => {
    const fila = document.getElementById(`fila${fecha}`);
    if (fila.classList.contains('show')) {
        fila.classList.remove('show');
    } else {
        fila.classList.add('show')
    };
}


const seleccionarTurno = (fecha, hora, min, doctor) => {
    document.getElementById('agenda').style.display = 'none';
    document.getElementById('contenedorRegistrar').classList.add('show');
    document.getElementById('btnRegistrar').style.display = 'flex';
	const ano = new Date(fecha).getFullYear();
	const mes = new Date(fecha).getMonth();
	const dia = new Date(fecha).getDate();
    const desde = new Date(ano, mes, dia, hora, min);
    const hasta = new Date(ano, mes, dia, hora, min);
    hasta.setMinutes(hasta.getMinutes() + duracion);
    const nombre = document.getElementById('nombre').value;
    const apellido = document.getElementById('apellido').value;
    const dni = document.getElementById('dni').value
    if (!nombre || !apellido || !dni) {
        const cartelError = document.getElementById('cartelError');
        cartelError.style.display = 'flex';
        document.getElementById('mensajeError').innerText = 'Error al registrar le turno. Tenes que completar Nombre, Apellido y DNI';
        cartelError.style.display = 'flex';
        document.getElementById('btnRegistrar').style.display = 'none';
        return
    }

    const dr = document.getElementById('doctor').value === 'Indistinto' ? doctor : document.getElementById('doctor').value

    turno = {
        desde: desde.toISOString(),
        hasta: hasta.toISOString(),
        doctor: dr,
        emoji: doctores.find(doctor => doctor.nombre === dr).emoji,
        servicio: document.getElementById('servicio').value,
        duracion: duracion,
        nombre: document.getElementById('nombre').value,
        apellido: document.getElementById('apellido').value,
        dni: document.getElementById('dni').value,
        celular: document.getElementById('celular').value,
        email: document.getElementById('mail').value,
        cobertura: document.getElementById('cobertura').value,
        observaciones: document.getElementById('observaciones').value,
    }
    const f = formatoFecha(turno.desde, false, false, false, true);
    hora = formatoFecha(turno.desde, true, true, false, false)
    hora = hora.substring(hora.indexOf(' ') + 1);
    const html = `
    <div class="confFila"><div class="confTitulo">Fecha: </div><div class="confValor">${f}</div></div>
    <div class="confFila"><div class="confTitulo">Hora: </div><div class="confValor">${hora}</div></div>
    <div class="confFila"><div class="confTitulo">Doctor: </div><div class="confValor">${turno.doctor}</div></div>
    <div class="confFila"><div class="confTitulo">Tipo Turno: </div><div class="confValor">${turno.servicio}</div></div>
    <div class="confFila"><div class="confTitulo">Nombre: </div><div class="confValor">${turno.nombre}</div></div>
    <div class="confFila"><div class="confTitulo">Apellido: </div><div class="confValor">${turno.apellido}</div></div>
    <div class="confFila"><div class="confTitulo">DNI: </div><div class="confValor">${turno.dni}</div></div>
    <div class="confFila"><div class="confTitulo">Celular: </div><div class="confValor">${turno.celular}</div></div>
    <div class="confFila"><div class="confTitulo">E-Mail: </div><div class="confValor">${turno.email}</div></div>
    <div class="confFila"><div class="confTitulo">Cobertura: </div><div class="confValor">${turno.cobertura}</div></div>
`;
    document.getElementById('datosTurno').innerHTML = html;
}

const registrarTurno = async () => {
    const btnReg = document.getElementById('btnRegistrar');
    const btnVolver = document.getElementById('btnVolver');
    btnReg.style.display = 'none';
    btnVolver.style.display = 'none';
    turno.observaciones = document.getElementById('observaciones').value
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
        cartel.style.display = 'none';
        cartelError.style.display = 'none';
        if (data.ok) {
            volver();
            const res = await fetch(`/config/paciente?dni=${document.getElementById('dni').value}`)
            const data = await res.json();
            if (data.ok) {
                document.getElementById('seccPaciente').classList.add('show');
                setPaciente(data.paciente[0]);
            }
        } else {
            cartelError.style.display = 'flex';
            document.getElementById('mensajeError').innerText = `Error al registrar le turno. ${data.message}`;
            btnReg.style.display = 'flex';
            btnVolver.style.display = 'flex';
        }
    } catch (error) {
        console.log(new Date().toLocaleString()+'  -  '+'ERROR', error)
        btnReg.style.display = 'flex';
        btnReg.style.display = 'flex';
        return {}
    }
}

const volver = async () => {
    document.getElementById('parte2').classList.remove('show');
    document.getElementById('parte1').classList.add('show');
    document.getElementById('agenda').innerHTML = '';
    document.getElementById('contenedorRegistrar').classList.remove('show');
    document.getElementById('cartelError').style.display = 'none';
    document.getElementById('cartelOk').style.display = 'none';
    document.getElementById('btnRegistrar').style.display = 'none';
}

const cancelarTurno = async (id) => {
    try {
        const res = await fetch('/config/turno', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: id, estado: 'cancelado' })
        });
        const data = await res.json();
        if (data.ok) {
            document.getElementById('cartelTurno').style.display = 'none';
            document.getElementById('btn-verTurnos').style.display = 'flex';
        }
    } catch (error) {
        console.log(new Date().toLocaleString()+'  -  '+'ERROR', error)
        return {}
    }
}

const unificarTipos = (doctores) => {
    let tipos = [];
    if (!doctores || !Array.isArray(doctores)) return tipos;
    doctores.map((doctor) => {
        if (!doctor.tiposTurno || !Array.isArray(doctor.tiposTurno)) return;
        doctor.tiposTurno.map((tipo1) => {
            if (Number(tipo1.duracion) > 0) {
                const control = tipos.filter(tipo2 => tipo2.nombre == tipo1.nombre);
                if (control.length === 0) {
                    tipos.push(tipo1);
                } else {
                    if (Number(control[0].dias) < Number(tipo1.dias)) {
                        tipos[tipos.indexOf(control[0])].dias = tipo1.dias;
                    }
                }
            }
        })
    })
    return tipos;
}