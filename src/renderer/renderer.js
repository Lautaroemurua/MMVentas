// Estado de la aplicación
let productos = [];
let ticketActual = [];
let productoEditando = null;
let productoSeleccionado = null;
let configuracionActual = null;
let logoBase64Temp = null;
let modificadores = [];
let modificadoresSeleccionados = {};
let modificadorEditando = null;
let opcionesPredefinidas = [];
let opcionesSeleccionadas = [];

// Elementos del DOM
const productoBuscar = document.getElementById('producto-buscar');
const resultadosBusqueda = document.getElementById('resultados-busqueda');
const productoSeleccionadoInfo = document.getElementById('producto-seleccionado-info');
const selectedId = document.getElementById('selected-id');
const selectedNombre = document.getElementById('selected-nombre');
const selectedPrecio = document.getElementById('selected-precio');
const cantidadInput = document.getElementById('cantidad-input');
const modificadoresContainer = document.getElementById('modificadores-container');
const modificadoresList = document.getElementById('modificadores-list');

// Modal de modificadores
const modalModificadores = document.getElementById('modal-modificadores');
const btnModificadores = document.getElementById('btn-modificadores');
const btnCerrarModalModificadores = document.getElementById('btn-cerrar-modal-modificadores');
const modificadorNombre = document.getElementById('modificador-nombre');
const modificadorTipo = document.getElementById('modificador-tipo');
const modificadorOpciones = document.getElementById('modificador-opciones');
const modificadorPrecio = document.getElementById('modificador-precio');
const opcionesGroup = document.getElementById('opciones-group');
const btnGuardarModificador = document.getElementById('btn-guardar-modificador');
const btnCancelarMod = document.getElementById('btn-cancelar-mod');
const modificadoresBody = document.getElementById('modificadores-body');
const btnAgregar = document.getElementById('btn-agregar');
const ticketBody = document.getElementById('ticket-body');
const totalAmount = document.getElementById('total-amount');
const btnCancelar = document.getElementById('btn-cancelar');
const btnFinalizar = document.getElementById('btn-finalizar');
const historialContainer = document.getElementById('historial-container');

// Modal de productos
const modal = document.getElementById('modal-productos');
const btnGestionarProductos = document.getElementById('btn-gestionar-productos');
const btnCerrarModal = document.getElementById('btn-cerrar-modal');

// Modal de configuración
const modalConfig = document.getElementById('modal-configuracion');
const btnConfiguracion = document.getElementById('btn-configuracion');
const btnCerrarModalConfig = document.getElementById('btn-cerrar-modal-config');
const nombreNegocioInput = document.getElementById('nombre-negocio');
const piePaginaInput = document.getElementById('pie-pagina');
const logoInput = document.getElementById('logo-input');
const btnSeleccionarLogo = document.getElementById('btn-seleccionar-logo');
const btnEliminarLogo = document.getElementById('btn-eliminar-logo');
const logoPreview = document.getElementById('logo-preview');
const btnGuardarConfig = document.getElementById('btn-guardar-config');
const btnCancelarConfig = document.getElementById('btn-cancelar-config');
const productosBody = document.getElementById('productos-body');
const productoNombre = document.getElementById('producto-nombre');
const productoPrecio = document.getElementById('producto-precio');
const productoCodigoBarras = document.getElementById('producto-codigo-barras');
const btnGuardarProducto = document.getElementById('btn-guardar-producto');
const btnCancelarEdit = document.getElementById('btn-cancelar-edit');
const formTitle = document.getElementById('form-title');
const productoIdEdit = document.getElementById('producto-id-edit');

// Modal de código de barras
const modalCodigoBarras = document.getElementById('modal-codigo-barras');
const btnCerrarModalBarcode = document.getElementById('btn-cerrar-modal-barcode');
const barcodeEscaneado = document.getElementById('barcode-escaneado');
const barcodeProductoInfo = document.getElementById('barcode-producto-info');
const barcodeProductoNoexiste = document.getElementById('barcode-producto-noexiste');
const barcodeProductoNombre = document.getElementById('barcode-producto-nombre');
const barcodeProductoPrecio = document.getElementById('barcode-producto-precio');
const barcodeActions = document.getElementById('barcode-actions');

// Modal de modificadores por producto
const modalProductoModificadores = document.getElementById('modal-producto-modificadores');
const btnCerrarModalProductoMods = document.getElementById('btn-cerrar-modal-producto-mods');
const productoModsNombre = document.getElementById('producto-mods-nombre');
const listaModificadoresDisponibles = document.getElementById('lista-modificadores-disponibles');
const btnGuardarProductoMods = document.getElementById('btn-guardar-producto-mods');
const btnCancelarProductoMods = document.getElementById('btn-cancelar-producto-mods');
let productoIdParaModificadores = null;

// Variables para detección de escaneo de código de barras
let barcodeScanBuffer = '';
let barcodeScanTimeout = null;
let productoEscaneado = null;

// Inicializar aplicación
async function init() {
  await cargarProductos();
  await cargarHistorialVentas();
  await cargarConfiguracion();
  await cargarModificadores();
  configurarEventos();
  configurarDetectorCodigoBarras();
  actualizarInfoTrial();
  setInterval(actualizarInfoTrial, 60000); // Actualizar cada minuto (cuenta regresiva)
}

// Cargar configuración
async function cargarConfiguracion() {
  configuracionActual = await window.api.obtenerConfiguracion();
}

// Cargar modificadores
async function cargarModificadores() {
  modificadores = await window.api.obtenerModificadores();
  console.log('Modificadores cargados:', modificadores.length, modificadores);
  actualizarTablaModificadores();
}

// Cargar modificadores de un producto específico
async function cargarModificadoresProducto(productoId) {
  const modsProducto = await window.api.obtenerModificadores(productoId);
  console.log('Modificadores del producto', productoId, ':', modsProducto.length);
  
  if (modsProducto.length > 0) {
    mostrarModificadoresProducto(modsProducto);
  } else {
    modificadoresContainer.style.display = 'none';
  }
}

