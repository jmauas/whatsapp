let servicios = [];
let doctores = [];
let excluir = [];
let cuentas = [];
let validaciones = [];
let grillaFeriados = [];

const authorizeCalendar = () => {
    window.location.href = "/calendar";
};

const solicitarTokens = async () => {
    try {
        const res = await fetch("/calendar/nuevosTokens")
        const data = await res.json()
        console.log(new Date().toLocaleString()+'  -  '+data)
    } catch (error) {
        console.log(new Date().toLocaleString()+'  -  '+'ERROR', error)
        return {}
    }
};

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
    document.getElementById("nombreConsultorio").value = data.nombreConsultorio;
    document.getElementById("domicilio").value = data.domicilio;
    document.getElementById("telefono").value = data.telefono;
    document.getElementById("mail").value = data.mail;
    document.getElementById("horarioAtencion").value = data.horarioAtencion;
    document.getElementById("web").value = data.web;
    document.getElementById("coberturas").value = data.coberturas;
    document.getElementById("limite").value = data.limite;
    document.getElementById("envio").checked = data.envio;
    document.getElementById("horaEnvio").value = data.horaEnvio;
    document.getElementById("diasEnvio").value = data.diasEnvio;
    document.getElementById("calendario").value = data.calendario;
    document.getElementById("redireccion").value = data.redireccion;
    document.getElementById("urlApp").value = data.urlApp;
    document.getElementById("resto").value = data.resto;
    document.getElementById("telHumano").value = data.telHumano;
    document.getElementById("modo").value = data.modo;
    document.getElementById("puerto").value = data.puerto;
    document.getElementById("cuentas").value = data.cuentas;
    document.getElementById("perfil").value = data.perfil;
    document.getElementById("sucursal").value = data.sucursal;
    document.getElementById("sinPubli").checked = data.sinPubli;
    document.getElementById("base").value = data.base;
    document.getElementById("ventasTN").checked = data.ventasTN;
    if (data.servicios && Array.isArray(data.servicios)) {
        servicios = data.servicios;
        renderServicios();
    }
    if (data.doctores && Array.isArray(data.doctores)) {
        doctores = data.doctores;
        renderDoctores();
    }
    if (data.excluir && Array.isArray(data.excluir)) {
        excluir = data.excluir;
        renderExcluir();
    }
    if (data.validaciones && Array.isArray(data.validaciones)) {
        validaciones = data.validaciones;
        renderExcluir();
    }
    if (data.feriados && Array.isArray(data.feriados)) {
        grillaFeriados = data.feriados;
        renderFeriados('feriados', grillaFeriados);
    }
    document.getElementById("ia").value = data.ia;
    cambiarModelo(data.ia)
    document.getElementById(data.ia).value = data.iaModel;
};

const addFeriado = () => {
    const fechaFeriado = document.getElementById("fechaFeriado").value;
    if (fechaFeriado == '') return;
    grillaFeriados.push(fechaFeriado);
    renderFeriados('feriados', grillaFeriados);
};

const cambioFecha1 = (id1, id2) => {
    const fechaFeriado1 = document.getElementById(id1);
    const fechaFeriado2 = document.getElementById(id2);
    if (fechaFeriado1.value == '') return;
    fechaFeriado2.min = fechaFeriado1.value;
    fechaFeriado2.value = fechaFeriado1.value;
};

const cambioFecha2 = (id1, id2) => {
    const fechaFeriado1 = document.getElementById(id1);
    const fechaFeriado2 = document.getElementById(id2);
    if (fechaFeriado1.value == '' || fechaFeriado2.value == '') return;
    const control1 = new Date(fechaFeriado1.value);
    const control2 = new Date(fechaFeriado2.value);
    if (control1 > control2) fechaFeriado2.value = fechaFeriado1.value;
};

const addFeriado2 = () => {
    const fechaFeriado1 = document.getElementById("fechaFeriados1").value;
    const fechaFeriado2 = document.getElementById("fechaFeriados2").value;
    if (fechaFeriado1 == '' || fechaFeriado2 == '') return;
    const control1 = new Date(fechaFeriado1);
    const control2 = new Date(fechaFeriado2);
    if (control1 > control2) return;
    grillaFeriados.push(fechaFeriado1 + ';' + fechaFeriado2);
    renderFeriados('feriados', grillaFeriados);
};


