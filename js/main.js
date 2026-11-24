/* =========================================================
   Entrelíneas · Interacciones de la página principal
   Necesita datos.js y comun.js cargados antes.
   ========================================================= */
"use strict";

document.addEventListener("DOMContentLoaded", () => {
    iniciarEtiquetasAnimo();
    iniciarEstanteria();
    iniciarCapitulos();
    iniciarRespuesta();
    iniciarBarrasVotacion();
});

/* ---------- Etiquetas «¿Qué te apetece leer ahora?» (selección única) ---------- */
function iniciarEtiquetasAnimo() {
    const etiquetas = document.querySelectorAll(".etiquetas-animo .etiqueta");
    etiquetas.forEach((etiqueta) => {
        etiqueta.addEventListener("click", () => {
            etiquetas.forEach((e) => e.setAttribute("aria-pressed", "false"));
            etiqueta.setAttribute("aria-pressed", "true");
        });
    });
}

/* ---------- Estantería: al pulsar un lomo se muestra su club ---------- */
function iniciarEstanteria() {
    const lomos = document.querySelectorAll(".lomo[data-libro]");
    const tarjeta = document.getElementById("libroElegido");
    if (!tarjeta) return;

    const campos = {
        titulo: document.getElementById("elegidoTitulo"),
        autor: document.getElementById("elegidoAutor"),
        club: document.getElementById("elegidoClub"),
        lectores: document.getElementById("elegidoLectores"),
        quedada: document.getElementById("elegidoQuedada"),
        boton: document.getElementById("elegidoBoton")
    };

    lomos.forEach((lomo) => {
        lomo.addEventListener("click", () => {
            const libro = LIBROS[lomo.dataset.libro];
            const club = buscarClubPorLibro(lomo.dataset.libro);
            if (!libro || !club) return;

            lomos.forEach((l) => l.setAttribute("aria-pressed", "false"));
            lomo.setAttribute("aria-pressed", "true");

            campos.titulo.textContent = libro.titulo;
            campos.autor.textContent = libro.autor;
            campos.club.textContent = club.nombre;
            campos.lectores.textContent = `${club.miembros} personas`;
            campos.quedada.textContent = `${DIAS_SEMANA[club.diaSemana]}, ${club.hora} · ${club.modalidad === "en línea" ? "en línea" : club.ciudad}`;
            campos.boton.href = `clubes.html#${club.id}`;

            // En móvil la tarjeta está oculta hasta que se toca un lomo
            tarjeta.classList.add("visible");
        });
    });
}

/* ---------- Debates (ejemplo): cambiar de capítulo ---------- */
function iniciarCapitulos() {
    const botones = document.querySelectorAll(".hilo__capitulos .capitulo");
    const contenedor = document.getElementById("hiloMensajes");
    const campo = document.getElementById("campoRespuesta");
    if (!contenedor) return;

    // Guardamos el hilo original (capítulo 12) tal y como viene en el HTML
    const hiloOriginal = contenedor.innerHTML;

    botones.forEach((boton) => {
        boton.addEventListener("click", () => {
            if (boton.getAttribute("aria-disabled") === "true") {
                boton.animate(
                    [{ transform: "translateX(0)" }, { transform: "translateX(-4px)" }, { transform: "translateX(4px)" }, { transform: "translateX(0)" }],
                    { duration: 250 }
                );
                return;
            }

            botones.forEach((b) => b.setAttribute("aria-selected", "false"));
            boton.setAttribute("aria-selected", "true");

            const cap = boton.dataset.cap;
            if (cap === "12") {
                contenedor.innerHTML = hiloOriginal;
            } else {
                contenedor.replaceChildren(...(MENSAJES.orgullo[cap] || []).map((m) => crearMensaje(m, cap)));
            }
            if (campo) campo.placeholder = `Escribe en el hilo del capítulo ${cap}…`;
        });
    });
}

/* ---------- Debates (ejemplo): enviar un mensaje (solo en la página) ---------- */
function iniciarRespuesta() {
    const form = document.getElementById("formResponder");
    const campo = document.getElementById("campoRespuesta");
    const contenedor = document.getElementById("hiloMensajes");
    if (!form || !campo || !contenedor) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const texto = campo.value.trim();
        if (!texto) {
            campo.focus();
            return;
        }
        const activo = document.querySelector('.capitulo[aria-selected="true"]');
        const cap = activo ? activo.dataset.cap : "12";
        contenedor.append(crearMensaje({ autor: "Tú", texto }, cap));
        campo.value = "";
    });
}

/* ---------- Panel de votación: las barras crecen al verse ---------- */
function iniciarBarrasVotacion() {
    const barras = document.querySelectorAll(".barra__relleno");
    if (!barras.length) return;

    // Guardamos el ancho final y empezamos desde 0
    barras.forEach((barra) => {
        barra.dataset.ancho = barra.style.width;
        barra.style.width = "0";
    });

    const mostrar = () => barras.forEach((b) => { b.style.width = b.dataset.ancho; });

    if (!("IntersectionObserver" in window)) {
        mostrar();
        return;
    }

    const observador = new IntersectionObserver((entradas) => {
        if (entradas.some((e) => e.isIntersecting)) {
            mostrar();
            observador.disconnect();
        }
    }, { threshold: 0.3 });

    observador.observe(barras[0].closest(".panel-votacion"));
}