// Actualizar información del trial
async function actualizarInfoTrial() {
  const trialInfo = await window.api.obtenerInfoTrial();
  const trialElement = document.getElementById('trial-info');
  
  if (trialInfo.active) {
    trialElement.style.display = 'block';
    
    const tipoLicencia = trialInfo.isPremium ? 'Premium' : 'Período de prueba';
    
    // Si quedan menos de 24h, mostrar advertencia en rojo con cuenta regresiva detallada
    if (trialInfo.warning) {
      const horasText = trialInfo.hours > 0 ? `${trialInfo.hours}h ` : '';
      const minutosText = `${trialInfo.minutes}min`;
      trialElement.style.background = '#dc3545';
      trialElement.style.color = 'white';
      trialElement.style.fontWeight = 'bold';
      trialElement.style.padding = '12px 20px';
      trialElement.style.animation = 'pulse 2s infinite';
      trialElement.innerHTML = `⚠️ <strong>¡ADVERTENCIA!</strong> ${tipoLicencia} expira en: ${horasText}${minutosText}`;
    } else {
      // Mostrar info normal con días/horas restantes
      const diasText = trialInfo.days > 0 ? `${trialInfo.days} día${trialInfo.days !== 1 ? 's' : ''}` : '';
      const horasText = trialInfo.hours > 0 ? `${trialInfo.hours}h` : '';
      
      if (trialInfo.isPremium) {
        // Premium: mostrar en verde
        trialElement.style.background = '#28a745';
        trialElement.style.color = 'white';
      } else {
        // Trial: mostrar en azul
        trialElement.style.background = '#f0f8ff';
        trialElement.style.color = '#333';
      }
      
      trialElement.style.fontWeight = 'normal';
      trialElement.style.padding = '8px 15px';
      trialElement.style.animation = 'none';
      
      if (trialInfo.days > 0) {
        trialElement.innerHTML = `${trialInfo.isPremium ? '✅' : '⏱️'} <strong>${tipoLicencia}:</strong> ${diasText} ${horasText} restantes`;
      } else {
        trialElement.innerHTML = `${trialInfo.isPremium ? '✅' : '⏱️'} <strong>${tipoLicencia}:</strong> ${horasText} ${trialInfo.minutes}min restantes`;
      }
    }
  } else {
    trialElement.style.display = 'none';
  }
}

// Cargar productos desde la base de datos
async function cargarProductos() {
  productos = await window.api.obtenerProductos();
  actualizarTablaProductos();
}

// Buscar productos con filtrado en tiempo real
function buscarProductos(termino) {
  if (!termino.trim()) {
    // Si está vacío, mostrar todos los productos
    const todosLosProductos = productos.map(p => `
      <div class="resultado-item" data-id="${p.id}">
        <span class="resultado-id">ID: ${p.id}</span>
        <span class="resultado-nombre">${p.nombre}</span>
        <span class="resultado-precio">$${p.precio.toFixed(2)}</span>
      </div>
    `).join('');
    
    resultadosBusqueda.innerHTML = todosLosProductos;
    resultadosBusqueda.style.display = 'block';
    agregarEventosResultados();
    return;
  }

  const terminoLower = termino.toLowerCase();
  const resultados = productos.filter(p => 
    p.nombre.toLowerCase().includes(terminoLower) ||
    p.id.toString().includes(termino)
  );

  if (resultados.length === 0) {
    resultadosBusqueda.innerHTML = '<div class="resultado-item no-results">No se encontraron productos</div>';
    resultadosBusqueda.style.display = 'block';
    return;
  }

  resultadosBusqueda.innerHTML = resultados.map(p => {
    // Resaltar el texto que coincide
    const nombre = p.nombre;
    const nombreResaltado = nombre.replace(new RegExp(termino, 'gi'), match => `<mark>${match}</mark>`);
    
    return `
      <div class="resultado-item" data-id="${p.id}">
        <span class="resultado-id">ID: ${p.id}</span>
        <span class="resultado-nombre">${nombreResaltado}</span>
        <span class="resultado-precio">$${p.precio.toFixed(2)}</span>
      </div>
    `;
  }).join('');
  
  resultadosBusqueda.style.display = 'block';
  agregarEventosResultados();
}

// Agregar eventos a resultados de búsqueda (función separada para evitar duplicados)
function agregarEventosResultados() {
  document.querySelectorAll('.resultado-item[data-id]').forEach(item => {
    item.onclick = () => {
      seleccionarProducto(parseInt(item.dataset.id));
    };
  });
}

// Seleccionar producto
async function seleccionarProducto(id) {
  const producto = productos.find(p => p.id === id);
  if (!producto) return;

  productoSeleccionado = producto;
  modificadoresSeleccionados = {};
  
  selectedId.textContent = producto.id;
  selectedNombre.textContent = producto.nombre;
  selectedPrecio.textContent = producto.precio.toFixed(2);
  
  productoSeleccionadoInfo.style.display = 'block';
  resultadosBusqueda.style.display = 'none';
  productoBuscar.value = '';
  
  // Cargar modificadores específicos del producto
  await cargarModificadoresProducto(producto.id);
  
  btnAgregar.disabled = false;
  cantidadInput.focus();
}

// Helper para devolver foco al input de búsqueda
function devolverFocoABusqueda() {
  setTimeout(() => productoBuscar.focus(), 50);
}

// Mostrar modificadores de un producto específico
function mostrarModificadoresProducto(modsProducto) {
  if (modsProducto.length === 0) {
    modificadoresContainer.style.display = 'none';
    return;
  }
  
  renderizarModificadores(modsProducto);
  modificadoresContainer.style.display = 'block';
}

// Mostrar modificadores disponibles (para admin)
function mostrarModificadores() {
  console.log('mostrarModificadores llamado. Total modificadores:', modificadores.length);
  
  if (modificadores.length === 0) {
    console.log('No hay modificadores, ocultando contenedor');
    modificadoresContainer.style.display = 'none';
    return;
  }

  renderizarModificadores(modificadores);
  modificadoresContainer.style.display = 'block';
}