const renderFeriados = (id, feriados, indexDoctor) => {
    const tabla = document.getElementById(id);
    if (id == 'feriados') tabla.innerHTML = htmlFeriados(feriados, id);
    else tabla.innerHTML = htmlFilasferiadoDoctor(doctores[indexDoctor], indexDoctor);
}

const htmlFeriados = (feriados, id) => {
    let html = '';
    feriados.map((feriado, index) => {
        let fecha1 = feriado.split(';')[0];
        let fecha2 = '';
        fecha1 = new Date(fecha1);
        fecha1.setHours(fecha1.getHours() + 3);
        if (feriado.indexOf(';') >= 0) {
            fecha2 = feriado.split(';')[1];
            fecha2 = new Date(fecha2);
            fecha2.setHours(fecha2.getHours() + 3);
        }
        html += `
        <div class="itemFeriado">
            <span>${formatoFecha(fecha1, false, false, false, false)} ${fecha2 !== '' ? ` Al ${formatoFecha(fecha2, false, false, false, false)}` : ''}</span>
            <button  class="btn" onclick="eliminarFeriado('${id}', ${index})">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        </div>
        `;
    });
    return html;
}

const eliminarFeriado = (id, index, indexDoctor) => {
    if (id == 'feriados') {
        grillaFeriados = grillaFeriados.filter((feriado, i) => i !== index);
        renderFeriados(id, grillaFeriados);
    } else {
        doctores[indexDoctor].feriados = doctores[indexDoctor].feriados.filter((feriado, i) => i !== index);
        renderFeriados(`${indexDoctor}feriados`, doctores[indexDoctor].feriados, indexDoctor)
    }
}

const renderServicios = () => {
    const tabla = document.getElementById("detalleServicios");
    tabla.innerHTML = "";
    let html = ''
    servicios.map((servicio, index) => {
        html += `
        <div class="filaServ">
            <div class="colServ"><input type="text" class="inputServ" id="nombre${index}" value="${servicio.nombre}" onchange="editar(${index})"></div>
            <div class="colServ"><input type="text" class="inputServ" id="descrip${index}" value="${servicio.descripcion}" onchange="editar(${index})"></div>
            <div class="colServ">
                <button  class="btn" onclick="eliminar(${index})">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
            <div class="colServ"><input type="number" inputmode="tel" class="inputServN" id="pr${index}" value="${servicio.precio}" onchange="editar(${index})"></div>
        </div>`
    });
    tabla.innerHTML = html;
}

const editar = (index) => {
    const nombre = document.getElementById(`nombre${index}`).value;
    const precio = document.getElementById(`pr${index}`).value;
    const descripcion = document.getElementById(`descrip${index}`).value;
    servicios[index] = {
        nombre,
        precio,
        descripcion,
    }
    renderServicios();
}

const eliminar = (index) => {
    servicios = servicios.filter((servicio, i) => i !== index);
    renderServicios();
}

const agregar = () => {
    servicios.push({
        nombre: '',
        precio: '',
        descripcion: '',
    });
    renderServicios();
}

const objAgenda = (doctor) => {
    const at = [];
    for (let d = 0; d <= 9; d++) {
        if (d === 7 || d === 8) continue;
        const dia = {
            dia: d,
            nombre: diaSemana(d),
            atencion: document.getElementById(`aten${doctor}${d}`).checked,
            desde: document.getElementById(`inicio${doctor}${d}`).value,
            hasta: document.getElementById(`fin${doctor}${d}`).value,
            corteDesde: document.getElementById(`corteD${doctor}${d}`).value,
            corteHasta: document.getElementById(`corteH${doctor}${d}`).value,
        }
        if (dia.corteDesde.toString() == '00:00') dia.corteDesde = '';
        if (dia.corteHasta.toString() == '00:00') dia.corteHasta = '';
        if (dia.corteDesde.toString() == dia.corteHasta.toString()) {
            dia.corteDesde = '';
            dia.corteHasta = '';
        };
        if (dia.desde.toString() == '00:00') dia.desde = '';
        if (dia.hasta.toString() == '00:00') dia.hasta = '';
        if (dia.desde.toString() == dia.hasta.toString()) {
            dia.desde = '';
            dia.hasta = '';
            dia.atencion = false;
        };
        at.push(dia);
    }
    return at;
}

