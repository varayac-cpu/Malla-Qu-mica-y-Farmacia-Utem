// ==== 1. Estados de los ramos ====
// Solo marcas si está aprobado, cursando o pendiente.
// Ejemplo real: solo cambias "estado" cuando pases el ramo.
const courseStatus = {
  MATO8001: { estado: "aprobado" },
  QUIB4011: { estado: "aprobado" },
  INFC0001: { estado: "aprobado" },
  NIV9010:  { estado: "aprobado" },
  QUIO8001: { estado: "aprobado" },

  // Puedes agregar más:
  // QUIB4020: { estado: "cursando" },
  // MATO8003: { estado: "pendiente" },
};

// ==== 2. Prerrequisitos de cada ramo ====
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

// ==== 3. Abrir detalle ====
function toggleDetalle(id) {
  const el = document.getElementById(id);
  if (!el) return;

  const parentSection = el.closest(".anio");
  if (parentSection) {
    parentSection.querySelectorAll(".detalle").forEach(d => {
      if (d.id !== id) d.style.display = "none";
    });
  }

  el.style.display = el.style.display === "block" ? "none" : "block";
}

// ==== 4. Aplicar colores según estado ====
function aplicarEstados() {
  const cards = document.querySelectorAll(".ramo");

  cards.forEach(card => {
    const codigo = card.dataset.codigo;
    const info = courseStatus[codigo];
    let estado = "pendiente";

    if (info && info.estado) estado = info.estado;

    card.dataset.estado = estado;

    card.classList.remove("estado-aprobado", "estado-cursando", "estado-pendiente");
    card.classList.add(`estado-${estado}`);

    card.title = `Estado: ${estado}`;
  });
}

// ==== 5. Bloquear / desbloquear por prerrequisitos ====
function aplicarBloqueos() {
  const cards = document.querySelectorAll(".ramo");

  cards.forEach(card => {
    const codigo = card.dataset.codigo;
    const requisitos = prereqs[codigo] || [];
    card.classList.remove("bloqueado");

    if (requisitos.length === 0) return;

    let todosAprobados = true;

    for (const req of requisitos) {
      const data = courseStatus[req];
      if (!data || data.estado !== "aprobado") {
        todosAprobados = false;
        break;
      }
    }

    if (!todosAprobados) card.classList.add("bloqueado");
  });
}

// ==== 6. Filtros ====
function aplicarFiltros() {
  const filtroAnio = document.getElementById("filtro-anio");
  const filtroEstado = document.getElementById("filtro-estado");

  const anioSeleccionado = filtroAnio.value;
  const estadoSeleccionado = filtroEstado.value;

  const cards = document.querySelectorAll(".ramo");
  cards.forEach(card => {
    const a = card.dataset.anio;
    const e = card.dataset.estado;

    const okAnio = (anioSeleccionado === "todos" || a === anioSeleccionado);
    const okEstado = (estadoSeleccionado === "todos" || e === estadoSeleccionado);

    card.style.display = (okAnio && okEstado) ? "" : "none";
  });
}

// ==== 7. Inicializar ====
document.addEventListener("DOMContentLoaded", () => {
  aplicarEstados();
  aplicarBloqueos();
  aplicarFiltros();

  document.getElementById("filtro-anio").addEventListener("change", aplicarFiltros);
  document.getElementById("filtro-estado").addEventListener("change", aplicarFiltros);
});