// Renderizar modificadores en el DOM
async function renderizarModificadores(mods) {
  console.log('Generando HTML para modificadores...');
  
  // Cargar opciones predefinidas con precios
  const opcionesPred = await window.api.obtenerOpcionesPredefinidas();
  const mapaPrecios = {};
  opcionesPred.forEach(op => {
    mapaPrecios[op.nombre] = op.precio_adicional || 0;
  });
  
  modificadoresList.innerHTML = mods.map(mod => {
    if (mod.tipo === 'texto') {
      return `
        <div class="modificador-item">
          <label>${mod.nombre}:</label>
          <input type="text" class="form-control modificador-input" data-mod-id="${mod.id}" data-precio="0" placeholder="Ej: Sin cebolla, extra salsa">
        </div>
      `;
    } else if (mod.tipo === 'opciones') {
      const opciones = mod.opciones || [];
      return `
        <div class="modificador-item">
          <label>${mod.nombre}:</label>
          <select class="form-control modificador-select" data-mod-id="${mod.id}">
            <option value="" data-precio="0">-- Ninguno --</option>
            ${opciones.map(op => {
              const precio = mapaPrecios[op] || 0;
              return `<option value="${op}" data-precio="${precio}">${op}${precio > 0 ? ` (+$${precio.toFixed(2)})` : ''}</option>`;
            }).join('')}
          </select>
        </div>
      `;
    } else if (mod.tipo === 'checkbox') {
      const opciones = mod.opciones || [];
      
      // Si tiene opciones, mostrar múltiples checkboxes
      if (opciones.length > 0) {
        return `
          <div class="modificador-item" style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600;">${mod.nombre}:</label>
            <div style="display: flex; flex-direction: column; gap: 8px; padding-left: 10px;">
              ${opciones.map(op => {
                const precio = mapaPrecios[op] || 0;
                return `
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <input type="checkbox" class="modificador-checkbox-multiple" 
                      data-mod-id="${mod.id}" 
                      data-opcion="${op}"
                      data-precio="${precio}" 
                      id="mod-${mod.id}-${op.replace(/\s+/g, '-')}" 
                      style="width: 18px; height: 18px; margin: 0; cursor: pointer;">
                    <label for="mod-${mod.id}-${op.replace(/\s+/g, '-')}" style="margin: 0; cursor: pointer; font-size: 14px;">${op}${precio > 0 ? ` (+$${precio.toFixed(2)})` : ''}</label>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
      } else {
        // Checkbox simple sin opciones
        return `
          <div class="modificador-item" style="display: flex; align-items: center; gap: 10px;">
            <input type="checkbox" class="modificador-checkbox" data-mod-id="${mod.id}" data-precio="0" id="mod-${mod.id}" style="width: auto; margin: 0;">
            <label for="mod-${mod.id}" style="margin: 0; cursor: pointer;">${mod.nombre}</label>
          </div>
        `;
      }
    }
    return '';
  }).join('');
  
  // Agregar eventos para capturar valores
  document.querySelectorAll('.modificador-input, .modificador-select, .modificador-checkbox, .modificador-checkbox-multiple').forEach(el => {
    el.onchange = () => capturarModificadores();
  });
}

// Capturar valores de modificadores
function capturarModificadores() {
  modificadoresSeleccionados = {};
  
  // Capturar inputs de texto
  document.querySelectorAll('.modificador-input').forEach(el => {
    const modId = el.dataset.modId;
    const valor = el.value.trim();
    
    if (valor) {
      const mod = modificadores.find(m => m.id == modId);
      modificadoresSeleccionados[modId] = {
        nombre: mod.nombre,
        valor: valor,
        precio: 0
      };
    }
  });

  // Capturar selects (tomar precio de la opción seleccionada)
  document.querySelectorAll('.modificador-select').forEach(el => {
    const modId = el.dataset.modId;
    const valor = el.value.trim();
    
    if (valor) {
      const selectedOption = el.options[el.selectedIndex];
      const precio = parseFloat(selectedOption.dataset.precio) || 0;
      const mod = modificadores.find(m => m.id == modId);
      modificadoresSeleccionados[modId] = {
        nombre: mod.nombre,
        valor: valor,
        precio: precio
      };
    }
  });

  // Capturar checkboxes simples
  document.querySelectorAll('.modificador-checkbox').forEach(el => {
    const modId = el.dataset.modId;
    const precio = parseFloat(el.dataset.precio) || 0;
    
    if (el.checked) {
      const mod = modificadores.find(m => m.id == modId);
      modificadoresSeleccionados[modId] = {
        nombre: mod.nombre,
        valor: 'Sí',
        precio: precio
      };
    }
  });

  // Capturar checkboxes múltiples (con opciones)
  const checkboxesMultiples = document.querySelectorAll('.modificador-checkbox-multiple:checked');
  const opcionesPorModificador = {};
  
  checkboxesMultiples.forEach(el => {
    const modId = el.dataset.modId;
    const opcion = el.dataset.opcion;
    const precio = parseFloat(el.dataset.precio) || 0;
    
    if (!opcionesPorModificador[modId]) {
      opcionesPorModificador[modId] = [];
    }
    opcionesPorModificador[modId].push({ opcion, precio });
  });

  // Agregar al objeto de seleccionados
  Object.keys(opcionesPorModificador).forEach(modId => {
    const mod = modificadores.find(m => m.id == modId);
    const opciones = opcionesPorModificador[modId];
    const precioTotal = opciones.reduce((sum, op) => sum + op.precio, 0);
    const opcionesTexto = opciones.map(op => op.opcion).join(', ');
    
    modificadoresSeleccionados[modId] = {
      nombre: mod.nombre,
      valor: opcionesTexto,
      precio: precioTotal
    };
  });
}

// Actualizar tabla de productos en el modal
function actualizarTablaProductos() {
  if (productos.length === 0) {
    productosBody.innerHTML = '<tr><td colspan="6">No hay productos registrados</td></tr>';
    return;
  }

  productosBody.innerHTML = productos.map(producto => `
    <tr>
      <td>${producto.id}</td>
      <td>${producto.nombre}</td>
      <td>$${producto.precio.toFixed(2)}</td>
      <td>${producto.codigo_barras ? '<span style="font-family: monospace; background: #f0f0f0; padding: 2px 6px; border-radius: 3px;">' + producto.codigo_barras + '</span>' : '<span style="color: #999;">-</span>'}</td>
      <td>
        <button class="btn-small" style="background: #667eea;" data-id="${producto.id}" data-mods="true">⚙️</button>
      </td>
      <td>
        <button class="btn-small btn-edit" data-id="${producto.id}">Editar</button>
        <button class="btn-small btn-delete" data-id="${producto.id}">Eliminar</button>
      </td>
    </tr>
  `).join('');

  // Eventos para botones de editar y eliminar (usar onclick para evitar duplicados)
  document.querySelectorAll('.btn-edit').forEach(btn => {
    btn.onclick = () => editarProducto(parseInt(btn.dataset.id));
  });

  document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.onclick = () => eliminarProducto(parseInt(btn.dataset.id));
  });

  document.querySelectorAll('[data-mods="true"]').forEach(btn => {
    btn.onclick = () => gestionarModificadoresProducto(parseInt(btn.dataset.id));
  });
}

