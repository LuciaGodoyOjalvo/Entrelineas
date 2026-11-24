/* =========================================================
   Entrelíneas · Calendario de quedadas
   Cada club queda una vez por semana (su día y hora).
   ========================================================= */
"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const estado = leerEstado();
    const hoy = soloFecha(new Date());

    let mesVisible = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    let diaSeleccionado = hoy;

    const titulo = document.getElementById("tituloMes");
    const dias = document.getElementById("diasCalendario");
    const soloMios = document.getElementById("soloMisClubes");
    const tituloAgenda = document.getElementById("tituloAgenda");
    const listaAgenda = document.getElementById("listaAgenda");
    const agendaVacia = document.getElementById("agendaVacia");

    document.getElementById("mesAnterior").addEventListener("click", () => cambiarMes(-1));
    document.getElementById("mesSiguiente").addEventListener("click", () => cambiarMes(1));
    document.getElementById("botonHoy").addEventListener("click", () => {
        mesVisible = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        diaSeleccionado = hoy;
        pintar();
    });
    soloMios.addEventListener("change", pintar);

    dias.addEventListener("click", (e) => {
        const boton = e.target.closest("[data-dia]");
        if (!boton) return;
        diaSeleccionado = new Date(mesVisible.getFullYear(), mesVisible.getMonth(), Number(boton.dataset.dia));
        pintar();
        if (window.matchMedia("(max-width: 991.98px)").matches) {
            document.querySelector(".agenda").scrollIntoView({ behavior: "smooth", block: "start" });
        }
    });

    function cambiarMes(salto) {
        mesVisible = new Date(mesVisible.getFullYear(), mesVisible.getMonth() + salto, 1);
        // Seleccionamos hoy si es este mes; si no, el día 1
        diaSeleccionado = mismoMes(hoy, mesVisible) ? hoy : new Date(mesVisible);
        pintar();
    }

    /* Clubes que quedan en una fecha concreta */
    function quedadasDe(fecha) {
        return CLUBES
            .filter((club) => club.diaSemana === fecha.getDay())
            .filter((club) => !soloMios.checked || estado.misClubes.includes(club.id))
            .sort((a, b) => a.hora.localeCompare(b.hora));
    }

    function pintar() {
        pintarMes();
        pintarAgenda();
    }

    function pintarMes() {
        const anio = mesVisible.getFullYear();
        const mes = mesVisible.getMonth();
        titulo.textContent = `${capitalizar(MESES[mes])} ${anio}`;

        const diasEnMes = new Date(anio, mes + 1, 0).getDate();
        const huecos = (new Date(anio, mes, 1).getDay() + 6) % 7; // la semana empieza en lunes

        let html = '<span class="dia dia--vacio" aria-hidden="true"></span>'.repeat(huecos);

        for (let d = 1; d <= diasEnMes; d++) {
            const fecha = new Date(anio, mes, d);
            const quedadas = quedadasDe(fecha);
            const clases = ["dia"];
            if (fecha.getTime() === hoy.getTime()) clases.push("dia--hoy");
            if (fecha < hoy) clases.push("dia--pasado");

            const seleccionado = fecha.getTime() === diaSeleccionado.getTime();
            const etiqueta = `${d} de ${MESES[mes]}, ${quedadas.length === 0 ? "sin quedadas" : quedadas.length === 1 ? "1 quedada" : `${quedadas.length} quedadas`}`;

            const pastillas = quedadas.slice(0, 2).map((c) =>
                `<span class="dia__evento color--${LIBROS[c.libro].color}">${c.hora} ${escaparHTML(c.nombre)}</span>`).join("");
            const mas = quedadas.length > 2 ? `<span class="dia__mas">+${quedadas.length - 2} más</span>` : "";
            const puntos = quedadas.map((c) => `<span class="punto color--${LIBROS[c.libro].color}"></span>`).join("");

            html += `
                <button type="button" class="${clases.join(" ")}" data-dia="${d}" aria-pressed="${seleccionado}" aria-label="${etiqueta}">
                    <span class="dia__numero">${d}</span>
                    ${pastillas}${mas}
                    <span class="dia__puntos">${puntos}</span>
                </button>`;
        }
        dias.innerHTML = html;
    }

    function pintarAgenda() {
        const quedadas = quedadasDe(diaSeleccionado);
        const esHoy = diaSeleccionado.getTime() === hoy.getTime();
        tituloAgenda.textContent = (esHoy ? "Hoy, " : "") + formatearFecha(diaSeleccionado);

        agendaVacia.hidden = quedadas.length > 0;
        listaAgenda.innerHTML = quedadas.map((club) => {
            const libro = LIBROS[club.libro];
            const donde = club.modalidad === "en línea" ? "En línea" : `${club.lugar}, ${club.ciudad}`;
            return `
            <li class="entrada entrada--lista">
                <div class="entrada__resguardo">
                    <span class="antetitulo-mini">${DIAS_SEMANA[club.diaSemana].slice(0, 3)}</span>
                    <span class="entrada__hora">${club.hora}</span>
                </div>
                <div class="entrada__datos">
                    <a href="clubes.html#${club.id}" class="entrada__club">${escaparHTML(club.nombre)}</a>
                    <span class="texto-pequeno secundario">${escaparHTML(donde)}</span>
                    <span class="texto-pequeno enlace-turquesa fw-semibold">${escaparHTML(libro.titulo)}</span>
                </div>
            </li>`;
        }).join("");

        if (!quedadas.length && soloMios.checked) {
            agendaVacia.textContent = "Tus clubes no quedan este día. Desactiva «Solo mis clubes» para ver el resto.";
        } else {
            agendaVacia.textContent = "Este día no hay quedadas. ¡Día de leer a tu aire!";
        }
    }

    pintar();
});

function soloFecha(fecha) {
    return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
}

function mismoMes(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function capitalizar(texto) {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
}
