/* =========================================================
   Entrelíneas · Datos de ejemplo compartidos por todas las páginas
   (libros, clubes, mensajes) y funciones para guardar el estado
   del usuario en localStorage (progreso de lectura y clubes).
   ========================================================= */
"use strict";

/* ---------- Libros ---------- */
const LIBROS = {
    orgullo:      { titulo: "Orgullo y prejuicio", autor: "Jane Austen",            capitulos: 61,  color: "turquesa-medio" },
    frankenstein: { titulo: "Frankenstein",        autor: "Mary Shelley",           capitulos: 24,  color: "tinta" },
    regenta:      { titulo: "La Regenta",          autor: "Leopoldo Alas «Clarín»", capitulos: 30,  color: "rosa" },
    dracula:      { titulo: "Drácula",             autor: "Bram Stoker",            capitulos: 27,  color: "turquesa-suave" },
    mujercitas:   { titulo: "Mujercitas",          autor: "Louisa May Alcott",      capitulos: 47,  color: "rosa-suave" },
    niebla:       { titulo: "Niebla",              autor: "Miguel de Unamuno",      capitulos: 33,  color: "turquesa-oscuro" },
    jane:         { titulo: "Jane Eyre",           autor: "Charlotte Brontë",       capitulos: 38,  color: "tinta" },
    cumbres:      { titulo: "Cumbres borrascosas", autor: "Emily Brontë",           capitulos: 34,  color: "turquesa-medio" },
    marianela:    { titulo: "Marianela",           autor: "Benito Pérez Galdós",    capitulos: 22,  color: "rosa" },
    moby:         { titulo: "Moby Dick",           autor: "Herman Melville",        capitulos: 135, color: "turquesa-suave" }
};

/* ---------- Clubes ----------
   diaSemana: 0 = domingo … 6 = sábado (como Date.getDay()) */
const CLUBES = [
    { id: "lectoras-martes",  nombre: "Lectoras del martes",  libro: "orgullo",      genero: "Clásicos",        modalidad: "presencial", ciudad: "Madrid",    lugar: "Biblioteca municipal · Sala 2", diaSemana: 2, hora: "18:30", miembros: 12, plazas: 15, descripcion: "Un capítulo largo de charla cada martes, con té y sin prisas." },
    { id: "noches-terror",    nombre: "Noches de terror",     libro: "frankenstein", genero: "Terror",          modalidad: "en línea",   ciudad: "En línea",  lugar: "Videollamada",                  diaSemana: 4, hora: "20:00", miembros: 9,  plazas: 20, descripcion: "Clásicos del miedo para leer con la luz encendida." },
    { id: "clasicos-sin-prisa", nombre: "Clásicos sin prisa", libro: "regenta",      genero: "Novela española", modalidad: "presencial", ciudad: "Oviedo",    lugar: "Café Lumière",                  diaSemana: 6, hora: "11:00", miembros: 7,  plazas: 10, descripcion: "Novelas gordas, a trozos pequeños y con café." },
    { id: "colmillos-cafe",   nombre: "Colmillos y café",     libro: "dracula",      genero: "Terror",          modalidad: "en línea",   ciudad: "En línea",  lugar: "Videollamada",                  diaSemana: 5, hora: "21:00", miembros: 11, plazas: 20, descripcion: "Leemos Drácula siguiendo las fechas de los diarios." },
    { id: "club-march",       nombre: "Club de las March",    libro: "mujercitas",   genero: "Clásicos",        modalidad: "presencial", ciudad: "Valencia",  lugar: "Biblioteca de Ruzafa",          diaSemana: 0, hora: "17:00", miembros: 8,  plazas: 12, descripcion: "Para quien siempre quiso ser Jo (o Beth, sin juzgar)." },
    { id: "letras-98",        nombre: "Letras del 98",        libro: "niebla",       genero: "Novela española", modalidad: "presencial", ciudad: "Salamanca", lugar: "Casa de Cultura · Sala 1",      diaSemana: 3, hora: "19:00", miembros: 6,  plazas: 10, descripcion: "Unamuno, Baroja y compañía en la ciudad de Unamuno." },
    { id: "hermanas-bronte",  nombre: "Hermanas Brontë",      libro: "jane",         genero: "Clásicos",        modalidad: "en línea",   ciudad: "En línea",  lugar: "Videollamada",                  diaSemana: 1, hora: "19:30", miembros: 14, plazas: 20, descripcion: "Un club para leer a las tres hermanas, una por una." },
    { id: "viento-paramos",   nombre: "Viento en los páramos", libro: "cumbres",     genero: "Clásicos",        modalidad: "presencial", ciudad: "Sevilla",   lugar: "Librería La Costurera",         diaSemana: 4, hora: "19:00", miembros: 10, plazas: 12, descripcion: "Pasiones a lo grande, comentadas con calma." },
    { id: "galdosianos",      nombre: "Galdosianos",          libro: "marianela",    genero: "Novela española", modalidad: "presencial", ciudad: "Madrid",    lugar: "Biblioteca municipal · Sala 2", diaSemana: 4, hora: "18:00", miembros: 5,  plazas: 10, descripcion: "Todo Galdós, novela a novela. Empezamos por la corta." },
    { id: "pequod",           nombre: "A bordo del Pequod",   libro: "moby",         genero: "Aventuras",       modalidad: "en línea",   ciudad: "En línea",  lugar: "Videollamada",                  diaSemana: 6, hora: "12:00", miembros: 8,  plazas: 15, descripcion: "135 capítulos, una ballena y mucha paciencia." }
];