// Configurar eventos
function configurarEventos() {
  // Buscar productos - filtrado en tiempo real
  productoBuscar.addEventListener('input', (e) => {
    buscarProductos(e.target.value);
  });

  // Mostrar todos los productos al hacer focus
  productoBuscar.addEventListener('focus', () => {
    buscarProductos(productoBuscar.value);
  });

  // Cerrar resultados al hacer clic fuera
  document.addEventListener('click', (e) => {
    if (!productoBuscar.contains(e.target) && !resultadosBusqueda.contains(e.target)) {
      resultadosBusqueda.style.display = 'none';
    }
  });

  // Navegación con teclado en resultados y detección de código de barras
  productoBuscar.addEventListener('keydown', async (e) => {
    const items = document.querySelectorAll('.resultado-item[data-id]');
    
    // Detectar Enter para buscar código de barras o seleccionar producto
    if (e.key === 'Enter') {
      e.preventDefault();
      
      const valor = productoBuscar.value.trim();
      
      // Si hay un valor, primero intentar buscar por código de barras
      if (valor) {
        console.log('🔍 Buscando por código de barras:', valor);
        const producto = await window.api.buscarPorCodigoBarras(valor);
        
        if (producto) {
          console.log('✅ Producto encontrado por código de barras:', producto);
          seleccionarProducto(producto.id);
          return;
        }
      }
      
      // Si no encontró por código, buscar en resultados visibles
      const current = document.querySelector('.resultado-item.selected');
      if (current) {
        seleccionarProducto(parseInt(current.dataset.id));
      } else if (items.length === 1) {
        seleccionarProducto(parseInt(items[0].dataset.id));
      }
      return;
    }

    if (items.length === 0) return;

    const current = document.querySelector('.resultado-item.selected');
    let index = Array.from(items).indexOf(current);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (current) current.classList.remove('selected');
      index = (index + 1) % items.length;
      items[index].classList.add('selected');
      items[index].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (current) current.classList.remove('selected');
      index = index <= 0 ? items.length - 1 : index - 1;
      items[index].classList.add('selected');
      items[index].scrollIntoView({ block: 'nearest' });
    }
  });

  // Agregar item al ticket
  btnAgregar.addEventListener('click', agregarItemAlTicket);

  // Cancelar venta
  btnCancelar.addEventListener('click', cancelarVenta);

  // Finalizar venta
  btnFinalizar.addEventListener('click', finalizarVenta);

  // Modal de productos
  btnGestionarProductos.addEventListener('click', () => {
    modal.style.display = 'flex';
    limpiarFormularioProducto();
    setTimeout(() => productoNombre.focus(), 100);
  });

  btnCerrarModal.addEventListener('click', () => {
    modal.style.display = 'none';
    devolverFocoABusqueda();
  });

  // Modal de configuración
  btnConfiguracion.addEventListener('click', () => {
    abrirModalConfiguracion();
  });

  btnCerrarModalConfig.addEventListener('click', () => {
    modalConfig.style.display = 'none';
    devolverFocoABusqueda();
  });

  btnSeleccionarLogo.addEventListener('click', () => {
    logoInput.click();
  });

  logoInput.addEventListener('change', (e) => {
    cargarLogo(e.target.files[0]);
  });

  btnEliminarLogo.addEventListener('click', () => {
    eliminarLogoTemp();
  });

  btnGuardarConfig.addEventListener('click', guardarConfiguracion);
  btnCancelarConfig.addEventListener('click', () => {
    modalConfig.style.display = 'none';
    devolverFocoABusqueda();
  });

  // Modal de modificadores
  btnModificadores.addEventListener('click', () => {
    modalModificadores.style.display = 'flex';
    limpiarFormularioModificador();
  });

  btnCerrarModalModificadores.addEventListener('click', () => {
    modalModificadores.style.display = 'none';
    devolverFocoABusqueda();
  });

  modificadorTipo.addEventListener('change', async () => {
    const tipo = modificadorTipo.value;
    const mostrar = tipo === 'opciones' || tipo === 'checkbox';
    opcionesGroup.style.display = mostrar ? 'block' : 'none';
    if (mostrar) {
      await cargarOpcionesPredefinidas();
    }
    // Siempre devolver foco al input de nombre después de cargar opciones
    setTimeout(() => modificadorNombre.focus(), 100);
  });

  btnGuardarModificador.addEventListener('click', guardarModificador);
  btnCancelarMod.addEventListener('click', () => {
    limpiarFormularioModificador();
    devolverFocoABusqueda();
  });

  // Agregar nueva opción predefinida
  document.getElementById('btn-agregar-opcion').addEventListener('click', agregarNuevaOpcion);
  
  // Enter en el input de nueva opción
  document.getElementById('nueva-opcion-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      agregarNuevaOpcion();
    }
  });

  // Manejar tecla ESC global
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      // Cerrar dropdown de búsqueda primero
      if (resultadosBusqueda && resultadosBusqueda.style.display === 'block') {
        resultadosBusqueda.style.display = 'none';
        e.preventDefault();
        productoBuscar.focus();
        return;
      }
    }
  });

  // Cerrar modales al hacer clic fuera
  const handleModalClick = (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
    if (e.target === modalConfig) {
      modalConfig.style.display = 'none';
    }
    if (e.target === modalModificadores) {
      modalModificadores.style.display = 'none';
    }
    if (e.target === modalCodigoBarras) {
      modalCodigoBarras.style.display = 'none';
    }
    if (e.target === modalProductoModificadores) {
      modalProductoModificadores.style.display = 'none';
    }
  };
  
  window.addEventListener('click', handleModalClick);

  // Cerrar modales con ESC
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const anyModalOpen = modal.style.display === 'flex' || 
                           modalConfig.style.display === 'flex' || 
                           modalModificadores.style.display === 'flex' || 
                           modalCodigoBarras.style.display === 'flex' ||
                           modalProductoModificadores.style.display === 'flex';
      
      modal.style.display = 'none';
      modalConfig.style.display = 'none';
      modalModificadores.style.display = 'none';
      modalCodigoBarras.style.display = 'none';
      modalProductoModificadores.style.display = 'none';
      
      if (anyModalOpen) {
        requestAnimationFrame(() => {
          setTimeout(() => productoBuscar.focus(), 100);
        });
      }
    }
  });

  // Guardar producto
  btnGuardarProducto.addEventListener('click', guardarProducto);
  btnCancelarEdit.addEventListener('click', limpiarFormularioProducto);

  // Enter en cantidad para agregar al ticket
  cantidadInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      agregarItemAlTicket();
    }
  });
}

// Agregar item al ticket
function agregarItemAlTicket() {
  if (!productoSeleccionado) {
    alert('Por favor seleccione un producto');
    return;
  }

  const cantidad = parseInt(cantidadInput.value);
  if (cantidad <= 0) {
    alert('La cantidad debe ser mayor a 0');
    return;
  }

  // Capturar modificadores actuales
  capturarModificadores();

  // Calcular precio adicional por modificadores
  let precioAdicional = 0;
  Object.values(modificadoresSeleccionados).forEach(mod => {
    precioAdicional += mod.precio;
  });

  const item = {
    id: productoSeleccionado.id,
    nombre: productoSeleccionado.nombre,
    precio: productoSeleccionado.precio + precioAdicional,
    cantidad: cantidad,
    modificadores: Object.keys(modificadoresSeleccionados).length > 0 ? {...modificadoresSeleccionados} : null
  };

  // Siempre agregar como item nuevo si tiene modificadores diferentes
  ticketActual.push(item);

  actualizarTablaTicket();
  
  // Limpiar selección
  productoSeleccionado = null;
  modificadoresSeleccionados = {};
  productoSeleccionadoInfo.style.display = 'none';
  modificadoresContainer.style.display = 'none';
  cantidadInput.value = '1';
  btnAgregar.disabled = true;
  productoBuscar.focus();
}

