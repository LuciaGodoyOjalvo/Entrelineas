/* =========================================================
   Entrelíneas · Código común a todas las páginas
   ========================================================= */
"use strict";

document.addEventListener("DOMContentLoaded", iniciarMenuMovil);

/* ---------- Menú hamburguesa (móvil) ---------- */
function iniciarMenuMovil() {
    const boton = document.getElementById("botonMenu");
    const menu = document.getElementById("menuPrincipal");
    if (!boton || !menu) return;

    const cerrar = () => {
        menu.classList.remove("abierto");
        boton.setAttribute("aria-expanded", "false");
        boton.setAttribute("aria-label", "Abrir menú");
    };

    boton.addEventListener("click", () => {
        const abierto = menu.classList.toggle("abierto");
        boton.setAttribute("aria-expanded", String(abierto));
        boton.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
    });

    menu.querySelectorAll("a").forEach((enlace) => enlace.addEventListener("click", cerrar));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") cerrar(); });
}

/* ---------- Aviso flotante de confirmación ---------- */
let temporizadorAviso;
function mostrarAviso(texto) {
    const aviso = document.getElementById("avisoVivo");
    if (!aviso) return;
    aviso.textContent = texto;
    aviso.classList.add("visible");
    clearTimeout(temporizadorAviso);
    temporizadorAviso = setTimeout(() => aviso.classList.remove("visible"), 2800);
}

/* ---------- Crea el HTML de un mensaje de debate ---------- */
function crearMensaje({ autor, texto }, cap) {
    const mensaje = document.createElement("div");
    mensaje.className = "mensaje";

    const avatar = document.createElement("span");
    avatar.className = `avatar ${colorAvatar(autor)}`;
    avatar.textContent = autor.charAt(0).toUpperCase();

    const cuerpo = document.createElement("div");
    const cabecera = document.createElement("p");
    cabecera.className = "mensaje__autor";
    const nombre = document.createElement("strong");
    nombre.textContent = autor;
    cabecera.append(nombre, `  ·  capítulo ${cap}`);

    const parrafo = document.createElement("p");
    parrafo.className = "mensaje__texto";
    parrafo.textContent = texto;

    cuerpo.append(cabecera, parrafo);
    mensaje.append(avatar, cuerpo);
    return mensaje;
}
