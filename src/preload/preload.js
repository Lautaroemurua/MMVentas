const { contextBridge, ipcRenderer } = require('electron');

// Exponer API segura al renderer
contextBridge.exposeInMainWorld('api', {
  // Productos
  obtenerProductos: () => ipcRenderer.invoke('obtener-productos'),
  crearProducto: (producto) => ipcRenderer.invoke('crear-producto', producto),
  actualizarProducto: (producto) => ipcRenderer.invoke('actualizar-producto', producto),
  eliminarProducto: (id) => ipcRenderer.invoke('eliminar-producto', id),
  buscarPorCodigoBarras: (codigo) => ipcRenderer.invoke('buscar-por-codigo-barras', codigo),

  // Ventas
  guardarVenta: (venta) => ipcRenderer.invoke('guardar-venta', venta),
  obtenerVentas: () => ipcRenderer.invoke('obtener-ventas'),
  obtenerVenta: (id) => ipcRenderer.invoke('obtener-venta', id),

  // Imprimir
  imprimirTicket: (data) => ipcRenderer.invoke('imprimir-ticket', data),

  // Licencia
  activarSistema: (codigo) => ipcRenderer.invoke('activar-sistema', codigo),
  obtenerSystemId: () => ipcRenderer.invoke('obtener-system-id'),
  obtenerInfoTrial: () => ipcRenderer.invoke('obtener-info-trial'),

  // Configuración
  obtenerConfiguracion: () => ipcRenderer.invoke('obtener-configuracion'),
  guardarConfiguracion: (config) => ipcRenderer.invoke('guardar-configuracion', config),

  // Modificadores
  obtenerModificadores: () => ipcRenderer.invoke('obtener-modificadores'),
  crearModificador: (modificador) => ipcRenderer.invoke('crear-modificador', modificador),
  actualizarModificador: (modificador) => ipcRenderer.invoke('actualizar-modificador', modificador),
  eliminarModificador: (id) => ipcRenderer.invoke('eliminar-modificador', id),

  // Opciones Predefinidas
  obtenerOpcionesPredefinidas: () => ipcRenderer.invoke('obtener-opciones-predefinidas'),
  crearOpcionPredefinida: (nombre, precio) => ipcRenderer.invoke('crear-opcion-predefinida', nombre, precio),
  eliminarOpcionPredefinida: (id) => ipcRenderer.invoke('eliminar-opcion-predefinida', id),
  actualizarPrecioOpcion: (id, precio) => ipcRenderer.invoke('actualizar-precio-opcion', id, precio),

  // Producto-Modificadores
  obtenerModificadoresProducto: (productoId) => ipcRenderer.invoke('obtener-modificadores-producto', productoId),
  guardarModificadoresProducto: (data) => ipcRenderer.invoke('guardar-modificadores-producto', data)
  lkea
});