// Actualizar tabla del ticket
function actualizarTablaTicket() {
  if (ticketActual.length === 0) {
    ticketBody.innerHTML = '<tr class="empty-row"><td colspan="5">No hay items en el ticket</td></tr>';
    btnCancelar.disabled = true;
    btnFinalizar.disabled = true;
    totalAmount.textContent = '$0.00';
    return;
  }

  ticketBody.innerHTML = ticketActual.map((item, index) => {
    const subtotal = item.cantidad * item.precio;
    const modificadoresHtml = item.modificadores ? 
      '<br><small style="color: #666; font-size: 12px;">' + 
      Object.values(item.modificadores).map(m => `• ${m.nombre}: ${m.valor}`).join('<br>') + 
      '</small>' : '';
    
    return `
      <tr>
        <td>${item.nombre}${modificadoresHtml}</td>
        <td>${item.cantidad}</td>
        <td>$${item.precio.toFixed(2)}</td>
        <td>$${subtotal.toFixed(2)}</td>
        <td>
          <button class="btn-remove" data-index="${index}">✕</button>
        </td>
      </tr>
    `;
  }).join('');

  // Eventos para eliminar items (usar onclick para evitar duplicados)
  document.querySelectorAll('.btn-remove').forEach(btn => {
    btn.onclick = () => {
      ticketActual.splice(parseInt(btn.dataset.index), 1);
      actualizarTablaTicket();
      
      // Devolver foco al buscador
      setTimeout(() => {
        productoBuscar.focus();
      }, 50);
    };
  });

  // Calcular total
  const total = ticketActual.reduce((sum, item) => sum + (item.cantidad * item.precio), 0);
  totalAmount.textContent = `$${total.toFixed(2)}`;

  btnCancelar.disabled = false;
  btnFinalizar.disabled = false;
}

// Cancelar venta
function cancelarVenta() {
  if (confirm('¿Está seguro de cancelar la venta actual?')) {
    ticketActual = [];
    actualizarTablaTicket();
    
    // Devolver foco al buscador
    requestAnimationFrame(() => {
      setTimeout(() => {
        productoBuscar.focus();
        productoBuscar.select();
      }, 50);
    });
  }
}

// Finalizar venta
async function finalizarVenta() {
  if (ticketActual.length === 0) return;

  const total = ticketActual.reduce((sum, item) => sum + (item.cantidad * item.precio), 0);

  try {
    // Guardar venta
    const venta = await window.api.guardarVenta({
      items: ticketActual,
      total: total
    });

    // Limpiar ticket inmediatamente
    ticketActual = [];
    actualizarTablaTicket();

    // Imprimir ticket (en segundo plano)
    window.api.imprimirTicket({ venta }).catch(err => {
      console.error('Error al imprimir:', err);
    });

    // Actualizar historial
    cargarHistorialVentas().catch(err => {
      console.error('Error al cargar historial:', err);
    });

    // Mostrar confirmación y manejar el foco correctamente
    alert(`✅ Venta #${venta.id} finalizada\n\nTotal: $${venta.total.toFixed(2)}`);

    // Usar requestAnimationFrame y setTimeout para asegurar el foco
    requestAnimationFrame(() => {
      setTimeout(() => {
        productoBuscar.focus();
        productoBuscar.select();
        console.log('Foco devuelto al buscador');
      }, 100);
    });
  } catch (error) {
    console.error('Error al finalizar venta:', error);
    alert('❌ Error al procesar la venta');
  }
}

// Cargar historial de ventas
async function cargarHistorialVentas() {
  try {
    const ventas = await window.api.obtenerVentas();
    
    if (ventas.length === 0) {
      historialContainer.innerHTML = '<p>No hay ventas registradas</p>';
      return;
    }

    historialContainer.innerHTML = ventas.slice(0, 10).map(venta => {
      return `
        <div class="venta-card">
          <div class="venta-header">
            <strong>Ticket #${venta.id}</strong>
            <span>${venta.fecha}</span>
          </div>
          <div class="venta-body">
            <div>${venta.items.length} producto(s)</div>
            <div class="venta-total">$${venta.total.toFixed(2)}</div>
          </div>
          <button class="btn-reimprimir" data-id="${venta.id}">Reimprimir</button>
        </div>
      `;
    }).join('');

    // Eventos para reimprimir (usar onclick para evitar duplicados)
    document.querySelectorAll('.btn-reimprimir').forEach(btn => {
      btn.onclick = async () => {
        const venta = await window.api.obtenerVenta(parseInt(btn.dataset.id));
        await window.api.imprimirTicket({ venta });
      };
    });
  } catch (error) {
    console.error('Error al cargar historial:', error);
    historialContainer.innerHTML = '<p>Error al cargar historial</p>';
  }
}

// Guardar producto (crear o actualizar)
async function guardarProducto() {
  const nombre = productoNombre.value.trim();
  const precio = parseFloat(productoPrecio.value);
  const codigoBarras = productoCodigoBarras.value.trim();

  if (!nombre) {
    alert('Por favor ingrese el nombre del producto');
    productoNombre.focus();
    return;
  }

  if (isNaN(precio) || precio <= 0) {
    alert('Por favor ingrese un precio válido');
    productoPrecio.focus();
    return;
  }

  try {
    if (productoEditando) {
      // Actualizar
      await window.api.actualizarProducto({
        id: productoEditando,
        nombre,
        precio,
        codigoBarras
      });
      await cargarProductos();
      alert('✅ Producto actualizado correctamente');
    } else {
      // Crear
      await window.api.crearProducto({ nombre, precio, codigoBarras });
      await cargarProductos();
      alert('✅ Producto creado correctamente');
    }

    limpiarFormularioProducto();
  } catch (error) {
    console.error('Error al guardar producto:', error);
    alert('❌ Error al guardar el producto');
  }
}

// Editar producto
function editarProducto(id) {
  const producto = productos.find(p => p.id === id);
  if (!producto) return;

  productoEditando = id;
  productoNombre.value = producto.nombre;
  productoPrecio.value = producto.precio;
  productoCodigoBarras.value = producto.codigo_barras || '';
  formTitle.textContent = 'Editar Producto';
  btnGuardarProducto.textContent = 'Actualizar Producto';
}