const renderDoctores = () => {
    const tabla = document.getElementById("detalleDoctores");
    tabla.innerHTML = "";
    let html = ''
    doctores.map((doctor, index) => {
        html += `
        <div style="border: 2px solid grey; border-radius: 15px; padding: 5px; margin-bottom: 15px">
            <div class="filaDoctor">
                <div class="colDoctor" style="font-weight: bolder;">Nombre</div>
                <div class="colDoctor" style="font-weight: bolder;">Emoji</div>
                <div class="colDoctor" style="font-weight: bolder;">Acciones</div>
            </div>    
            <div class="filaDoctor">
                <div class="colDoctor"><input type="text" class="inputServ" id="doctor${index}" value="${doctor.nombre}" onchange="editarDoctor(${index})"></div>
                <div class="colDoctor"><input type="text" class="inputServ" id="doctorEmoji${index}" value="${doctor.emoji}" onchange="editarDoctor(${index})"></div>
                <div class="colServ">
                    <button  class="btn" onclick="eliminarDoctor(${index})">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </div>
            ${htmlAgendaDoctor(doctor)}
            ${htmlTurnosDoctor(doctor, index)}
            ${htmlFeriadosDoctor(doctor, index)}
        </div>
        `
    });
    tabla.innerHTML = html;

    doctores.map((doctor) => {
        doctor.agenda.map((dia) => {
            document.getElementById(`aten${doctor.nombre}${dia.dia}`).checked = dia.atencion;
            document.getElementById(`inicio${doctor.nombre}${dia.dia}`).value = dia.desde;
            document.getElementById(`fin${doctor.nombre}${dia.dia}`).value = dia.hasta;
            document.getElementById(`corteD${doctor.nombre}${dia.dia}`).value = dia.corteDesde;
            document.getElementById(`corteH${doctor.nombre}${dia.dia}`).value = dia.corteHasta;
        });
    });
}

const editarDoctor = (index) => {
    const nombre = document.getElementById(`doctor${index}`).value;
    const emoji = document.getElementById(`doctorEmoji${index}`).value;
    const agenda = doctores[index].agenda;
    const tiposTurno = doctores[index].tiposTurno;
    doctores[index] = {
        nombre,
        emoji,
        agenda,
        tiposTurno
    }
    renderDoctores();
}

const eliminarDoctor = (index) => {
    doctores = doctores.filter((doctor, i) => i !== index);
    renderDoctores();
}

const agregarDoctor = () => {
    doctores.push({
        nombre: '',
        emoji: '',
        agenda: [],
        tiposTurno: []
    });
    renderDoctores();
}


const htmlFilaAgenda = (d, doctor) => {
    const nombre = doctor.nombre;
    let at = doctor.agenda.find((dia) => dia.dia === d);
    if (!at) at = { dia: d, nombre: diaSemana(d), atencion: false, desde: '00:00', hasta: '00:00', corteDesde: '00:00', corteHasta: '00:00' }
    html = `
    <div class="filaAten">
        <div class="colAten" style="font-weight: bolder;">${at.nombre}</div>
        <div class="colAten"><input id="aten${nombre}${d}" type="checkbox" role="switch" ${at.atencion && 'checked'}></div>
        <div class="colAten" style="font-weight: bolder;"><input type="time" value="${at.desde}" id="inicio${nombre}${d}"></div>
        <div class="colAten" style="font-weight: bolder;"><input type="time" value="${at.hasta}" id="fin${nombre}${d}"></div>
        <div class="colAten" style="font-weight: bolder;"><input type="time" value="${at.corteD}" id="corteD${nombre}${d}"></div>
        <div class="colAten" style="font-weight: bolder;"><input type="time" value="${at.corteH}" id="corteH${nombre}${d}"></div>
    </div>
    `
    return html;
}

const htmlAgendaDoctor = (doctor) => {
    let html = `
    <label for="atencion">Días y Horas de Atención ${doctor.nombre}:</label>
    <div class="filaAten">
        <div class="colAten" style="font-weight: bolder;">Día</div>
        <div class="colAten" style="font-weight: bolder;">Atiende ?</div>
        <div class="colAten" style="font-weight: bolder;">Inicio</div>
        <div class="colAten" style="font-weight: bolder;">Fin</div>
        <div class="colAten" style="font-weight: bolder;">Corte Desde</div>
        <div class="colAten" style="font-weight: bolder;">Corte Hasta</div>
    </div>
    `
    for (let d = 0; d <= 9; d++) {
        if (d === 7 || d === 8) continue;
        html += htmlFilaAgenda(d, doctor)
    }
    return html;
}

