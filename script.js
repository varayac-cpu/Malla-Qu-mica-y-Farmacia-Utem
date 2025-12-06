// Clave para guardar en el navegador
const STORAGE_KEY = "malla-qyf-estado-v1";

// Objeto donde se guarda el estado de cada ramo
// { MATO8001: { estado: "aprobado" }, ... }
let courseStatus = {};


// =========================
// 1. PRERREQUISITOS
// =========================

const prereqs = {
  MATO8003: ["MATO8001"],
  QUIB4020: ["QUIB4011"],
  ESTO8001: ["MATO8001"],
  QUIO8004: ["FISIO8001"],
  INFO8006: ["INFC0001"],
  QUIO8002: ["QUIB4020"],
  QUIO8003: ["BTAO0001"],
  QUIO8007: ["QUIB4020"],
  BTAO0002: ["BTAO0001"],
  QUIO8008: ["QUIO8003"],
  QUIO8005: ["QUIO8002"],
  QUIO8006: ["QUIO8002"],

  QUIO8009: ["QUIO8005"],
  QUIO8010: ["QUIO8005"],
  BTAO0003: ["BTAO0002"],
  QUIO8011: ["QUIO8007"],
  QUIO8012: ["QUIO8004"],
  QUIO8014: ["QUIO8010"],
  QUIO8015: ["ESTO8001"],
  QUIP8001: ["QUIO8009", "QUIO8010", "BTAO0003", "QUIO8011", "QUIO8012"],
  QUIO8016: ["BTAO0002"],
  QUIO8013: ["QUIO8009"],

  QUIO8021: ["QUIO8013"],
  QUIO8017: ["BTAO0003"],
  QUIO8018: ["QUIO8014"],
  QUIO8025: ["QUIO8021"],
  QUIO8024: ["QUIO8018"],
  QUIO8022: ["QUIO8016"],
  QUIE901X: ["QUIO8013", "QUIO8014", "QUIO8015", "QUIO8016", "QUIP8001"],
  QUIO8023: ["QUIO8021"],

  QUIE902X: ["QUIO8017", "QUIO8018", "QUIO8019", "QUIO8020", "QUIO8021"],
  QUIP8002: ["QUIO8025", "QUIO8022", "QUIE901X", "QUIO8023", "QUIO8024"],
  QUIO8026: ["QUIO8024"],
  QUIO8027: ["QUIO8024"],
  QUIT8001: ["QUIO8022", "QUIE901X", "QUIO8023", "QUIO8024", "QUIO8025"],
  QUIT8002: ["QUIO8026", "QUIO8027", "QUIE902X", "QUIT8001", "QUIP8002"],
  FITCXX06: ["QUIO8026", "QUIO8027", "QUIE902X", "QUIT8001", "QUIP8002"],

  HUMC4X02: ["HUMC4X01"],
  FITCX102: ["FITCX101"],
  FITCX103: ["FITCX102"],
  FITCX202: ["FITCX201"],
};


// =========================
// 2. CAMBIO DE ESTADO
// =========================

// Ciclo: pendiente → cursando → aprobado → pendiente
function cambiarEstado(codigo) {
  const actual = courseStatus[codigo]?.estado || "pendiente";

  let nuevoEstado;
  if (actual === "pendiente") nuevoEstado = "cursando";
  else if (actual === "cursando") nuevoEstado = "aprobado";
  else nuevoEstado = "pendiente";

  courseStatus[codigo] = { estado: nuevoEstado };

  guardarProgresoLocal();
  actualizarTodo();
  aplicarFiltros();
}


// =========================
// 3. DETALLE (abre/cierra caja)
//    + dispara cambio de estado
// =========================

function toggleDetalle(codigo) {
  // Cambia de estado cada vez que hago clic
  cambiarEstado(codigo);

  const el = document.getElementById(codigo);
  if (!el) return;

  const seccion = el.closest(".anio");
  if (seccion) {
    seccion.querySelectorAll(".detalle").forEach(d => {
      if (d !== el) d.style.display = "none";
    });
  }

  el.style.display = el.style.display === "block" ? "none" : "block";
}


