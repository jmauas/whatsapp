import { obtenerConfig } from '../global/config.global.js';
import { pedirEventos } from '../calendar/calendar.js';
import { esNumero, zfill, diaSemana } from '../../utils/auxiliares.js';

export const disponibilidad = async (minutosTurno, doctor, asa, ccr) => {
    const config = await obtenerConfig();
    const limite = new Date(config.limite);
    const fh1 = new Date();
    console.log(new Date().toLocaleString()+'  -  '+fh1.toISOString(), limite.toISOString())
    const data = await pedirEventos(fh1.toISOString(), limite.toISOString());
    if (data.ok === false) return {turnos: [], ok: false, mensaje: data.mensaje};
    const turnos = data.eventos;
    console.log(new Date().toLocaleString()+'  -  '+'Turnos', turnos.length, 'Limite', limite.toISOString())
    let feriados = agregarFeriados([], config.feriados);
	
	let agendas = [];
    let agenda = [];
    if (doctor === 'Indistinto') {
        //agendas = agendaIndistinta(config.doctores)
		config.doctores.map(doctor => {
			agenda = doctor.agenda.map(dia => {
				return { ...dia, doctor: doctor.nombre }
			});
			agendas.push(agenda);
		});
		//console.log(new Date().toLocaleString()+'  -  '+agendas)
    } else {
        agenda = config.doctores.find(d => d.nombre === doctor).agenda.map(dia => {
            return { ...dia, doctor: doctor }
        });
		agendas.push(agenda);
    }
    const disp = [];
	
	agendas.map(agenda => {
		let hoy = new Date();
		hoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
		hoy.setDate(hoy.getDate() + 1);
		//ANALIZO PENALIZACIÓN
		if (asa && asa === 'si') {
			hoy.setDate(hoy.getDate() + 30)
		} else if (ccr && ccr === 'si') {
			hoy.setDate(hoy.getDate() + 7)
		}
		hoy.setMinutes(hoy.getMinutes() - minutosTurno);
		const atenEnFeriado = { ...agenda.find(d => d.dia === 9) };
		try {
			while (hoy <= limite) {
				hoy.setMinutes(hoy.getMinutes() + minutosTurno);
				let fecha = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
				const fechaFer = new Date(fecha);
				fechaFer.setHours(fechaFer.getHours() - 3);
				let dia = hoy.getDay();
				const aten = { ...agenda.find(d => d.dia === dia) };
				const esFeriado = feriados.some(f =>
					f.getDate() === fechaFer.getDate() &&
					f.getMonth() === fechaFer.getMonth() &&
					f.getFullYear() === fechaFer.getFullYear()
				);
				const diasNoAitende = agregarFeriados([], config.doctores.find(d => d.nombre === aten.doctor).feriados);
				const noAtiende = diasNoAitende.some(f =>
					f.getDate() === fechaFer.getDate() &&
					f.getMonth() === fechaFer.getMonth() &&
					f.getFullYear() === fechaFer.getFullYear()
				);
				if (noAtiende) {
					aten.atencion = false;
				} else if (atenEnFeriado && esFeriado) {
					aten.atencion = atenEnFeriado.atencion;
					aten.desde = atenEnFeriado.desde;
					aten.hasta = atenEnFeriado.hasta;
					aten.corteDesde = atenEnFeriado.corteDesde;
					aten.corteHasta = atenEnFeriado.corteHasta;
				}
				if (!aten.atencion) {
					hoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
					hoy.setDate(hoy.getDate() + 1);
					hoy.setMinutes(hoy.getMinutes() - minutosTurno);
					continue;
				}
				const hora = hoy.getHours();
				const minutos = hoy.getMinutes();
				const hrInicio = Number(aten.desde.split(':')[0]);
				const minInicio = Number(aten.desde.split(':')[1]);
				const hrFin = Number(aten.hasta.split(':')[0]);
				const minFin = Number(aten.hasta.split(':')[1]);
				const hrCorteDesde = Number(aten.corteDesde.split(':')[0]);
				const minCorteDesde = Number(aten.corteDesde.split(':')[1]);
				const hrCorteHasta = Number(aten.corteHasta.split(':')[0]);
				const minCorteHasta = Number(aten.corteHasta.split(':')[1]);

				//console.log(new Date().toLocaleString()+'  -  '+'diaSemana', dia, 'hoy', hoy, 'Fecha para feriado', fechaFer, 'fecha', fecha, 'hora', hora, 'minutos', minutos, 'hrInicio', hrInicio, 'minInicio', minInicio, 'hrFin', hrFin, 'minFin', minFin)
				//console.log(new Date().toLocaleString()+'  -  '+'hora', hora, 'minutos', minutos, 'hrCorte', hrCorteDesde, minCorteDesde, 'hrCorteHasta', hrCorteHasta, minCorteHasta)
				if (hora < hrInicio) {
					hoy.setHours(hrInicio);
					hoy.setMinutes(hoy.getMinutes() - minutosTurno);
					continue;
				}
				if (hora === hrInicio && minutos < minInicio) {
					hoy.setMinutes(minInicio);
					hoy.setMinutes(hoy.getMinutes() - minutosTurno);
					continue;
				}
				if (hora > hrFin) {
					hoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
					hoy.setDate(hoy.getDate() + 1);
					hoy.setMinutes(hoy.getMinutes() - minutosTurno);
					continue;
				}
				if (hora === hrFin && minutos >= minFin) {
					hoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
					hoy.setDate(hoy.getDate() + 1);
					hoy.setMinutes(hoy.getMinutes() - minutosTurno);
					continue;
				}
				if (hora > hrCorteDesde && hora < hrCorteHasta) {
					hoy.setHours(hrCorteHasta);
					hoy.setMinutes(minCorteHasta - minutosTurno);
					continue;
				}
				if ((hora === hrCorteDesde && minutos > minCorteDesde) || (hora === hrCorteHasta && minutos < minCorteHasta)) {
					hoy.setHours(hrCorteHasta);
					hoy.setMinutes(minCorteHasta - minutosTurno);
					continue;
				}
				const turno = turnos.filter(t => {
					const inicioTurno = new Date(t.start.dateTime);
					const finTurno = new Date(t.end.dateTime);
					const finHoy = new Date(hoy).setMinutes(hoy.getMinutes() + minutosTurno);
					if ((inicioTurno < hoy && finTurno > hoy) || (inicioTurno >= hoy && inicioTurno < finHoy) || (finTurno > hoy && finTurno <= finHoy)) {
						return true;
					} else {
						return false
					}
				});
				if (turno && turno.length > 0) {
					const fin = new Date(turno[turno.length - 1].end.dateTime);
					hoy = new Date(fin);
					hoy.setMinutes(hoy.getMinutes() - minutosTurno);
					continue;
				}
				//const fh = hoy.getFullYear() + '-' + (hoy.getMonth() + 1) + '-' + hoy.getDate() + ' ' + hoy.getHours() + ':' + hoy.getMinutes() + ':00';
				fecha = hoy.getFullYear() + '-' + (hoy.getMonth() + 1) + '-' + hoy.getDate();
				const hr = hoy.getHours();
				const min = hoy.getMinutes();
				dia = disp.find(turno => turno.fecha == fecha);
				if (!dia) {
					disp.push({
						fecha: fecha,
						turnos: [{hora: hr, min: min, doctor: aten.doctor}]
					});
				} else {
					const index = disp.indexOf(dia);
					dia.turnos.push({hora: hr, min: min, doctor: aten.doctor});
					disp[index] = dia;
				}
			}
		} catch (error) {
			console.log(new Date().toLocaleString()+'  -  '+'Error en disponibilidad', error);
		}
	});
    return {turnos: disp, ok: true, mensaje: ''};
}