const htmlFilaTurno = (turno, index, indexDoctor) => {
    html = `
    <div class="filaTipoTurno">
        <div class="colServ"><input type="text" class="inputServ" id="turno${index}${indexDoctor}" value="${turno.nombre}" onchange="editarTurno(${index}, ${indexDoctor})"></div>
        <div class="colServ"><input type="text" class="inputServN" id="duracion${index}${indexDoctor}" value="${turno.duracion}" onchange="editarTurno(${index}, ${indexDoctor})"></div>
        <div class="colServ"><input id="habilitado${index}${indexDoctor}" type="checkbox" role="switch" ${turno.habilitado && 'checked'} onchange="editarTurno(${index}, ${indexDoctor})"></div>
        <div class="colServ">
            <button  class="btn" onclick="eliminarTurno(${index}, ${indexDoctor})">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        </div>
    </div>`
    return html;
}

const htmlTurnosDoctor = (doctor, indexDoctor) => {
    let html = `
    <div style="margin-top: 20px; margin-bottom; 40px;">
        <div class="servicios" style="margin: 20px 0px">
            <label for="atencion">Tipos de Turnos y Duración ${doctor.nombre}:</label>
            <button class="btn" type="button" onclick="agregarTurno(${indexDoctor})">
                <i class="fa-solid fa-plus"></i>
                Agregar Tipo de Turno
            </button>
        </div>
        <div class="filaTipoTurno">
            <div class="colServ" style="font-weight: bolder;">Tipo Turno</div>
            <div class="colServ" style="font-weight: bolder;">Duración</div>
            <div class="colServ" style="font-weight: bolder;">Habilitado Paciente</div>
            <div class="colServ" style="font-weight: bolder;">Acción</div>
        </div>`
    doctor.tiposTurno &&
        doctor.tiposTurno.map((turno, index) => {
            html += htmlFilaTurno(turno, index, indexDoctor)
        });

    html += `</div>`;
    return html;
}

const editarTurno = (index, indexDoctor) => {
    const tiposTurno = doctores[indexDoctor].tiposTurno;
    tiposTurno[index] = {
        nombre: document.getElementById(`turno${index}${indexDoctor}`).value,
        duracion: document.getElementById(`duracion${index}${indexDoctor}`).value,
        habilitado: document.getElementById(`habilitado${index}${indexDoctor}`).checked
    }
    doctores[indexDoctor] = {
        ...doctores[indexDoctor],
        tiposTurno
    }
}

const eliminarTurno = (index, indexDoctor) => {
    doctores[indexDoctor].tiposTurno.splice(index, 1);
    renderDoctores();
}

const agregarTurno = (indexDoctor) => {
    let tiposTurno = [];
    if (doctores[indexDoctor].tiposTurno) tiposTurno = doctores[indexDoctor].tiposTurno;
    tiposTurno.push({
        nombre: '',
        duracion: 0,
        habilitado: true
    });
    doctores[indexDoctor] = {
        ...doctores[indexDoctor],
        tiposTurno
    }
    renderDoctores();
}

const htmlFilaFeriado = (feriado, index, indexDoctor) => {
    let fecha1 = feriado.split(';')[0];
    let fecha2 = '';
    fecha1 = new Date(fecha1);
    fecha1.setHours(fecha1.getHours() + 3);
    if (feriado.indexOf(';') >= 0) {
        fecha2 = feriado.split(';')[1];
        fecha2 = new Date(fecha2);
        fecha2.setHours(fecha2.getHours() + 3);
    }
    html = `
    <div class="itemFeriado">
        <span>${formatoFecha(fecha1, false, false, false, false)} ${fecha2 !== '' ? ` Al ${formatoFecha(fecha2, false, false, false, false)}` : ''}</span>
        <button  class="btn" onclick="eliminarFeriado('${indexDoctor}feriados', ${index}, ${indexDoctor})">
            <i class="fa-solid fa-trash-can"></i>
        </button>
    </div>`
    return html;
}

