let gastos = [];

function agregarGasto() {
  const descripcion = document.getElementById('descripcion').value;
  const monto = parseFloat(document.getElementById('monto').value);
  const categoria = document.getElementById('categoria').value;

  if (descripcion && !isNaN(monto)) {
    gastos.push({ descripcion, monto, categoria });
    actualizarLista();
    actualizarTotal();
    mostrarGrafico();
    limpiarCampos();
  }
}

function actualizarLista() {
  const lista = document.getElementById('gastos');
  lista.innerHTML = '';
  gastos.forEach(gasto => {
    const item = document.createElement('li');
    item.textContent = `${gasto.descripcion} - $${gasto.monto.toFixed(2)} [${gasto.categoria}]`;
    lista.appendChild(item);
  });
}

function actualizarTotal() {
  const total = gastos.reduce((sum, gasto) => sum + gasto.monto, 0);
  document.getElementById('total').textContent = `$${total.toFixed(2)}`;
}

function limpiarCampos() {
  document.getElementById('descripcion').value = '';
  document.getElementById('monto').value = '';
  document.getElementById('categoria').value = 'asesoria';
}

function mostrarGrafico() {
  const categorias = {};
  gastos.forEach(g => {
    categorias[g.categoria] = (categorias[g.categoria] || 0) + g.monto;
  });

  const ctx = document.getElementById('graficoGastos').getContext('2d');
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(categorias),
      datasets: [{
        data: Object.values(categorias),
        backgroundColor: ['#FFD700', '#FF6347', '#87CEEB']
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
