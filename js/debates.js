/* =========================================================
   Entrelíneas · Debates por capítulo
   Solo se pueden abrir los capítulos que el usuario ya ha leído
   (según su progreso en «Mis lecturas»).
   URL admite ?libro=orgullo&cap=12
   ========================================================= */
"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const estado = leerEstado();

    const listaLibros = document.getElementById("listaLibros");
    const listaCapitulos = document.getElementById("listaCapitulos");
    const mensajes = document.getElementById("hiloMensajes");
    const titulo = document.getElementById("hiloTitulo");
    const meta = document.getElementById("hiloMeta");
    const avisoCerrado = document.getElementById("avisoCerrado");
    const textoCerrado = document.getElementById("textoCerrado");
    const form = document.getElementById("formResponder");
    const campo = document.getElementById("campoRespuesta");

    // Libros con algún capítulo leído: leyendo primero, luego terminados
    const disponibles = Object.keys(estado.progreso)
        .filter((id) => LIBROS[id] && estado.progreso[id] > 0)
        .sort((a, b) => (estadoLectura(a, estado) === "leyendo" ? -1 : 1) - (estadoLectura(b, estado) === "leyendo" ? -1 : 1));

    if (!disponibles.length) {
        document.getElementById("hilo").innerHTML = `
            <div class="vacio">
                <p>Todavía no has marcado ningún capítulo como leído, así que no hay debates abiertos para ti.</p>
                <a href="lecturas.html" class="boton boton--mediano">Ir a mis lecturas</a>
            </div>`;
        listaLibros.innerHTML = "";
        return;
    }

    /* ---- Estado inicial desde la URL ---- */
    const parametros = new URLSearchParams(location.search);
    let libroActual = disponibles.includes(parametros.get("libro")) ? parametros.get("libro") : disponibles[0];
    let capActual = capituloValido(Number(parametros.get("cap"))) ? Number(parametros.get("cap")) : estado.progreso[libroActual];

    function capituloValido(cap) {
        return Number.isInteger(cap) && cap >= 1 && cap <= estado.progreso[libroActual];
    }

    /* ---- Eventos ---- */
    listaLibros.addEventListener("click", (e) => {
        const boton = e.target.closest("[data-libro]");
        if (!boton) return;
        libroActual = boton.dataset.libro;
        capActual = estado.progreso[libroActual];
        pintar();
    });

    listaCapitulos.addEventListener("click", (e) => {
        const boton = e.target.closest("[data-cap]");
        if (!boton) return;
        if (boton.getAttribute("aria-disabled") === "true") {
            boton.animate(
                [{ transform: "translateX(0)" }, { transform: "translateX(-4px)" }, { transform: "translateX(4px)" }, { transform: "translateX(0)" }],
                { duration: 250 }
            );
            mostrarAviso(`El capítulo ${boton.dataset.cap} se abrirá cuando lo marques como leído.`);
            return;
        }
        capActual = Number(boton.dataset.cap);
        pintar();
    });

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const texto = campo.value.trim();
        if (!texto) {
            campo.focus();
            return;
        }
        const clave = `${libroActual}-${capActual}`;
        estado.mensajes[clave] = estado.mensajes[clave] || [];
        estado.mensajes[clave].push({ autor: "Tú", texto });
        guardarEstado(estado);
        campo.value = "";
        pintarMensajes();
        mensajes.lastElementChild.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });

    /* ---- Pintar ---- */
    function pintar() {
        history.replaceState(null, "", `?libro=${libroActual}&cap=${capActual}`);
        pintarLibros();
        pintarCabecera();
        pintarCapitulos();
        pintarMensajes();
    }

    function pintarLibros() {
        listaLibros.innerHTML = disponibles.map((id) => {
            const libro = LIBROS[id];
            const terminado = estadoLectura(id, estado) === "terminado";
            return `
            <li>
                <button type="button" class="libro-boton" data-libro="${id}" aria-current="${id === libroActual}">
                    <span class="lomo lomo--mini lomo--sin-texto lomo--${libro.color}" style="--alto: 52px; --ancho: 16px" aria-hidden="true"></span>
                    <span>
                        <span class="libro-boton__titulo">${escaparHTML(libro.titulo)}</span>
                        <span class="libro-boton__meta">${terminado ? "Terminado" : `Cap. ${estado.progreso[id]} de ${libro.capitulos}`}</span>
                    </span>
                </button>
            </li>`;
        }).join("");
    }

    function pintarCabecera() {
        const libro = LIBROS[libroActual];
        const leidos = estado.progreso[libroActual];
        titulo.textContent = libro.titulo;
        meta.textContent = leidos >= libro.capitulos
            ? `${libro.autor} · Lo has terminado: todos los hilos abiertos`
            : `${libro.autor} · Vas por el capítulo ${leidos} de ${libro.capitulos}`;

        const siguiente = leidos + 1;
        avisoCerrado.hidden = leidos >= libro.capitulos;
        textoCerrado.innerHTML = `El hilo del capítulo ${siguiente} se abrirá cuando <a href="lecturas.html">marques que lo has leído</a>.`;
        campo.placeholder = `Escribe en el hilo del capítulo ${capActual}…`;
    }

    function pintarCapitulos() {
        const libro = LIBROS[libroActual];
        const leidos = estado.progreso[libroActual];
        let html = "";
        for (let cap = 1; cap <= libro.capitulos; cap++) {
            const cerrado = cap > leidos;
            const total = contarMensajes(cap);
            html += `<button type="button" class="capitulo${cerrado ? " capitulo--cerrado" : ""}" role="tab" data-cap="${cap}"
                        aria-selected="${cap === capActual}" ${cerrado ? 'aria-disabled="true"' : ""}
                        aria-label="Capítulo ${cap}${cerrado ? ", cerrado" : `, ${total} mensajes`}">
                        ${cerrado ? '<img src="img/iconos/candado.svg" alt="" width="18" height="18">' : ""}Cap. ${cap}
                    </button>`;
        }
        listaCapitulos.innerHTML = html;

        // Centra el capítulo seleccionado sin mover la página
        const activo = listaCapitulos.querySelector('[aria-selected="true"]');
        if (activo) listaCapitulos.scrollLeft = activo.offsetLeft - listaCapitulos.clientWidth / 2 + activo.offsetWidth / 2;
    }

    function mensajesDe(cap) {
        const ejemplo = (MENSAJES[libroActual] && MENSAJES[libroActual][cap]) || [];
        const propios = estado.mensajes[`${libroActual}-${cap}`] || [];
        return ejemplo.concat(propios);
    }

    function contarMensajes(cap) {
        return mensajesDe(cap).length;
    }

    function pintarMensajes() {
        const lista = mensajesDe(capActual);
        if (!lista.length) {
            mensajes.innerHTML = `<p class="hilo__vacio">Todavía no hay mensajes en el capítulo ${capActual}. ¡Empieza tú la conversación!</p>`;
            return;
        }
        mensajes.replaceChildren(...lista.map((m) => crearMensaje(m, capActual)));
    }

    pintar();
});
