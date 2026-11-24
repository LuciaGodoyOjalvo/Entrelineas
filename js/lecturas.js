/* =========================================================
   Entrelíneas · Mis lecturas
   Marca capítulos leídos; el progreso se guarda en localStorage
   y es el que decide qué hilos de debate están abiertos.
   ========================================================= */
"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const estado = leerEstado();
    let pestanaActiva = ["leyendo", "pendiente", "terminado"].includes(location.hash.slice(1))
        ? location.hash.slice(1)
        : "leyendo";

    const lista = document.getElementById("listaLecturas");
    const vacio = document.getElementById("lecturasVacias");
    const textoVacio = document.getElementById("textoVacio");
    const pestanas = document.querySelectorAll(".pestana");
    const selectorLibro = document.getElementById("selectorLibro");

    const TEXTOS_VACIOS = {
        leyendo: "No estás leyendo nada ahora mismo. Empieza uno de tus pendientes o únete a un club.",
        pendiente: "No tienes libros pendientes. Añade uno abajo o busca un club nuevo.",
        terminado: "Aún no has terminado ningún libro. ¡Todo llegará!"
    };

    /* ---- Pestañas ---- */
    pestanas.forEach((pestana) => {
        pestana.addEventListener("click", () => {
            pestanaActiva = pestana.dataset.estado;
            history.replaceState(null, "", `#${pestanaActiva}`);
            pintar();
        });
    });

    // Flechas izquierda/derecha para moverse entre pestañas (patrón ARIA tabs)
    document.querySelector(".pestanas").addEventListener("keydown", (e) => {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        const orden = [...pestanas];
        const actual = orden.findIndex((p) => p.dataset.estado === pestanaActiva);
        const siguiente = orden[(actual + (e.key === "ArrowRight" ? 1 : orden.length - 1)) % orden.length];
        siguiente.click();
        siguiente.focus();
    });

    /* ---- Botones de cada lectura (delegación) ---- */
    lista.addEventListener("click", (e) => {
        const boton = e.target.closest("[data-accion]");
        if (!boton) return;

        const id = boton.dataset.libro;
        const libro = LIBROS[id];
        const capitulo = estado.progreso[id];

        switch (boton.dataset.accion) {
            case "avanzar":
                estado.progreso[id] = Math.min(libro.capitulos, capitulo + 1);
                if (estado.progreso[id] === libro.capitulos) {
                    mostrarAviso(`¡Has terminado ${libro.titulo}! Lo tienes en «Terminados».`);
                } else {
                    mostrarAviso(`Capítulo ${estado.progreso[id]} leído. Su debate ya está abierto.`);
                }
                break;
            case "retroceder":
                estado.progreso[id] = Math.max(0, capitulo - 1);
                break;
            case "quitar":
                delete estado.progreso[id];
                mostrarAviso(`${libro.titulo} ya no está en tus lecturas.`);
                break;
            case "releer":
                estado.progreso[id] = 0;
                mostrarAviso(`${libro.titulo} vuelve a tus pendientes.`);
                break;
        }
        guardarEstado(estado);
        pintar();

        // Mantener el foco en el mismo botón si sigue existiendo
        const mismo = lista.querySelector(`[data-accion="${boton.dataset.accion}"][data-libro="${id}"]`);
        if (mismo) mismo.focus();
    });

    /* ---- Añadir un libro a pendientes ---- */
    document.getElementById("formAnadir").addEventListener("submit", (e) => {
        e.preventDefault();
        const id = selectorLibro.value;
        if (!id) return;
        estado.progreso[id] = 0;
        guardarEstado(estado);
        pestanaActiva = "pendiente";
        mostrarAviso(`${LIBROS[id].titulo} añadido a pendientes.`);
        pintar();
    });

    /* ---- Pintar ---- */
    function pintar() {
        const ids = Object.keys(estado.progreso).filter((id) => LIBROS[id]);
        const porEstado = { leyendo: [], pendiente: [], terminado: [] };
        ids.forEach((id) => porEstado[estadoLectura(id, estado)].push(id));

        // Resumen
        document.getElementById("totalLeyendo").textContent = porEstado.leyendo.length;
        document.getElementById("totalTerminados").textContent = porEstado.terminado.length;
        document.getElementById("totalCapitulos").textContent = ids.reduce((suma, id) => suma + estado.progreso[id], 0);

        // Pestañas
        pestanas.forEach((p) => {
            const activa = p.dataset.estado === pestanaActiva;
            p.setAttribute("aria-selected", String(activa));
            p.tabIndex = activa ? 0 : -1;
            p.querySelector(".pestana__contador").textContent = porEstado[p.dataset.estado].length;
        });
        lista.setAttribute("aria-labelledby", `pestana-${pestanaActiva}`);

        // Lista
        const visibles = porEstado[pestanaActiva];
        lista.innerHTML = visibles.map(tarjetaLectura).join("");
        vacio.hidden = visibles.length > 0;
        textoVacio.textContent = TEXTOS_VACIOS[pestanaActiva];

        // Libros que se pueden añadir
        const disponibles = Object.keys(LIBROS).filter((id) => !(id in estado.progreso));
        selectorLibro.innerHTML = disponibles.length
            ? disponibles.map((id) => `<option value="${id}">${LIBROS[id].titulo} · ${LIBROS[id].autor}</option>`).join("")
            : '<option value="">Ya tienes todos los libros</option>';
        selectorLibro.disabled = !disponibles.length;
    }

    function tarjetaLectura(id) {
        const libro = LIBROS[id];
        const cap = estado.progreso[id];
        const estadoLibro = estadoLectura(id, estado);
        const club = buscarClubPorLibro(id);
        const porcentaje = Math.round((cap / libro.capitulos) * 100);
        const titulo = escaparHTML(libro.titulo);

        let acciones;
        if (estadoLibro === "terminado") {
            acciones = `
                <a href="debates.html?libro=${id}" class="boton boton--mediano">Ver debates</a>
                <button type="button" class="boton-texto" data-accion="releer" data-libro="${id}">Volver a leerlo</button>`;
        } else if (estadoLibro === "pendiente") {
            acciones = `
                <button type="button" class="boton boton--mediano" data-accion="avanzar" data-libro="${id}">Empezar: he leído el cap. 1</button>
                <button type="button" class="boton-texto" data-accion="quitar" data-libro="${id}">Quitar de mis lecturas</button>`;
        } else {
            acciones = `
                <div class="controles-capitulo">
                    <button type="button" class="boton-icono" data-accion="retroceder" data-libro="${id}" aria-label="Desmarcar el capítulo ${cap} de ${titulo}">−</button>
                    <button type="button" class="boton boton--mediano" data-accion="avanzar" data-libro="${id}">He leído el cap. ${cap + 1}</button>
                </div>
                <a href="debates.html?libro=${id}&amp;cap=${cap}" class="enlace-debate">Ir al debate del cap. ${cap} →</a>`;
        }

        return `
        <article class="lectura">
            <span class="lomo lomo--mini lomo--${libro.color}" style="--alto: 110px; --ancho: 34px" aria-hidden="true">${titulo}</span>
            <div>
                <h2 class="lectura__titulo">${titulo}</h2>
                <p class="lectura__meta">${escaparHTML(libro.autor)}${club ? ` · <a href="clubes.html#${club.id}" class="enlace-turquesa">${escaparHTML(club.nombre)}</a>` : ""}</p>
                <div class="lectura__progreso">
                    <div class="barra" role="progressbar" aria-valuemin="0" aria-valuemax="${libro.capitulos}" aria-valuenow="${cap}" aria-label="Progreso de ${titulo}">
                        <div class="barra__relleno ${estadoLibro === "terminado" ? "turquesa-medio" : "rosa-acento"}" style="width: ${porcentaje}%"></div>
                    </div>
                    <span class="lectura__cifra">${cap} / ${libro.capitulos}</span>
                </div>
            </div>
            <div class="lectura__acciones">${acciones}</div>
        </article>`;
    }

    pintar();
});
