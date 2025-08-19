let movimientos = [];
let mesada = 0;
let graficoActual = null;
let movimientoEliminado = null;
let indexEliminado = null;

const categoriasGasto = ["alimento", "compras", "deudas", "otros"];
const categoriasIngreso = ["ventas", "trabajo", "otros"];

document.addEventListener("DOMContentLoaded", () => {
  actualizarCategorias();
  document.getElementById("tipo").addEventListener("change", actualizarCategorias);
  document.getElementById("categoria").addEventListener("change", mostrarCampoNuevo);
  document.getElementById("mesadaInput").addEventListener("input", () => {
    mesada = parseFloat(document.getElementById("mesadaInput").value) || 0;
    localStorage.setItem("mesada", mesada);
    evaluarMesada();
  });

  const guardados = localStorage.getItem("movimientos");
  if (guardados) {
    movimientos = JSON.parse(guardados);
    actualizarLista();
    actualizarResumen();
    mostrarGrafico();
  }

  const mesadaGuardada = localStorage.getItem("mesada");
  if (mesadaGuardada) {
    mesada = parseFloat(mesadaGuardada);
    document.getElementById("mesadaInput").value = mesada;
    evaluarMesada();
  }
});

function actualizarCategorias() {
  const tipo = document.getElementById("tipo").value;
  const select = document.getElementById("categoria");
  select.innerHTML = "";

  const lista = tipo === "gasto" ? categoriasGasto : categoriasIngreso;
  lista.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    select.appendChild(option);
  });

  mostrarCampoNuevo();
}

function mostrarCampoNuevo() {
  const categoria = document.getElementById("categoria").value;
  const campo = document.getElementById("nuevaCategoria");
  campo.style.display = categoria === "otros" ? "block" : "none";
}

function agregarMovimiento() {
  const tipo = document.getElementById("tipo").value;
  const descripcion = document.getElementById("descripcion").value.trim();
  const monto = parseFloat(document.getElementById("monto").value);
  const categoriaSeleccionada = document.getElementById("categoria").value;
  const nuevaCategoria = document.getElementById("nuevaCategoria").value.trim();

  if (!descripcion || isNaN(monto)) {
    alert("Por favor, completa la descripción y el monto correctamente.");
    return;
  }

  const categoriaFinal = (categoriaSeleccionada === "otros" && nuevaCategoria)
    ? nuevaCategoria
    : categoriaSeleccionada;

  const movimiento = {
    tipo,
    descripcion,
    monto,
    categoria: categoriaFinal,
    fecha: new Date().toLocaleDateString()
  };

  movimientos.push(movimiento);
  guardarMovimientos();
  actualizarLista();
  actualizarResumen();
  mostrarGrafico();
  limpiarCampos();
}

function guardarMovimientos() {
  localStorage.setItem("movimientos", JSON.stringify(movimientos));
}

function actualizarLista() {
  const lista = document.getElementById("movimientos");
  lista.innerHTML = "";

  movimientos.forEach((m, index) => {
    const item = document.createElement("li");
    item.innerHTML = `
      ${m.tipo.toUpperCase()}: ${m.descripcion} - $${m.monto.toFixed(2)} [${m.categoria}]
      <button onclick="eliminarMovimiento(${index})"><i class="fas fa-trash-alt"></i></button>
    `;
    lista.appendChild(item);
  });
}

function eliminarMovimiento(index) {
  movimientoEliminado = movimientos[index];
  indexEliminado = index;
  movimientos.splice(index, 1);
  guardarMovimientos();
  actualizarLista();
  actualizarResumen();
  mostrarGrafico();

  const noti = document.getElementById("notificacion");
  noti.innerHTML = `
    <p>Movimiento eliminado. <button onclick="deshacerEliminacion()">Deshacer</button></p>
  `;
  noti.style.display = "block";

  setTimeout(() => {
    noti.style.display = "none";
    movimientoEliminado = null;
    indexEliminado = null;
  }, 5000);
}

function deshacerEliminacion() {
  if (movimientoEliminado !== null && indexEliminado !== null) {
    movimientos.splice(indexEliminado, 0, movimientoEliminado);
    guardarMovimientos();
    actualizarLista();
    actualizarResumen();
    mostrarGrafico();
    document.getElementById("notificacion").style.display = "none";
    movimientoEliminado = null;
    indexEliminado = null;
  }
}

function actualizarResumen() {
  const gastos = movimientos
    .filter(m => m.tipo === "gasto")
    .reduce((sum, m) => sum + m.monto, 0);

  const ingresos = movimientos
    .filter(m => m.tipo === "ingreso")
    .reduce((sum, m) => sum + m.monto, 0);

  document.getElementById("totalGastos").textContent = `Total Gastos: $${gastos.toFixed(2)}`;
  document.getElementById("totalIngresos").textContent = `Total Ingresos: $${ingresos.toFixed(2)}`;

  evaluarMesada();
}

function evaluarMesada() {
  const gastos = movimientos.filter(m => m.tipo === "gasto").reduce((sum, m) => sum + m.monto, 0);
  const ingresos = movimientos.filter(m => m.tipo === "ingreso").reduce((sum, m) => sum + m.monto, 0);
  const saldo = ingresos - gastos;

  const alerta = document.getElementById("alertaMesada");
  const saldoTexto = document.getElementById("saldoDisponible");
  const barra = document.getElementById("progresoMesada");

  saldoTexto.textContent = `Saldo disponible: $${saldo.toFixed(2)}`;

  if (mesada > 0) {
    const porcentaje = Math.min((mesada - gastos) / mesada * 100, 100);
    barra.style.width = `${Math.max(porcentaje, 0)}%`;
    barra.style.background = porcentaje < 0 ? "#b22222" : "#4caf50";

    if (gastos > mesada && saldo < 0) {
      alerta.textContent = "⚠️ Cuidado, estás en tu límite 😬";
      alerta.style.background = "#ffcccc";
      alerta.style.color = "#b22222";
    } else {
      alerta.textContent = "✅ ¡Buen trabajo! Tu saldo está saludable 💪";
      alerta.style.background = "#ccffcc";
      alerta.style.color = "#006400";
    }
  } else {
    alerta.textContent = "";
    alerta.style.background = "transparent";
    barra.style.width = "0%";
  }
}

function limpiarCampos() {
  document.getElementById("descripcion").value = "";
  document.getElementById("monto").value = "";
  document.getElementById("nuevaCategoria").value = "";
  actualizarCategorias();
}

function mostrarGrafico() {
  const categorias = {};

  movimientos.forEach(m => {
    const clave = `${m.tipo}: ${m.categoria}`;
    categorias[clave] = (categorias[clave] || 0) + m.monto;
  });

  const canvas = document.getElementById("graficoMovimientos");
  const ctx = canvas.getContext("2d");

  if (graficoActual) {
    graficoActual.destroy();
  }

  graficoActual = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: Object.keys(categorias),
      datasets: [{
        data: Object.values(categorias),
        backgroundColor: [
          "#800000", "#a52a2a", "#d2691e", "#cd5c5c",
          "#f08080", "#ffa07a", "#ff6347", "#ff4500"
        ]
      }]
    },
    options: {
      responsive: false,
      plugins: {
        legend: {
          position: "bottom"
        }
      }
    }
  });
}
