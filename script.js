let movimientos = [];
let mesada = 0;

const categoriasGasto = ["alimento", "compras", "deudas", "otros"];
const categoriasIngreso = ["ventas", "trabajo", "otros"];

document.getElementById('tipo').addEventListener('change', actualizarCategorias);
document.getElementById('categoria').addEventListener('change', mostrarCampoNuevo);
document.getElementById('mesadaInput').addEventListener('input', () => {
  mesada = parseFloat(document.getElementById('mesadaInput').value) || 0;
  evaluarMesada();
});

function actualizarCategorias() {
  const tipo = document.getElementById('tipo').value;
  const select = document.getElementById('categoria');
  select.innerHTML = '';

  const lista = tipo === 'gasto' ? categoriasGasto : categoriasIngreso;
  lista.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    select.appendChild(option);
  });
  mostrarCampoNuevo();
}

function mostrarCampoNuevo() {
  const categoria = document.getElementById('categoria').value;
  const campo = document.getElementById('nuevaCategoria');
  campo.style.display = categoria === 'otros' ? 'block' : 'none';
}

function agregarMovimiento() {
  const tipo = document.getElementById('tipo').value;
  const descripcion = document.getElementById('descripcion').value;
  const monto = parseFloat(document.getElementById('monto').value);
  let categoria = document.getElementById('categoria').value;
  const nuevaCat = document.getElementById('nuevaCategoria').value;

  if (categoria === 'otros' && nuevaCat) categoria = nuevaCat;

  if (descripcion && !isNaN(monto)) {
    movimientos.push({ tipo, descripcion, monto, categoria });
    actualizarLista();
    actualizarResumen();
    mostrarGrafico();
    limpiarCampos();
  }
}

function actualizarLista() {
  const lista = document.getElementById('movimientos');
  lista.innerHTML = '';
  movimientos.forEach(m => {
    const item = document.createElement('li');
    item.textContent = `${m.tipo.toUpperCase()}: ${m.descripcion} - $${m.monto.toFixed(2)} [${m.categoria}]`;
    lista.appendChild(item);
  });
}

function actualizarResumen() {
  const gastos = movimientos.filter(m => m.tipo === 'gasto').reduce((sum, m) => sum + m.monto, 0);
  const ingresos = movimientos.filter(m => m.tipo === 'ingreso').reduce((sum, m) => sum + m.monto, 0);

  document.getElementById('totalGastos').textContent = `Total Gastos: $${gastos.toFixed(2)}`;
  document.getElementById('totalIngresos').textContent = `Total Ingresos: $${ingresos.toFixed(2)}`;

  evaluarMesada();
}

function evaluarMesada() {
  const gastos = movimientos.filter(m => m.tipo === 'gasto').reduce((sum, m) => sum + m.monto, 0);
  const alerta = document.getElementById('alertaMesada');

  if (mesada > 0) {
    if (gastos > mesada) {
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
  }
}

function limpiarCampos() {
  document.getElementById('descripcion').value = '';
  document.getElementById('monto').value = '';
  document.getElementById('nuevaCategoria').value = '';
  actualizarCategorias();
}

function mostrarGrafico() {
  const categorias = {};
  movimientos.forEach(m => {
    const clave = `${m.tipo}: ${m.categoria}`;
    categorias[clave] = (categorias[clave] || 0) + m.monto;
  });

  const ctx = document.getElementById('graficoMovimientos').getContext('2d');
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(categorias),
      datasets: [{
        data: Object.values(categorias),
        backgroundColor: ['#800000', '#a52a2a', '#d2691e', '#cd5c5c', '#f08080']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

// Categorías al cargar
actualizarCategorias();
