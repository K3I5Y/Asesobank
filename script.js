let movimientos = [];
let mesada = 0;
let graficoActual = null;

const categoriasGasto = ["alimento", "compras", "deudas", "otros"];
const categoriasIngreso = ["ventas", "trabajo", "otros"];

document.addEventListener("DOMContentLoaded", () => {
  actualizarCategorias();

  document.getElementById("tipo").addEventListener("change", actualizarCategorias);
  document.getElementById("categoria").addEventListener("change", mostrarCampoNuevo);
  document.getElementById("mesadaInput").addEventListener("input", () => {
    mesada = parseFloat(document.getElementById("mesadaInput").value) || 0;
    evaluarMesada();
  });
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

  actualizarLista();
  actualizarResumen();
  mostrarGrafico();
  limpiarCampos();
}

function actualizarLista() {
  const lista = document.getElementById("movimientos");
  lista.innerHTML = "";

  movimientos.forEach(m => {
    const item = document.createElement("li");
    item.textContent = `${m.tipo.toUpperCase()}: ${m.descripcion} - $${m.monto.toFixed(2)} [${m.categoria}]`;
    lista.appendChild(item);
  });
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
  const gastos = movimientos
    .filter(m => m.tipo === "gasto")
    .reduce((sum, m) => sum + m.monto, 0);

  const ingresos = movimientos
    .filter(m => m.tipo === "ingreso")
    .reduce((sum, m) => sum + m.monto, 0);

  const alerta = document.getElementById("alertaMesada");
  const saldo = ingresos - gastos;
  const saldoTexto = document.getElementById("saldoDisponible");
  const barra = document.getElementById("progresoMesada");

  saldoTexto.textContent = `Saldo disponible: $${saldo.toFixed(2)}`;

  if (mesada > 0) {
    const porcentaje = Math.min((mesada - gastos) / mesada * 100, 100);
    barra.style.width = `${porcentaje}%`;
    barra.style.background = porcentaje < 0 ? "#b22222" : "#4caf50";

    if (gastos > mesada && saldo < 0) {
      alerta.textContent = "⚠️ Has superado tu mesada";
      alerta.style.background = "#ffcccc";
      alerta.style.color = "#b22222";
    } else {
      alerta.textContent = "✅ Estás dentro de tu mesada";
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
      responsive: true,
      plugins: {
        legend: {
          position: "bottom"
        }
      }
    }
  });
}