// Eliminar producto
async function eliminarProducto(id) {
  const producto = productos.find(p => p.id === id);
  if (!producto) return;

  if (confirm(`¿Está seguro de eliminar "${producto.nombre}"?`)) {
    try {
      await window.api.eliminarProducto(id);
      await cargarProductos();
      alert('Producto eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      alert('Error al eliminar el producto');
    }
  }
}

// Limpiar formulario de producto
function limpiarFormularioProducto() {
  productoEditando = null;
  productoNombre.value = '';
  productoPrecio.value = '';
  productoCodigoBarras.value = '';
  formTitle.textContent = 'Agregar Nuevo Producto';
  btnGuardarProducto.textContent = 'Guardar Producto';
}

// Abrir modal de configuración
function abrirModalConfiguracion() {
  nombreNegocioInput.value = configuracionActual.nombre_negocio || '';
  piePaginaInput.value = configuracionActual.pie_pagina || '';
  
  if (configuracionActual.logo_base64) {
    logoPreview.innerHTML = `<img src="${configuracionActual.logo_base64}" alt="Logo">`;
    btnEliminarLogo.style.display = 'inline-block';
    logoBase64Temp = configuracionActual.logo_base64;
  } else {
    logoPreview.innerHTML = '<span class="no-logo">Sin logo configurado</span>';
    btnEliminarLogo.style.display = 'none';
    logoBase64Temp = null;
  }
  
  modalConfig.style.display = 'flex';
  setTimeout(() => nombreNegocioInput.focus(), 100);
}

// Cargar logo desde archivo
function cargarLogo(file) {
  if (!file) return;
  
  if (!file.type.startsWith('image/')) {
    alert('Por favor seleccione un archivo de imagen válido');
    logoInput.value = ''; // Limpiar input
    return;
  }

  // Límite de 500KB
  if (file.size > 500 * 1024) {
    alert('La imagen es muy grande. Por favor use una imagen menor a 500KB');
    logoInput.value = ''; // Limpiar input
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    logoBase64Temp = e.target.result;
    logoPreview.innerHTML = `<img src="${logoBase64Temp}" alt="Logo">`;
    btnEliminarLogo.style.display = 'inline-block';
  };
  reader.onerror = () => {
    alert('Error al cargar la imagen');
    logoInput.value = '';
  };
  reader.readAsDataURL(file);
}

// Eliminar logo temporal
function eliminarLogoTemp() {
  logoBase64Temp = null;
  logoPreview.innerHTML = '<span class="no-logo">Sin logo configurado</span>';
  btnEliminarLogo.style.display = 'none';
  logoInput.value = '';
}

// Guardar configuración
async function guardarConfiguracion() {
  const nombreNegocio = nombreNegocioInput.value.trim();
  const piePagina = piePaginaInput.value.trim();

  if (!nombreNegocio) {
    alert('Por favor ingrese el nombre del negocio');
    nombreNegocioInput.focus();
    return;
  }

  if (!piePagina) {
    alert('Por favor ingrese el pie de página');
    piePaginaInput.focus();
    return;
  }

  try {
    await window.api.guardarConfiguracion({
      logoBase64: logoBase64Temp,
      piePagina: piePagina,
      nombreNegocio: nombreNegocio
    });

    configuracionActual = {
      logo_base64: logoBase64Temp,
      pie_pagina: piePagina,
      nombre_negocio: nombreNegocio
    };

    modalConfig.style.display = 'none';
    alert('✅ Configuración guardada correctamente');
  } catch (error) {
    console.error('Error al guardar configuración:', error);
    alert('Error al guardar la configuración');
  }
}

// Actualizar tabla de modificadores
function actualizarTablaModificadores() {
  if (modificadores.length === 0) {
    modificadoresBody.innerHTML = '<tr><td colspan="4">No hay modificadores configurados</td></tr>';
    return;
  }

  modificadoresBody.innerHTML = modificadores.map(mod => {
    let tipoDisplay = '';
    if (mod.tipo === 'texto') {
      tipoDisplay = 'Texto libre';
    } else if (mod.tipo === 'checkbox') {
      tipoDisplay = '☑️ Checkbox (Sí/No)';
    } else {
      tipoDisplay = 'Opciones: ' + (mod.opciones || []).join(', ');
    }
    
    return `
      <tr>
        <td>${mod.nombre}</td>
        <td>${tipoDisplay}</td>
        <td>${mod.precio_adicional > 0 ? '+$' + mod.precio_adicional.toFixed(2) : 'Gratis'}</td>
        <td>
          <button class="btn-small btn-edit" data-id="${mod.id}">Editar</button>
          <button class="btn-small btn-delete" data-id="${mod.id}">Eliminar</button>
        </td>
      </tr>
    `;
  }).join('');

  document.querySelectorAll('.btn-edit').forEach(btn => {
    btn.onclick = () => editarModificador(parseInt(btn.dataset.id));
  });

  document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.onclick = () => eliminarModificador(parseInt(btn.dataset.id));
  });
}

// Guardar modificador
async function guardarModificador() {
  const nombre = modificadorNombre.value.trim();
  const tipo = modificadorTipo.value;
  let opciones = null;

  if (!nombre) {
    alert('Por favor ingrese el nombre del modificador');
    modificadorNombre.focus();
    return;
  }

  if (tipo === 'opciones' || tipo === 'checkbox') {
    if (opcionesSeleccionadas.length === 0 && tipo === 'opciones') {
      alert('Por favor seleccione al menos una opción');
      return;
    }
    // Para checkbox, las opciones son opcionales (puede ser simple sí/no)
    opciones = opcionesSeleccionadas.length > 0 ? opcionesSeleccionadas : null;
  }

  try {
    if (modificadorEditando) {
      // Actualizar modificador existente
      await window.api.actualizarModificador({
        id: modificadorEditando.id,
        nombre,
        tipo,
        opciones
      });
      alert('✅ Modificador actualizado correctamente');
    } else {
      // Crear nuevo modificador
      await window.api.crearModificador({
        nombre,
        tipo,
        opciones
      });
      alert('✅ Modificador creado correctamente');
    }

    await cargarModificadores();
    limpiarFormularioModificador();
    modalModificadores.style.display = 'none';
  } catch (error) {
    console.error('Error al guardar modificador:', error);
    alert('Error al guardar el modificador');
  }
}

// Editar modificador
async function editarModificador(id) {
  const mod = modificadores.find(m => m.id === id);
  if (!mod) return;

  modificadorEditando = mod;
  modificadorNombre.value = mod.nombre;
  modificadorTipo.value = mod.tipo;
  
  if (mod.tipo === 'opciones' && mod.opciones) {
    opcionesSeleccionadas = [...mod.opciones];
    opcionesGroup.style.display = 'block';
    await cargarOpcionesPredefinidas();
  } else {
    opcionesSeleccionadas = [];
    opcionesGroup.style.display = 'none';
  }

  document.getElementById('form-title-mod').textContent = 'Editar Modificador';
  btnGuardarModificador.textContent = 'Actualizar Modificador';
  
  setTimeout(() => modificadorNombre.focus(), 100);
}