const htmlFeriadosDoctor = (doctor, indexDoctor) => {
    let html = `
    <div class="feriadosPicker">
      <label class="label">Período sin Atención </label>
      <label class="labelFeriado">Desde: </label><input type="date" id="${indexDoctor}fechaFeriados1" style="font-size: large;" onchange="cambioFecha1('${indexDoctor}fechaFeriados1', '${indexDoctor}fechaFeriados2')" />
      <label for="fechaFeriados2" class="labelFeriado">Hasta: </label><input type="date" id="${indexDoctor}fechaFeriados2" style="font-size: large;" onchange="cambioFecha2('${indexDoctor}fechaFeriados1', '${indexDoctor}fechaFeriados2')" />
      <button type="button" class="btn" onclick="agregarFeriadoDoctor(${indexDoctor})">
        <i class="fa-solid fa-plus"></i>
        Agregar Período
      </button>
    </div>
    <div id="${indexDoctor}feriados" style="display: flex; flex-wrap: wrap;">`;
    html += htmlFilasferiadoDoctor(doctor, indexDoctor);
    html += `</div>`;
    return html;
}

const htmlFilasferiadoDoctor = (doctor, indexDoctor) => {
    let html = '';
    doctor.feriados &&
        doctor.feriados.map((feriado, index) => {
            html += htmlFilaFeriado(feriado, index, indexDoctor)
        });
    return html;
}

const agregarFeriadoDoctor = (indexDoctor) => {
    const fechaFeriado1 = document.getElementById(`${indexDoctor}fechaFeriados1`).value;
    const fechaFeriado2 = document.getElementById(`${indexDoctor}fechaFeriados2`).value;
    if (fechaFeriado1 == '' || fechaFeriado2 == '') return;
    const control1 = new Date(fechaFeriado1);
    const control2 = new Date(fechaFeriado2);
    if (control1 > control2) return;
    if (!doctores[indexDoctor].feriados) doctores[indexDoctor].feriados = [];
    doctores[indexDoctor].feriados.push(fechaFeriado1 + ';' + fechaFeriado2);
    renderFeriados(`${indexDoctor}feriados`, doctores[indexDoctor].feriados, indexDoctor);
}



const registrar = async (reiniciar) => {
    let cartel = document.getElementById('cartel');
    cartel.style.display = 'none';

    doctores.map((doctor, index) => {
        doctores[index].agenda = objAgenda(doctor.nombre);
    });
    const data = {
        nombreConsultorio: document.getElementById("nombreConsultorio").value,
        domicilio: document.getElementById("domicilio").value,
        telefono: document.getElementById("telefono").value,
        mail: document.getElementById("mail").value,
        horarioAtencion: document.getElementById("horarioAtencion").value,
        web: document.getElementById("web").value,
        coberturas: document.getElementById("coberturas").value,
        limite: document.getElementById("limite").value,
        feriados: grillaFeriados,
        envio: document.getElementById("envio").checked,
        horaEnvio: document.getElementById("horaEnvio").value,
        diasEnvio: document.getElementById("diasEnvio").value,
        calendario: document.getElementById("calendario").value == '' ? 'primary' : document.getElementById("calendario").value,
        redireccion: document.getElementById("redireccion").value,
        urlApp: document.getElementById("urlApp").value,
        resto: document.getElementById("resto").value,
        ia: document.getElementById("ia").value,
        iaModel: document.getElementById(document.getElementById("ia").value).value,
        telHumano: document.getElementById("telHumano").value,
        modo: document.getElementById("modo").value,
        puerto: document.getElementById("puerto").value,
        cuentas: document.getElementById("cuentas").value,
        perfil: document.getElementById("perfil").value,
        sucursal: document.getElementById("sucursal").value,
        sinPubli: document.getElementById("sinPubli").checked,
        base: document.getElementById("base").value,
        ventasTN: document.getElementById("ventasTN").checked,
        servicios,
        doctores,
        excluir,
        reiniciar,
        validaciones
    };
    const res = await guardarDatos(data);
    if (res.ok) {
        cartel.style.display = 'flex';
    }
}


const guardarDatos = async (data) => {
    try {
        const res = await fetch("/config", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })
        data = await res.json()
        return data
    } catch (error) {
        console.log(new Date().toLocaleString()+'  -  '+'ERROR', error)
        return {}
    }
}

