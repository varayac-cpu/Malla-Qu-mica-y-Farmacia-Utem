// =========================
// 1. Estados de los ramos
// =========================
// Todos parten como "pendiente" si no están en esta lista.
// Tú no tienes que editar nada aquí: al hacer clic, se actualiza solo.

const courseStatus = {};


// =========================
// 2. Prerrequisitos
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
// 3. Cambia estado al hacer clic
// =========================

function cambiarEstado(codigo) {
  const estados = ["pendiente", "cursando", "aprobado"];
  const actual = courseStatus[codigo]?.estado || "pendiente";

  let nuevoEstado;
  if (actual === "pendiente") nuevoEstado = "cursando";
  else if (actual === "cursando") nuevoEstado = "aprobado";
  else nuevoEstado = "pendiente";

  courseStatus[codigo] = { estado: nuevoEstado };

  actualizarTodo();
}


// =========================
// 4. Aplica color según estado
// =========================

function aplicarEstados() {
  const cards = document.querySelectorAll(".ramo");

  cards.forEach(card => {
    const codigo = card.dataset.codigo;

    const estado = courseStatus[codigo]?.estado || "pendiente";
    card.dataset.estado = estado;

    card.classList.remove(
      "estado-aprobado",
      "estado-cursando",
      "estado-pendiente"
    );

    card.classList.add(`estado-${estado}`);
  });
}


// =========================
// 5. Bloquea / desbloquea según prerrequisitos
// =========================

function aplicarBloqueos() {
  const cards = document.querySelectorAll(".ramo");

  cards.forEach(card => {
    const codigo = card.dataset.codigo;
    const requisitos = prereqs[codigo] || [];

    card.classList.remove("bloqueado");

    if (requisitos.length === 0) return;

    const todosOk = requisitos.every(r => courseStatus[r]?.estado === "aprobado");

    if (!todosOk) {
      card.classList.add("bloqueado");
    }
  });
}


// =========================
// 6. Actualiza todo
// =========================

function actualizarTodo() {
  aplicarEstados();
  aplicarBloqueos();
}


// =========================
// 7. Inicializa
// =========================

document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".ramo");

  cards.forEach(card => {
    const codigo = card.querySelector("h4").innerText.split(" ")[0];
    card.dataset.codigo = codigo;

    // clic para cambiar estado
    card.addEventListener("click", () => cambiarEstado(codigo));
  });

  actualizarTodo();
});