// Eliminar modificador
async function eliminarModificador(id) {
  const mod = modificadores.find(m => m.id === id);
  if (!mod) return;

  if (confirm(`¿Está seguro de eliminar "${mod.nombre}"?`)) {
    try {
      await window.api.eliminarModificador(id);
      await cargarModificadores();
      alert('Modificador eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar modificador:', error);
      alert('Error al eliminar el modificador');
    }
  }
}

// Limpiar formulario de modificador
function limpiarFormularioModificador() {
  modificadorEditando = null;
  opcionesSeleccionadas = [];
  modificadorNombre.value = '';
  modificadorTipo.value = 'texto';
  document.getElementById('nueva-opcion-input').value = '';
  document.getElementById('nueva-opcion-precio').value = '0';
  opcionesGroup.style.display = 'none';
  document.getElementById('form-title-mod').textContent = 'Agregar Nuevo Modificador';
  btnGuardarModificador.textContent = 'Guardar Modificador';
}

// Cargar opciones predefinidas
async function cargarOpcionesPredefinidas() {
  try {
    opcionesPredefinidas = await window.api.obtenerOpcionesPredefinidas();
    mostrarOpcionesPredefinidas();
  } catch (error) {
    console.error('Error al cargar opciones predefinidas:', error);
  }
}

// Mostrar opciones predefinidas
function mostrarOpcionesPredefinidas() {
  const container = document.getElementById('opciones-disponibles-list');
  
  if (!opcionesPredefinidas || opcionesPredefinidas.length === 0) {
    container.innerHTML = '<p style="color: #999; text-align: center; padding: 20px 10px; margin: 0;">No hay opciones creadas.<br>Agrega nuevas opciones abajo.</p>';
    return;
  }

  container.innerHTML = opcionesPredefinidas.map(op => {
    const seleccionada = opcionesSeleccionadas.includes(op.nombre);
    const precio = op.precio_adicional || 0;
    return `
      <div class="opcion-item" style="display: flex; align-items: center; gap: 8px; padding: 8px; border-bottom: 1px solid #f0f0f0; transition: background 0.2s;" onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='white'">
        <input type="checkbox" 
          class="opcion-checkbox"
          id="opt-${op.id}" 
          data-nombre="${op.nombre}"
          ${seleccionada ? 'checked' : ''}
          style="width: 18px; height: 18px; margin: 0; cursor: pointer;">
        <label for="opt-${op.id}" style="flex: 1; margin: 0; cursor: pointer; font-size: 14px; color: #333;">${op.nombre}</label>
        <span style="font-size: 13px; color: #666; margin-right: 5px;">$</span>
        <input type="number" 
          class="precio-opcion-input" 
          data-id="${op.id}" 
          value="${precio}" 
          step="0.01" 
          min="0" 
          style="width: 70px; padding: 4px 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px; text-align: right;">
        <button type="button" class="btn-eliminar-opcion" data-id="${op.id}" data-nombre="${op.nombre}" style="background: #dc3545; color: white; border: none; border-radius: 4px; padding: 4px 10px; cursor: pointer; font-size: 12px;">🗑️</button>
      </div>
    `;
  }).join('');

  // Agregar eventos a los checkboxes
  document.querySelectorAll('.opcion-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      const nombre = this.dataset.nombre;
      if (this.checked) {
        if (!opcionesSeleccionadas.includes(nombre)) {
          opcionesSeleccionadas.push(nombre);
        }
      } else {
        const index = opcionesSeleccionadas.indexOf(nombre);
        if (index > -1) {
          opcionesSeleccionadas.splice(index, 1);
        }
      }
      console.log('Opciones seleccionadas:', opcionesSeleccionadas);
    });
  });

  // Agregar eventos a inputs de precio
  document.querySelectorAll('.precio-opcion-input').forEach(input => {
    input.addEventListener('change', async function() {
      const id = parseInt(this.dataset.id);
      const precio = parseFloat(this.value) || 0;
      try {
        await window.api.actualizarPrecioOpcion(id, precio);
        await cargarOpcionesPredefinidas();
        console.log('✅ Precio actualizado');
      } catch (error) {
        alert('Error al actualizar el precio');
        console.error('Error:', error);
      }
    });
  });

  // Agregar eventos a botones de eliminar
  document.querySelectorAll('.btn-eliminar-opcion').forEach(btn => {
    btn.addEventListener('click', async function() {
      const id = parseInt(this.dataset.id);
      const nombre = this.dataset.nombre;
      if (confirm(`¿Eliminar la opción "${nombre}"?`)) {
        try {
          await window.api.eliminarOpcionPredefinida(id);
          await cargarOpcionesPredefinidas();
          const index = opcionesSeleccionadas.indexOf(nombre);
          if (index > -1) {
            opcionesSeleccionadas.splice(index, 1);
          }
        } catch (error) {
          alert('Error al eliminar la opción');
          console.error('Error:', error);
        }
      }
    });
  });
}



// Agregar nueva opción predefinida
async function agregarNuevaOpcion() {
  const inputNombre = document.getElementById('nueva-opcion-input');
  const inputPrecio = document.getElementById('nueva-opcion-precio');
  const nombre = inputNombre.value.trim();
  const precio = parseFloat(inputPrecio.value) || 0;
  
  if (!nombre) {
    alert('⚠️ Por favor ingrese el nombre de la opción');
    inputNombre.focus();
    return;
  }

  try {
    await window.api.crearOpcionPredefinida(nombre, precio);
    await cargarOpcionesPredefinidas();
    
    // Auto-seleccionar la opción recién creada
    if (!opcionesSeleccionadas.includes(nombre)) {
      opcionesSeleccionadas.push(nombre);
    }
    
    mostrarOpcionesPredefinidas();
    inputNombre.value = '';
    inputPrecio.value = '0';
    inputNombre.focus();
    
    console.log('✅ Opción creada:', nombre, 'Precio:', precio);
  } catch (error) {
    if (error.message && error.message.includes('UNIQUE')) {
      alert('⚠️ Esta opción ya existe');
    } else {
      alert('❌ Error al crear la opción');
    }
    console.error('Error al crear opción:', error);
  }
}

// ==================== DETECTOR DE CÓDIGO DE BARRAS ====================