const agendaIndistinta = (doctores) => {
    const agenda = [];
    doctores.map(doc => {
        doc.agenda.map(nueva => {
            if (agenda.filter(a => a.dia === nueva.dia).length === 0) {
                agenda.push({ ...nueva, doctor: doc.nombre });
            } else {
                const agen = agenda.find(a => a.dia === nueva.dia);
                if (!agen.atencion && nueva.atencion) {
                    agen.atencion = true;
                    agen.doctor = doc.nombre
                }
                agen.desde = compararHoras(agen.desde, nueva.desde, 'desde');
                agen.hasta = compararHoras(agen.hasta, nueva.hasta, 'hasta');
                agen.corteDesde = compararHoras(agen.corteDesde, nueva.corteDesde, 'hasta');
                agen.corteHasta = compararHoras(agen.corteHasta, nueva.corteHasta, 'desde');
                agenda[agenda.findIndex(a => a.dia === nueva.dia)] = agen;
            }
        })
    })
    return agenda;
}

const compararHoras = (hora1, hora2, tipo) => {
    const h1 = hora1.split(':');
    const h2 = hora2.split(':');
    if (h1.length !== 2) return hora2;
    if (h2.length !== 2) return hora1;
    if (!esNumero(h1[0]) || !esNumero(h1[1])) return hora2;
    if (!esNumero(h2[0]) || !esNumero(h2[1])) return hora1;

    if (Number(h2[0]) === 0) return hora1;
    if (Number(h1[0]) === 0) return hora2;

    switch (tipo) {
        case 'desde':
            if (Number(h1[0]) > Number(h2[0])) {
                return hora2;
            } else if (Number(h1[0]) === Number(h2[0])) {
                if (Number(h1[1]) > Number(h2[1])) {
                    return hora2;
                } else {
                    return hora1;
                }
            } else {
                return hora1;
            }
            break;
        case 'hasta':
            if (Number(h1[0]) < Number(h2[0])) {
                return hora2;
            } else if (Number(h1[0]) === Number(h2[0])) {
                if (Number(h1[1]) < Number(h2[1])) {
                    return hora2;
                } else {
                    return hora1;
                }
            } else {
                return hora1;
            }
            break;
        default:
            return hora1;
    }
}


