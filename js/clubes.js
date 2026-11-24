/* =========================================================
   Entrelíneas · Página de clubes
   Filtra los clubes y permite unirse o salir (se guarda en localStorage).
   ========================================================= */
"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const estado = leerEstado();
    const filtros = { texto: "", ciudad: "", modalidad: "", genero: "" };

    const rejilla = document.getElementById("rejillaClubes");
    const info = document.getElementById("resultadosInfo");
    const sinResultados = document.getElementById("sinResultados");
    const buscador = document.getElementById("buscador");
    const selectorCiudad = document.getElementById("filtroCiudad");
    const chipsModalidad = document.getElementById("filtroModalidad");
    const chipsGenero = document.getElementById("filtroGenero");

    /* ---- Opciones de los filtros sacadas de los datos ---- */
    const ciudades = [...new Set(CLUBES.filter((c) => c.modalidad === "presencial").map((c) => c.ciudad))].sort();
    ciudades.forEach((ciudad) => selectorCiudad.add(new Option(ciudad, ciudad)));

    const generos = [...new Set(CLUBES.map((c) => c.genero))].sort();
    chipsGenero.innerHTML = ['<button type="button" class="chip" data-valor="" aria-pressed="true">Todos</button>']
        .concat(generos.map((g) => `<button type="button" class="chip" data-valor="${g}" aria-pressed="false">${g}</button>`))
        .join("");

    /* ---- Eventos de los filtros ---- */
    buscador.addEventListener("input", () => {
        filtros.texto = normalizar(buscador.value);
        pintar();
    });

    selectorCiudad.addEventListener("change", () => {
        filtros.ciudad = selectorCiudad.value;
        // Si eliges una ciudad, lo lógico es ver los presenciales
        if (filtros.ciudad) marcarChip(chipsModalidad, "presencial");
        pintar();
    });

    chipsModalidad.addEventListener("click", (e) => {
        const chip = e.target.closest(".chip");
        if (!chip) return;
        marcarChip(chipsModalidad, chip.dataset.valor);
        if (filtros.modalidad === "en línea") {
            filtros.ciudad = "";
            selectorCiudad.value = "";
        }
        pintar();
    });

    chipsGenero.addEventListener("click", (e) => {
        const chip = e.target.closest(".chip");
        if (!chip) return;
        marcarChip(chipsGenero, chip.dataset.valor);
        pintar();
    });

    document.getElementById("filtros").addEventListener("submit", (e) => e.preventDefault());

    document.getElementById("limpiarFiltros").addEventListener("click", () => {
        buscador.value = "";
        selectorCiudad.value = "";
        Object.assign(filtros, { texto: "", ciudad: "" });
        marcarChip(chipsModalidad, "");
        marcarChip(chipsGenero, "");
        pintar();
    });

    function marcarChip(grupo, valor) {
        grupo.querySelectorAll(".chip").forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.valor === valor)));
        if (grupo === chipsModalidad) filtros.modalidad = valor;
        else filtros.genero = valor;
    }

    /* ---- Unirse / salir de un club (delegación de eventos) ---- */
    rejilla.addEventListener("click", (e) => {
        const boton = e.target.closest("[data-unirse]");
        if (!boton) return;

        const id = boton.dataset.unirse;
        const club = CLUBES.find((c) => c.id === id);
        const esMiembro = estado.misClubes.includes(id);

        if (esMiembro) {
            estado.misClubes = estado.misClubes.filter((c) => c !== id);
            mostrarAviso(`Has salido de ${club.nombre}.`);
        } else {
            estado.misClubes.push(id);
            // Al unirte, su libro pasa a tus lecturas pendientes
            if (!(club.libro in estado.progreso)) estado.progreso[club.libro] = 0;
            mostrarAviso(`Ya formas parte de ${club.nombre}. Sus quedadas están en tu calendario.`);
        }
        guardarEstado(estado);
        pintar();
    });

    /* ---- Pintar la rejilla ---- */
    function pintar() {
        const visibles = CLUBES.filter(cumpleFiltros);

        rejilla.innerHTML = visibles.map(tarjetaClub).join("");
        sinResultados.hidden = visibles.length > 0;
        info.textContent = visibles.length === 1 ? "1 club" : `${visibles.length} clubes`;
    }

    function cumpleFiltros(club) {
        const libro = LIBROS[club.libro];
        const texto = normalizar(`${club.nombre} ${libro.titulo} ${libro.autor} ${club.ciudad}`);
        return (!filtros.texto || texto.includes(filtros.texto))
            && (!filtros.ciudad || club.ciudad === filtros.ciudad)
            && (!filtros.modalidad || club.modalidad === filtros.modalidad)
            && (!filtros.genero || club.genero === filtros.genero);
    }

    function tarjetaClub(club) {
        const libro = LIBROS[club.libro];
        const esMiembro = estado.misClubes.includes(club.id);
        const miembros = club.miembros + (esMiembro ? 1 : 0);
        const porcentaje = Math.min(100, Math.round((miembros / club.plazas) * 100));
        const lleno = miembros >= club.plazas && !esMiembro;
        const proxima = proximaQuedada(club);

        return `
        <article class="club-tarjeta" id="${club.id}">
            <div class="club-tarjeta__portada" aria-hidden="true">
                <span class="lomo lomo--mini lomo--sin-texto lomo--rosa" style="--alto: 70px; --ancho: 16px"></span>
                <span class="lomo lomo--mini lomo--${libro.color}" style="--alto: 104px; --ancho: 34px">${escaparHTML(libro.titulo)}</span>
                <span class="lomo lomo--mini lomo--sin-texto lomo--turquesa-oscuro" style="--alto: 84px; --ancho: 20px"></span>
                <div class="club-tarjeta__etiquetas">
                    ${esMiembro ? '<span class="pastilla pastilla--rosa">Tu club</span>' : ""}
                    <span class="pastilla">${club.genero}</span>
                </div>
            </div>
            <div class="club-tarjeta__cuerpo">
                <h2 class="club-tarjeta__nombre">${escaparHTML(club.nombre)}</h2>
                <p class="club-tarjeta__libro">Leyendo <strong>${escaparHTML(libro.titulo)}</strong> · ${escaparHTML(libro.autor)}</p>
                <p>${escaparHTML(club.descripcion)}</p>
                <dl class="club-tarjeta__datos">
                    <div><dt>Dónde</dt><dd>${club.modalidad === "en línea" ? "En línea" : `${escaparHTML(club.lugar)}, ${club.ciudad}`}</dd></div>
                    <div><dt>Cuándo</dt><dd>${DIAS_SEMANA[club.diaSemana]}s, ${club.hora}</dd></div>
                    <div><dt>Próxima</dt><dd>${formatearFecha(proxima)}</dd></div>
                </dl>
                <div class="club-tarjeta__plazas">
                    <span>${miembros} de ${club.plazas} plazas ocupadas</span>
                    <div class="barra" role="presentation"><div class="barra__relleno turquesa-medio" style="width: ${porcentaje}%"></div></div>
                </div>
                <div class="club-tarjeta__pie">
                    ${esMiembro
                        ? `<button type="button" class="boton boton--mediano boton--secundario w-100" data-unirse="${club.id}" aria-label="Salir de ${escaparHTML(club.nombre)}">Eres miembro ✓ · Salir</button>`
                        : `<button type="button" class="boton boton--mediano w-100" data-unirse="${club.id}" ${lleno ? "disabled" : ""}>${lleno ? "Club completo" : "Unirme al club"}</button>`}
                </div>
            </div>
        </article>`;
    }

    pintar();
    destacarDesdeEnlace();

    /* Si se llega con clubes.html#id-del-club, se resalta esa tarjeta */
    function destacarDesdeEnlace() {
        const id = decodeURIComponent(location.hash.slice(1));
        const tarjeta = id && document.getElementById(id);
        if (!tarjeta) return;
        tarjeta.classList.add("club-tarjeta--destacada");
        tarjeta.scrollIntoView({ block: "center" });
        setTimeout(() => tarjeta.classList.remove("club-tarjeta--destacada"), 3000);
    }
});

/* Quita tildes y pasa a minúsculas para buscar sin importar cómo se escriba */
function normalizar(texto) {
    return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}
