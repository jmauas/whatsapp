const formatoFecha = (sfecha, hs, sec, americana, dia) => {
    if (sfecha != undefined) {
        let fh;
        try {
            fh = new Date(sfecha.toString().replace(/\s/, 'T'));
            if (fh.toString() == "Invalid Date") {
                fh = sfecha;
            }
        } catch {
            fh = sfecha;
        }
        let fhtxt = zfill(parseInt(fh.getDate()), 2) + '/' + zfill((parseInt(fh.getMonth()) + 1), 2) + "/" + parseInt(fh.getFullYear());
        if (americana) { fhtxt = fechaAmericana(fhtxt) }
        if (hs) { fhtxt += ' ' + zfill(parseInt(fh.getHours()), 2) + ':' + zfill(parseInt(fh.getMinutes()), 2) };
        if (sec) { fhtxt += ':' + zfill(parseInt(fh.getSeconds()), 2) };
        if (dia) { fhtxt += ' ' + diaSemana(fh.getDay()) }
        return fhtxt;
    } else {
        return '01/01/1900';
    }
}

const diaSemana = (dia) => {
    switch (dia) {
        case 0: return 'Domingo';
        case 1: return 'Lunes';
        case 2: return 'Martes';
        case 3: return 'Miércoles';
        case 4: return 'Jueves';
        case 5: return 'Viernes';
        case 6: return 'Sábado';
        case 9: return 'Feriado';
        default: return '';
    }
}

const fechaAmericana = (f) => {
    let ano = f.substring(6, 10) * 1;
    let mes = f.substring(3, 5) * 1;
    let dia = f.substring(0, 2) * 1;
    let fecha = zfill(ano, 4) + '-' + zfill(mes, 2) + '-' + zfill(dia, 2)
    return fecha;
}

const fechaValida = (d) => {
    if (Object.prototype.toString.call(d) === "[object Date]") {
        // it is a date
        if (isNaN(d.getTime())) {
            return false
        } else {
            return true
        }
    } else {
        return false
    }
}

const zfill = (number, width, deci) => {
    let numberOutput = Math.abs(number); /* Valor absoluto del n�mero */
    if (deci != undefined || deci > 0) {
        numberOutput = Number.parseFloat(numberOutput).toFixed(deci).toString();
    }
    let length = numberOutput.toString().length; /* Largo del n�mero */
    let zero = "0"; /* String de cero */
    if (width <= length) {
        if (number < 0) {
            return ("-" + numberOutput.toString());
        } else {
            return numberOutput.toString();
        }
    } else {
        if (number < 0) {
            return ("-" + (zero.repeat(width - length - 1)) + numberOutput.toString());
        } else {
            return zero.repeat(width - length) + numberOutput.toString();
        }
    }
}

const esNumero = (txt) => {
    if (txt == undefined) { txt = '' }
    txt = txt.toString();
    let num = txt.replaceAll(',', '.');
    var rsdo = true;
    if (isNaN(num)) { rsdo = false; }
    if (num == '') { rsdo = false; }
    return rsdo
}



const formatoSepMiles = (valor, deci = 0) => {
    valor = Number(valor);
    if (isNaN(valor)) { valor = 0; }
    return new Intl.NumberFormat("de-DE", { style: 'decimal', minimumFractionDigits: deci, maximumFractionDigits: deci }).format(valor);
}

const validarEmail = (mail) => {
    var validEmail = /^\w+([.-_+]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/;
    if (validEmail.test(mail)) {
        return true;
    } else {
        return false;
    }
} 