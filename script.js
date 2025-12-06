// =========================
// CONFIGURACIÓN DE PERFILES
// =========================

// En localStorage vamos a guardar un objeto así:
// {
//   perfiles: {
//     "Fernanda": { MATO8001: {estado:"aprobado"}, ... },
//     "Juan": {...}
//   },
//   ultimoPerfil: "Fernanda"
// }

const STORAGE_KEY = "malla-qyf-perfiles-v1";

let perfiles = {};        // todos los perfiles
let perfilActual = "Invitado"; // nombre del perfil activo
let courseStatus = {};    // estado de la malla del perfil activo


// =========================
// PRERREQUISITOS
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
// UTILIDADES DE PERFIL
// =========================

function actualizarEtiquetaPerfil() {
  const span = document.getElementById("perfil-actual-label");
  if (span) {
    span.textContent = perfilActual ? `Perfil actual: ${perfilActual}` : "";
  }
}

function cargarDesdePerfiles(nombre) {
  perfilActual = nombre || "Invitado";
  courseStatus = perfiles[perfilActual] || {};
  actualizarEtiquetaPerfil();
  actualizarTodo();
  aplicarFiltros();
}

function guardarEnPerfiles() {
  perfiles[perfilActual] = courseStatus;
  const data = {
    perfiles,
    ultimoPerfil: perfilActual,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("No se pudo guardar en localStorage", e);
  }
}

function cargarPerfiles() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      perfiles = {};
      perfilActual = "Invitado";
      courseStatus = {};
      return;
    }
    const data = JSON.parse(raw);
    perfiles = data.perfiles || {};
    perfilActual = data.ultimoPerfil || "Invitado";
    courseStatus = perfiles[perfilActual] || {};
  } catch (e) {
    console.warn("No se pudo cargar desde localStorage", e);
    perfiles = {};
    perfilActual = "Invitado";
    courseStatus = {};
  }
}


// =========================
// CAMBIO DE ESTADO
// =========================

function cambiarEstado(codigo) {
  const actual = courseStatus[codigo]?.estado || "pendiente";

  let nuevoEstado;
  if (actual === "pendiente") nuevoEstado = "cursando";
  else if (actual === "cursando") nuevoEstado = "aprobado";
  else nuevoEstado = "pendiente";

  courseStatus[codigo] = { estado: nuevoEstado };

  guardarEnPerfiles();
  actualizarTodo();
  aplicarFiltros();
}


// =========================
// DETALLE (abre/cierra)
// =========================

function toggleDetalle(codigo) {
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
// ESTADOS VISUALES
// =========================

function obtenerCodigoDesdeCard(card) {
  const h4 = card.querySelector("h4");
  if (!h4) return null;
  return h4.innerText.trim().split(" ")[0];
}

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

function actualizarTodo() {
  aplicarEstados();
  aplicarBloqueos();
}


// =========================
// FILTROS
// =========================

function aplicarFiltros() {
  const select = document.getElementById("filtro-estado");
  if (!select) return;

  const filtro = select.value;
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
// EXPORTAR / IMPORTAR
// =========================

function exportarProgreso() {
  const data = {
    perfil: perfilActual,
    courseStatus,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `malla_qyf_${perfilActual || "perfil"}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}

function importarProgreso(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!data || !data.courseStatus) {
        alert("Archivo inválido");
        return;
      }
      courseStatus = data.courseStatus;
      perfiles[perfilActual] = courseStatus;
      guardarEnPerfiles();
      actualizarTodo();
      aplicarFiltros();
      alert("Progreso importado para el perfil actual.");
    } catch (e) {
      console.error(e);
      alert("No se pudo leer el archivo.");
    }
  };
  reader.readAsText(file);
}


// =========================
// INICIALIZACIÓN
// =========================

document.addEventListener("DOMContentLoaded", () => {
  // Cargar perfiles guardados
  cargarPerfiles();
  actualizarEtiquetaPerfil();

  // Aplicar estado inicial
  actualizarTodo();
  aplicarFiltros();

  // Filtro de estado
  const filtro = document.getElementById("filtro-estado");
  if (filtro) filtro.addEventListener("change", aplicarFiltros);

  // Botones
  const btnGuardar = document.getElementById("btn-guardar");
  if (btnGuardar) btnGuardar.addEventListener("click", () => {
    guardarEnPerfiles();
    alert("Progreso guardado para este perfil 👍");
  });

  const btnBorrar = document.getElementById("btn-borrar");
  if (btnBorrar) btnBorrar.addEventListener("click", () => {
    if (!confirm("¿Seguro que quieres borrar el progreso de este perfil?")) return;
    courseStatus = {};
    perfiles[perfilActual] = courseStatus;
    guardarEnPerfiles();
    actualizarTodo();
    aplicarFiltros();
  });

  const btnExportar = document.getElementById("btn-exportar");
  if (btnExportar) btnExportar.addEventListener("click", exportarProgreso);

  const btnImportar = document.getElementById("btn-importar");
  const inputImportar = document.getElementById("input-importar");
  if (btnImportar && inputImportar) {
    btnImportar.addEventListener("click", () => inputImportar.click());
    inputImportar.addEventListener("change", e => {
      const file = e.target.files[0];
      if (file) importarProgreso(file);
      inputImportar.value = "";
    });
  }

  const btnUsarPerfil = document.getElementById("btn-usar-perfil");
  if (btnUsarPerfil) {
    btnUsarPerfil.addEventListener("click", () => {
      const input = document.getElementById("nombre-perfil");
      const nombre = (input.value || "").trim();
      if (!nombre) {
        alert("Escribe un nombre para el perfil.");
        return;
      }
      cargarDesdePerfiles(nombre);
      guardarEnPerfiles();
    });
  }
});