const cambioIA = () => {
    const ia = document.getElementById("ia");
    cambiarModelo(ia.value)
}

const cambiarModelo = (value) => {
    const openai = document.getElementById("openai");
    const anthropic = document.getElementById("anthropic");
    const gemini = document.getElementById("gemini");
    switch (value) {
        case 'openai':
            openai.style.display = 'block';
            anthropic.style.display = 'none';
            gemini.style.display = 'none';
            break;
        case 'anthropic':
            openai.style.display = 'none';
            anthropic.style.display = 'block';
            gemini.style.display = 'none';
            break;
        case 'gemini':
            openai.style.display = 'none';
            anthropic.style.display = 'none';
            gemini.style.display = 'block';
            break;
    }
}

const agregarExcluir = () => {
    excluir.push({
        siEsta: [],
        palabrasAExcluirSiNoEstan: []
    });
    renderExcluir();
}

const eliminarExcluir = (index) => {
    excluir = excluir.filter((excluir, i) => i !== index);
    renderExcluir();
}

const renderExcluir = () => {
    const tabla = document.getElementById("detalleExcluir");
    tabla.innerHTML = "";
    let html = ''
    excluir.map((excluir, index) => {
        html += `
        <div class="filaDoctor filaExcluir">
            <div class="colDoctor"><input type="text" class="inputServ" id="excluirSE${index}" value="${excluir.siEsta.join(';')}" onchange="editarExcluir(${index})"></div>
            <div class="colDoctor"><input type="text" class="inputServ" id="excluirP${index}" value="${excluir.palabrasAExcluirSiNoEstan.join(';')}" onchange="editarExcluir(${index})"></div>
            <div class="colServ">
                <button  class="btn" onclick="eliminarExcluir(${index})">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        </div>
        `
    });
    tabla.innerHTML = html;
}

const editarExcluir = (index) => {
    const siEsta = document.getElementById(`excluirSE${index}`).value.split(';');
    const pala = document.getElementById(`excluirP${index}`).value.split(';');
    excluir[index] = {
        siEsta: siEsta.map(p => p.trim()),
        palabrasAExcluirSiNoEstan: pala.map(p => p.trim())
    }
    renderExcluir();
}


const cambioMenu = (menu) => {
    const menuEmpresa = document.getElementById("seccionEmpresa");
    const menuConsultorio = document.getElementById("seccionConsultorio");
    const menuPalabras = document.getElementById("seccionPalabras");
    const menuRegistrar = document.getElementById("seccionRegistrar");
    const menuTecnica = document.getElementById("seccionTecnica");
    const menuPrompt = document.getElementById("seccionPrompt");
    const menuCuentas = document.getElementById("seccionCuentas");
    const menuValidar = document.getElementById("seccionValidar");
    menuEmpresa.style.display = 'none';
    menuConsultorio.style.display = 'none';
    menuPalabras.style.display = 'none';
    menuTecnica.style.display = 'none';
    menuCuentas.style.display = 'none';
    menuValidar.style.display = 'none';
    menuRegistrar.style.display = 'block';
    switch (menu) {
        case 'empresa':
            menuEmpresa.style.display = 'flex';
            menuEmpresa.style.flexWrap = 'wrap';
            break;
        case 'consultorio':
            menuConsultorio.style.display = 'block';
            break;
        case 'palabras':
            menuPalabras.style.display = 'block';
            break;
        case 'tecnica':
            menuTecnica.style.display = 'flex';
            menuTecnica.style.flexWrap = 'wrap';
            break;
        case 'prompt':
            menuPrompt.showModal();
            menuRegistrar.style.display = 'none';
            cambioTipoPrompt();
            break;
        case 'cuentas':
            menuCuentas.style.display = 'block';
            menuRegistrar.style.display = 'none';
            pedirCuentas();
            break;
        case 'validacion':
            menuValidar.style.display = 'block';
            pedirValidaciones();
            break;
        case '':
            menuRegistrar.style.display = 'none';
            break;
    }
}

const pedirPrompt = async (nombre) => {
    try {
        const res = await fetch("/config/prompt?nombre=" + nombre)
        const data = res.json()
        return data
    } catch (error) {
        console.log(new Date().toLocaleString()+'  -  '+'ERROR', error)
        return {}
    }
}