// =========================
// 4. APLICAR COLORES
// =========================

function aplicarEstados() {
  const cards = document.querySelectorAll(".ramo");

  cards.forEach(card => {
    const codigo = obtenerCodigoDesdeCard(card);
    if (!codigo) return;

    const estado = courseStatus[codigo]?.estado || "pendiente";
    card.dataset.estado = estado;

    card.classList.remove(
      "estado-aprobado",
      "estado-cursando",
      "estado-pendiente"
    );
    card.classList.add(`estado-${estado}`);

    card.title = `Estado: ${estado}`;
  });
}


// =========================
// 5. BLOQUEOS POR PRERREQUISITOS
// =========================

function aplicarBloqueos() {
  const cards = document.querySelectorAll(".ramo");

  cards.forEach(card => {
    const codigo = obtenerCodigoDesdeCard(card);
    if (!codigo) return;

    const requisitos = prereqs[codigo] || [];
    card.classList.remove("bloqueado");

    if (requisitos.length === 0) return;

    const todosAprobados = requisitos.every(
      r => courseStatus[r]?.estado === "aprobado"
    );

    if (!todosAprobados) {
      card.classList.add("bloqueado");
    }
  });
}


// =========================
// 6. FILTRO DEL MENÚ
// =========================

function aplicarFiltros() {
  const select = document.getElementById("filtro-estado");
  if (!select) return;

  const filtro = select.value; // todos, aprobado, cursando, pendiente, bloqueado

  const cards = document.querySelectorAll(".ramo");
  cards.forEach(card => {
    const estado = card.dataset.estado || "pendiente";
    const esBloqueado = card.classList.contains("bloqueado");

    let visible = true;

    if (filtro === "bloqueado") {
      visible = esBloqueado;
    } else if (filtro !== "todos") {
      visible = estado === filtro;
    }

    card.style.display = visible ? "" : "none";
  });
}


// =========================
// 7. GUARDAR / CARGAR / EXPORTAR
// =========================

function guardarProgresoLocal() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(courseStatus));
  } catch (e) {
    console.warn("No se pudo guardar el progreso:", e);
  }
}

function cargarProgresoLocal() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      courseStatus = JSON.parse(data);
    }
  } catch (e) {
    console.warn("No se pudo cargar el progreso:", e);
    courseStatus = {};
  }
}

function borrarProgreso() {
  localStorage.removeItem(STORAGE_KEY);
  courseStatus = {};
  actualizarTodo();
  aplicarFiltros();
  alert("Progreso borrado en este navegador.");
}

function exportarProgreso() {
  const dataStr = JSON.stringify(courseStatus, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "malla_qyf_progreso.json";
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}


// =========================
// 8. UTILIDAD: sacar código de la card
// =========================

function obtenerCodigoDesdeCard(card) {
  const h4 = card.querySelector("h4");
  if (!h4) return null;
  // primera palabra del título: "MATO8001 Álgebra pre cálculo"
  return h4.innerText.trim().split(" ")[0];
}


// =========================
// 9. INICIALIZACIÓN
// =========================

function actualizarTodo() {
  aplicarEstados();
  aplicarBloqueos();
}

document.addEventListener("DOMContentLoaded", () => {
  // Cargar progreso guardado
  cargarProgresoLocal();

  // Marcar estado inicial y bloqueos
  actualizarTodo();
  aplicarFiltros();

  // Menú
  const filtro = document.getElementById("filtro-estado");
  if (filtro) filtro.addEventListener("change", aplicarFiltros);

  const btnGuardar = document.getElementById("btn-guardar");
  if (btnGuardar) btnGuardar.addEventListener("click", () => {
    guardarProgresoLocal();
    alert("Progreso guardado en este navegador 👍");
  });

  const btnBorrar = document.getElementById("btn-borrar");
  if (btnBorrar) btnBorrar.addEventListener("click", borrarProgreso);

  const btnExportar = document.getElementById("btn-exportar");
  if (btnExportar) btnExportar.addEventListener("click", exportarProgreso);
});