// Configurar detector global de código de barras
function configurarDetectorCodigoBarras() {
  console.log('🔍 Detector de código de barras activado');
  
  // Cerrar modal
  btnCerrarModalBarcode.addEventListener('click', () => {
    modalCodigoBarras.style.display = 'none';
    productoEscaneado = null;
    devolverFocoABusqueda();
  });

  // Detector global de escaneo rápido
  document.addEventListener('keypress', (e) => {
    // Ignorar si estamos en un input/textarea (excepto el buscador)
    const target = e.target;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      if (target.id !== 'producto-buscar') {
        return;
      }
    }

    // Acumular caracteres
    barcodeScanBuffer += e.key;

    // Limpiar timeout anterior
    if (barcodeScanTimeout) {
      clearTimeout(barcodeScanTimeout);
    }

    // Esperar 100ms de inactividad para procesar
    barcodeScanTimeout = setTimeout(() => {
      if (barcodeScanBuffer.length >= 4) {
        procesarCodigoBarras(barcodeScanBuffer);
      }
      barcodeScanBuffer = '';
    }, 100);
  });
}

// Procesar código de barras escaneado
async function procesarCodigoBarras(codigo) {
  console.log('📊 Código detectado:', codigo);
  
  try {
    const producto = await window.api.buscarPorCodigoBarras(codigo);
    mostrarModalCodigoBarras(codigo, producto);
  } catch (error) {
    console.error('Error al buscar código:', error);
  }
}

// Mostrar modal con opciones
function mostrarModalCodigoBarras(codigo, producto) {
  barcodeEscaneado.textContent = codigo;
  productoEscaneado = producto;

  if (producto) {
    // Producto existe
    barcodeProductoInfo.style.display = 'block';
    barcodeProductoNoexiste.style.display = 'none';
    barcodeProductoNombre.textContent = producto.nombre;
    barcodeProductoPrecio.textContent = `Precio: $${producto.precio.toFixed(2)}`;

    barcodeActions.innerHTML = `
      <button onclick="agregarProductoEscaneado()" class="btn-primary" style="flex: 1;">
        ➕ Agregar al Ticket
      </button>
      <button onclick="editarProductoEscaneado()" class="btn-secondary" style="flex: 1;">
        ✏️ Editar
      </button>
      <button onclick="eliminarProductoEscaneado()" class="btn-danger">
        🗑️ Eliminar
      </button>
    `;
  } else {
    // Producto no existe
    barcodeProductoInfo.style.display = 'none';
    barcodeProductoNoexiste.style.display = 'block';

    barcodeActions.innerHTML = `
      <button onclick="crearProductoConCodigo()" class="btn-primary" style="flex: 1;">
        ➕ Crear Nuevo Producto
      </button>
      <button onclick="cerrarModalBarcode()" class="btn-secondary">
        Cancelar
      </button>
    `;
  }

  modalCodigoBarras.style.display = 'flex';
}

// Agregar producto escaneado al ticket
window.agregarProductoEscaneado = function() {
  if (!productoEscaneado) return;
  
  seleccionarProducto(productoEscaneado.id);
  modalCodigoBarras.style.display = 'none';
  
  // Ir directo a cantidad si no hay modificadores
  if (modificadores.length === 0) {
    setTimeout(() => {
      cantidadInput.focus();
      cantidadInput.select();
    }, 100);
  } else {
    devolverFocoABusqueda();
  }
};

// Editar producto escaneado
window.editarProductoEscaneado = function() {
  if (!productoEscaneado) return;
  
  modalCodigoBarras.style.display = 'none';
  modal.style.display = 'flex';
  editarProducto(productoEscaneado.id);
  // No llamar devolverFocoABusqueda aquí porque se abre otro modal
};

// Eliminar producto escaneado
window.eliminarProductoEscaneado = async function() {
  if (!productoEscaneado) return;
  
  if (confirm(`¿Está seguro de eliminar "${productoEscaneado.nombre}"?\n\nEsto eliminará el producto de forma permanente.`)) {
    try {
      await window.api.eliminarProducto(productoEscaneado.id);
      await cargarProductos();
      modalCodigoBarras.style.display = 'none';
      alert('✅ Producto eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert('❌ Error al eliminar el producto');
    }
  }
};

// Crear producto con código de barras
window.crearProductoConCodigo = function() {
  const codigo = barcodeEscaneado.textContent;
  
  modalCodigoBarras.style.display = 'none';
  modal.style.display = 'flex';
  limpiarFormularioProducto();
  
  // Pre-cargar el código de barras
  productoCodigoBarras.value = codigo;
  
  setTimeout(() => {
    productoNombre.focus();
  }, 100);
};

// Cerrar modal
window.cerrarModalBarcode = function() {
  modalCodigoBarras.style.display = 'none';
  productoEscaneado = null;
};

// ========== GESTIÓN DE MODIFICADORES POR PRODUCTO ==========

// Abrir modal para gestionar modificadores de un producto
async function gestionarModificadoresProducto(productoId) {
  const producto = productos.find(p => p.id === productoId);
  if (!producto) return;

  productoIdParaModificadores = productoId;
  productoModsNombre.textContent = producto.nombre;

  // Cargar todos los modificadores disponibles
  const todosModificadores = await window.api.obtenerModificadores();
  
  // Cargar modificadores actuales del producto
  const modificadoresProducto = await window.api.obtenerModificadoresProducto(productoId);

  // Renderizar checklist
  listaModificadoresDisponibles.innerHTML = todosModificadores.map(mod => {
    const checked = modificadoresProducto.includes(mod.id) ? 'checked' : '';
    return `
      <div class="modificador-check-item">
        <input type="checkbox" id="check-mod-${mod.id}" value="${mod.id}" ${checked}>
        <label for="check-mod-${mod.id}">
          <strong>${mod.nombre}</strong>
          <span style="color: #666; font-size: 13px;">(${mod.tipo}${mod.precio_adicional > 0 ? ' +$' + mod.precio_adicional.toFixed(2) : ''})</span>
        </label>
      </div>
    `;
  }).join('');

  modalProductoModificadores.style.display = 'flex';
}

// Guardar modificadores del producto
async function guardarModificadoresProducto() {
  const checkboxes = listaModificadoresDisponibles.querySelectorAll('input[type="checkbox"]:checked');
  const modificadorIds = Array.from(checkboxes).map(cb => parseInt(cb.value));

  await window.api.guardarModificadoresProducto({
    productoId: productoIdParaModificadores,
    modificadorIds
  });

  alert(`✅ Modificadores actualizados para el producto`);
  modalProductoModificadores.style.display = 'none';
  productoIdParaModificadores = null;
  devolverFocoABusqueda();
}

// Configurar eventos del modal de modificadores por producto
btnCerrarModalProductoMods.addEventListener('click', () => {
  modalProductoModificadores.style.display = 'none';
  productoIdParaModificadores = null;
  devolverFocoABusqueda();
});

btnCancelarProductoMods.addEventListener('click', () => {
  modalProductoModificadores.style.display = 'none';
  productoIdParaModificadores = null;
  devolverFocoABusqueda();
});

btnGuardarProductoMods.addEventListener('click', guardarModificadoresProducto);

// Iniciar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', init);