export const getDisponibilidad = async (req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    const { duracion, doctor, asa, ccr } = req.query;
    let agenda = [];
    if (duracion && doctor) agenda = await disponibilidad(Number(duracion), doctor, asa, ccr);
    if (agenda.ok === false) {
        res.end(JSON.stringify({ ok: false, mensaje: agenda.mensaje }));
        return;
    }
    agenda = agenda.turnos;
    if (agenda.length > 0) {
        agenda = agenda.map((dia) => {
			const f = new Date(dia.fecha);
            f.setHours(f.getHours()+3)
            return {
                fecha: f, 
                diaSemana: diaSemana(f.getDay()), 
                turnos: dia.turnos.map(turno => ({
                    hora: turno.hora, 
                    min: zfill(turno.min, 2, 0), 
                    doctor: turno.doctor
                }))
            };
        });
        //ORDENO EL ARRAY POR FECHA
        agenda.sort((a, b) => {
            if (a.fecha > b.fecha) {
                return 1;
            } else {
                return -1;
            }
        });
        //ORDENO EL ARRAY POR HORA Y POR MINUTOS DENTRO DE CADA DIA
        agenda.map(dia => {
            dia.turnos.sort((a, b) => {
                if (a.hora > b.hora) {
                    return 1;
                } else if (a.hora === b.hora) {
                    if (a.min > b.min) {
                        return 1;
                    } else {
                        return -1;
                    }
                } else {
                    return -1;
                }
            });
        });        
    }
    res.end(JSON.stringify({ ok: true, agenda }));
}


const agregarFeriados = (actual, agregar) => {
    if (!actual) actual = [];
    if (!agregar) return actual;
    agregar.map(f => {
        if (f.indexOf(';') >= 0) {
            let fecha1 = new Date(f.split(';')[0]);
            let fecha2 = new Date(f.split(';')[1]);
            while (fecha1 <= fecha2) {
                actual.push(new Date(fecha1));
                fecha1.setDate(fecha1.getDate() + 1);
            }
        } else {
            actual.push(new Date(f));
        }
    });
    return actual;
}