const cambioTipoPrompt = async () => {
    const nombre = document.getElementById("tipoPrompt").value;
    const prompt = await pedirPrompt(nombre);
    document.getElementById("prompt").value = prompt.prompt;
    document.getElementById("cartelPrompt").style.display = 'none';
}


const guardarPrompt = async (prompt, nombre) => {
    try {
        const res = await fetch("/config/prompt?nombre=" + nombre, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt: prompt }),
        })
        data = await res.json()
        return data
    } catch (error) {
        console.log(new Date().toLocaleString()+'  -  '+'ERROR', error)
        return {}
    }
}

const registrarPrompt = async () => {
    const nombre = document.getElementById("tipoPrompt").value;
    const prompt = document.getElementById("prompt").value;
    const res = await guardarPrompt(prompt, nombre);
    if (res.ok) {
        document.getElementById("cartelPrompt").style.display = 'flex';
    }
}

const closeModal = () => {    
    const menuPrompt = document.getElementById("seccionPrompt");
    menuPrompt.close();
}

const pedirCuentas = async () => {
    try {
        const res = await fetch("/config/cuentas")
        const data = await res.json()
        cuentas = data.cuentas
        renderCuentas();
    } catch (error) {
        console.log(new Date().toLocaleString()+'  -  '+'ERROR', error)
        return {}
    }
}

const guardarCuentas = async () => {
    try {
        const res = await fetch("/config/cuentas", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ cuentas: cuentas }),
        })
        data = await res.json()
        return data
    } catch (error) {
        console.log(new Date().toLocaleString()+'  -  '+'ERROR', error)
        return {}
    }
}

const renderCuentas = () => {
    console.log(new Date().toLocaleString()+'  -  '+cuentas)
    const tabla = document.getElementById("detalleCuentas");
    tabla.innerHTML = "";
    let html = ''
    cuentas.map((cuenta, index) => {
        html += `
        <div class="filaCuentas">
            <div class="colServ"><span>${cuenta.id}</span></div>
            <div class="colServ"><input type="text" class="inputServ" id="cuentaNombre${index}" value="${cuenta.nombre}"></div>
            <div class="colServ"><input id="cuentaBot${index}" type="checkbox" role="switch" ${cuenta.bot && 'checked'}></div>
            <div class="colServ">
                <button  class="btn" onclick="editarCuenta(${index})">
                    <i class="fa-solid fa-floppy-disk"></i>
                </button>
                 <button  class="btn" onclick="verEstado(${index})">
                    <i class="fa-solid fa-qrcode"></i>
                </button>
            </div>
            <div class="colServ"><input type="text" class="inputServ" id="cuentaBL${index}" value="${cuenta.blackList}"></div>
            <div class="filaCuentasRow"><input type="text" class="inputServ" id="cuentaURL${index}" value="${cuenta.url}"></div>
        </div>
        <div class="filaQr" id="filaQr-${cuenta.nombre}" style="display: none;">
            <div class="colServ">
                <img id="qr-${cuenta.nombre}" src="${cuentas[index].url}/${cuentas[index].nombre}" style="width: 300px; height: 300px; border-radius: 0%;">
            </div>
            <div class="colServ">
                <div class="seccEstado">
                    <span>Estado:</span>
                    <span id="estado-${cuenta.nombre}"></span>
                    <span>SO:</span>
                    <span id="so-${cuenta.nombre}"></span>
                    <span>Nombre:</span>
                    <span id="nombre-${cuenta.nombre}"></span>
                    <span>Número:</span>
                    <span id="numero-${cuenta.nombre}"></span>
                </div>
            </div>
        </div>
        `;
    });
    tabla.innerHTML = html;
}

const verEstado = (index) => {
    document.getElementById(`filaQr-${cuentas[index].nombre}`).style = 'display: flex;';
    actualizarEstado(index);    
}