const DIAS_SEMANA = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

/* ---------- Mensajes de ejemplo de los debates ----------
   MENSAJES[libro][capitulo] = [{ autor, texto }] */
const MENSAJES = {
    orgullo: {
        10: [
            { autor: "Aurora", texto: "Lady Catherine es un personaje maravilloso de odiar." },
            { autor: "Javier", texto: "Y el señor Collins, de traca." }
        ],
        11: [
            { autor: "Marta", texto: "Ojo a la primera declaración de Darcy…" },
            { autor: "Aurora", texto: "La respuesta de Elizabeth es de aplaudir." }
        ],
        12: [
            { autor: "Marta", texto: "La carta de Darcy lo cambia todo. ¿Alguien más ha vuelto a leer la primera parte?" },
            { autor: "Javier", texto: "Yo sí. Elizabeth se precipita, pero él tampoco se explica nada bien." },
            { autor: "Aurora", texto: "Propongo que lo hablemos el martes, que da para rato." }
        ],
        13: [
            { autor: "Marta", texto: "«Hasta este momento no me conocía a mí misma». Qué capítulo." }
        ]
    },
    frankenstein: {
        1: [{ autor: "Íñigo", texto: "Me encanta que empiece con cartas desde el Ártico." }],
        4: [
            { autor: "Lucía", texto: "Víctor huye de su criatura nada más crearla. Empezamos bien." },
            { autor: "Íñigo", texto: "Para mí es el capítulo clave: el problema no es el monstruo." }
        ],
        5: [{ autor: "Sara", texto: "La descripción de la noche de la creación da escalofríos." }]
    },
    niebla: {
        31: [
            { autor: "Pablo", texto: "¡Augusto discutiendo con el propio Unamuno! No me lo esperaba." },
            { autor: "Marta", texto: "Es de los capítulos más modernos que he leído de la época." }
        ]
    },
    marianela: {
        22: [{ autor: "Aurora", texto: "Lloré. No tengo nada más que añadir." }]
    }
};

/* Color de avatar de cada persona (siempre el mismo para el mismo nombre) */
const AVATARES = { Marta: "avatar--rosa", Javier: "avatar--turquesa", Aurora: "avatar--rosa-suave", "Tú": "avatar--turquesa" };
const COLORES_AVATAR = ["avatar--rosa", "avatar--turquesa", "avatar--rosa-suave"];
function colorAvatar(nombre) {
    if (AVATARES[nombre]) return AVATARES[nombre];
    const suma = [...nombre].reduce((total, letra) => total + letra.charCodeAt(0), 0);
    return COLORES_AVATAR[suma % COLORES_AVATAR.length];
}

/* =========================================================
   Estado del usuario (localStorage)
   ========================================================= */
const CLAVE_ESTADO = "entrelineas-estado";

const ESTADO_INICIAL = {
    // capítulo por el que va el usuario en cada libro (0 = sin empezar)
    progreso: { orgullo: 12, frankenstein: 5, niebla: 33, marianela: 22, jane: 0, dracula: 0 },
    misClubes: ["lectoras-martes", "noches-terror"],
    mensajes: {} // mensajes escritos por el usuario: { "orgullo-12": [{ autor, texto }] }
};

function leerEstado() {
    try {
        const guardado = JSON.parse(localStorage.getItem(CLAVE_ESTADO));
        if (guardado) return { ...structuredClone(ESTADO_INICIAL), ...guardado };
    } catch (e) {
        /* localStorage no disponible: se usa el estado inicial */
    }
    return structuredClone(ESTADO_INICIAL);
}

function guardarEstado(estado) {
    try {
        localStorage.setItem(CLAVE_ESTADO, JSON.stringify(estado));
    } catch (e) {
        /* sin persistencia, no pasa nada */
    }
}

/* Devuelve "leyendo", "pendiente" o "terminado" según el progreso */
function estadoLectura(idLibro, estado) {
    const cap = estado.progreso[idLibro] ?? 0;
    if (cap >= LIBROS[idLibro].capitulos) return "terminado";
    return cap > 0 ? "leyendo" : "pendiente";
}

function buscarClubPorLibro(idLibro) {
    return CLUBES.find((c) => c.libro === idLibro);
}

/* Fecha de la próxima quedada de un club a partir de hoy */
function proximaQuedada(club, desde = new Date()) {
    const fecha = new Date(desde.getFullYear(), desde.getMonth(), desde.getDate());
    const dias = (club.diaSemana - fecha.getDay() + 7) % 7;
    fecha.setDate(fecha.getDate() + dias);
    return fecha;
}

function formatearFecha(fecha) {
    return `${DIAS_SEMANA[fecha.getDay()]} ${fecha.getDate()} de ${MESES[fecha.getMonth()]}`;
}

/* Escapa texto antes de meterlo en HTML */
function escaparHTML(texto) {
    const div = document.createElement("div");
    div.textContent = texto;
    return div.innerHTML;
}