const actualizarEstado = async (index) => {
    const res = await fetch(`${cuentas[index].url}/estado/${cuentas[index].nombre}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }
    })
    data = await res.json()
    console.log(new Date().toLocaleString()+'  -  '+data)
    document.getElementById(`estado-${cuentas[index].nombre}`).innerHTML = data.estado;
    document.getElementById(`so-${cuentas[index].nombre}`).innerHTML = data.so;
    document.getElementById(`nombre-${cuentas[index].nombre}`).innerHTML = data.nombre;
    document.getElementById(`numero-${cuentas[index].nombre}`).innerHTML = data.numero;
    actualizarImagen(cuentas[index].nombre);
    if (data.estado != 'open') {
        setTimeout(() => {
            actualizarEstado(index);
        }, 10000);
    }
}

const actualizarImagen = (nombreCuenta) => {
    const elementoImagen = document.getElementById(`qr-${nombreCuenta}`);
    const srcOriginal = elementoImagen.src.split('?')[0]; // Elimina cualquier parámetro de consulta existente
    const timestamp = new Date().getTime(); // Obtiene un timestamp actual
    elementoImagen.src = `${srcOriginal}?${timestamp}`; // Añade el timestamp como parámetro de consulta
}

const editarCuenta = (index) => {
    const nombre = document.getElementById(`cuentaNombre${index}`).value;
    const bl = document.getElementById(`cuentaBL${index}`).value;
    const bot = document.getElementById(`cuentaBot${index}`).checked;
    const url = document.getElementById(`cuentaURL${index}`).value;
    cuentas[index] = {
        ...cuentas[index],
        nombre,
        blackList: bl,
        bot,
        url
    }
    guardarCuentas();
}

const authorizeTN = () => {
    window.open("https://www.tiendanube.com/apps/970/authorize?state=csrf-code", "_blank");
};

const solicitarTN = async () => {
    try {
        const res = await fetch("/config/tn", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                code: document.getElementById("codeTN").value
            })
        })
        data = await res.json()
        if (data.ok) {
            document.getElementById("cartelTN").style.display = 'flex';
        }
        return data
    } catch (error) {
        console.log(new Date().toLocaleString()+'  -  '+'ERROR', error)
        return {}
    }
}


const pedirValidaciones = async () => {
    try {
        const res = await fetch("/config")
        const data = await res.json()
        if (data.validaciones && data.validaciones.length > 0) {
            validaciones = data.validaciones;
        } else {
            validaciones = [];
        }
        renderValidaciones();
    } catch (error) {
        console.log(new Date().toLocaleString()+'  -  '+'ERROR', error)
        return {}
    }
}


const agregarValidacion = () => {
    validaciones.push({
        numero: '',
        nombre: '',
        base: '',
        token: '',
        activa: true
    });
    renderValidaciones();
}

const renderValidaciones = () => {
    const tabla = document.getElementById("detalleValidaciones");
    tabla.innerHTML = "";
    let html = ''
    validaciones.map((val, index) => {
        html += `
        <div class="filaValidaciones">
            <div class="colValidaciones"><input type="text" class="inputServ" placeholder="Número Celular" onChange="editarValidacion(${index})" id="validacionNumero${index}" value="${val.numero}"></div>
            <div class="colValidaciones"><input type="text" class="inputServ" placeholder="Nombre" onChange="editarValidacion(${index})" id="validacionNombre${index}" value="${val.nombre}"></div>
            <div class="colValidaciones"><input type="text" class="inputServ" placeholder="Bases de Datos" onChange="editarValidacion(${index})" id="validacionBase${index}" value="${val.base.toString()}"></div>
            <div class="colValidaciones"><input type="text" class="inputServ" placeholder="Token OpenAI" onChange="editarValidacion(${index})" id="validacionToken${index}" value="${val.token}"></div>
            <div class="colValidaciones"><input type="checkbox" role="switch" onChange="editarValidacion(${index})" id="validacionActivo${index}" ${val.activo && 'checked'}></div>
            <div class="colValidaciones">
                <button  class="btn" onclick="eliminarValidacion(${index})">
                     <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        </div>
        `;
    });
    tabla.innerHTML = html;
}

const editarValidacion = (index) => {
    const numero = document.getElementById(`validacionNumero${index}`).value;
    const nombre = document.getElementById(`validacionNombre${index}`).value;
    const base = document.getElementById(`validacionBase${index}`).value;
    const token = document.getElementById(`validacionToken${index}`).value;
    const activo = document.getElementById(`validacionActivo${index}`).checked;
    validaciones[index] = {
        numero,
        nombre,
        base,
        token,
        activo
    }
    console.log(new Date().toLocaleString()+'  -  '+validaciones)
}

const eliminarValidacion = (index) => {
    validaciones = validaciones.filter((val, i) => i !== index);
    renderValidaciones();
}