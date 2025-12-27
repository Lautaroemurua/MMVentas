// Cargar variables de entorno desde .env
require('dotenv').config();

const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const Database = require('better-sqlite3');
const license = require('./license');

// Suprimir advertencias de caché de GPU (no afectan funcionalidad)
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');

let mainWindow;
let db;
let licenseStatus = null;

// Inicializar base de datos
function initDatabase() {
  const dbPath = path.join(app.getPath('userData'), 'ventas.db');
  db = new Database(dbPath);

  // Crear tabla de productos
  db.exec(`
    CREATE TABLE IF NOT EXISTS productos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      precio REAL NOT NULL,
      stock INTEGER DEFAULT NULL,
      codigo_barras TEXT DEFAULT NULL
    )
  `);

  // Agregar columna codigo_barras si no existe (para bases de datos existentes)
  try {
    db.exec(`ALTER TABLE productos ADD COLUMN codigo_barras TEXT DEFAULT NULL`);
  } catch (e) {
    // Columna ya existe, ignorar error
  }

  // Crear tabla de ventas
  db.exec(`
    CREATE TABLE IF NOT EXISTS ventas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fecha TEXT NOT NULL,
      items TEXT NOT NULL,
      total REAL NOT NULL
    )
  `);

  // Crear tabla de configuración
  db.exec(`
    CREATE TABLE IF NOT EXISTS configuracion (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      logo_base64 TEXT,
      pie_pagina TEXT DEFAULT '¡Gracias por su compra!',
      nombre_negocio TEXT DEFAULT 'Mi Negocio'
    )
  `);

  // Crear tabla de modificadores
  db.exec(`
    CREATE TABLE IF NOT EXISTS modificadores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      tipo TEXT NOT NULL DEFAULT 'texto',
      opciones TEXT,
      precio_adicional REAL DEFAULT 0,
      activo INTEGER DEFAULT 1
    )
  `);

  // Crear tabla de opciones predefinidas
  db.exec(`
    CREATE TABLE IF NOT EXISTS opciones_predefinidas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL UNIQUE,
      precio_adicional REAL DEFAULT 0,
      activo INTEGER DEFAULT 1
    )
  `);

  // Agregar columna precio_adicional si no existe (para bases de datos existentes)
  try {
    db.exec(`ALTER TABLE opciones_predefinidas ADD COLUMN precio_adicional REAL DEFAULT 0`);
  } catch (e) {
    // Columna ya existe, ignorar error
  }

  // Crear tabla de relación producto-modificadores
  db.exec(`
    CREATE TABLE IF NOT EXISTS producto_modificadores (
      producto_id INTEGER NOT NULL,
      modificador_id INTEGER NOT NULL,
      PRIMARY KEY (producto_id, modificador_id),
      FOREIGN KEY (producto_id) REFERENCES productos(id),
      FOREIGN KEY (modificador_id) REFERENCES modificadores(id)
    )
  `);

  // Insertar configuración por defecto si no existe
  const configCount = db.prepare('SELECT COUNT(*) as count FROM configuracion').get();
  if (configCount.count === 0) {
    db.prepare('INSERT INTO configuracion (id, pie_pagina, nombre_negocio) VALUES (1, ?, ?)').run(
      '¡Gracias por su compra!',
      'Mi Negocio'
    );
  }

  // Insertar productos de ejemplo si no existen
  const count = db.prepare('SELECT COUNT(*) as count FROM productos').get();
  if (count.count === 0) {
    const insert = db.prepare('INSERT INTO productos (nombre, precio) VALUES (?, ?)');
    insert.run('Producto Ejemplo 1', 100.00);
    insert.run('Producto Ejemplo 2', 250.50);
    insert.run('Producto Ejemplo 3', 75.00);
  }
}

async function checkAndShowLicense() {
  licenseStatus = license.checkLicense();

  if (!licenseStatus.valid) {
    if (licenseStatus.expired) {
      // Trial expirado - notificar
      await license.notifyExpiration(licenseStatus.systemId);
      
      await dialog.showMessageBox({
        type: 'warning',
        title: 'Período de prueba finalizado',
        message: 'El período de prueba de 24 horas ha finalizado',
        detail: 'Por favor contacte al soporte para activar el sistema.\n\nID del Sistema: ' + licenseStatus.systemId,
        buttons: ['Ingresar Código', 'Salir']
      }).then(async (result) => {
        if (result.response === 0) {
          // Mostrar diálogo de activación
          await showActivationDialog();
        } else {
          app.quit();
        }
      });
    } else {
      app.quit();
    }
  } else if (licenseStatus.trial) {
    // En trial - mostrar tiempo restante en consola solo
    const hoursRemaining = Math.floor(licenseStatus.remaining / (1000 * 60 * 60));
    console.log(`Trial activo. Horas restantes: ${hoursRemaining}`);
  }
}

async function showActivationDialog() {
  const { dialog } = require('electron');
  
  const result = await dialog.showMessageBox({
    type: 'info',
    title: 'Activar Sistema',
    message: 'Ingrese el código de activación',
    detail: 'ID del Sistema: ' + licenseStatus.systemId + '\n\nContacte a soporte con este ID para obtener su código.',
    buttons: ['Cancelar', 'Activar'],
    defaultId: 1,
    cancelId: 0
  });

  if (result.response === 1) {
    // Solicitar código
    const { BrowserWindow } = require('electron');
    const activationWindow = new BrowserWindow({
      width: 450,
      height: 300,
      modal: true,
      parent: mainWindow,
      webPreferences: {
        preload: path.join(__dirname, '../preload/preload.js'),
        contextIsolation: true,
        nodeIntegration: false
      }
    });

    activationWindow.loadFile(path.join(__dirname, '../renderer/activation.html'));
    
    // Cuando se cierre la ventana de activación, revisar estado
    activationWindow.on('closed', () => {
      licenseStatus = license.checkLicense();
      if (licenseStatus && licenseStatus.valid && !licenseStatus.trial) {
        // Activado exitosamente - iniciar app
        initDatabase();
        createWindow();
      } else {
        // No activado - salir
        app.quit();
      }
    });
  } else {
    app.quit();
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 600,
    minHeight: 400,
    resizable: true,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // Ocultar la barra de menú
  mainWindow.setMenuBarVisibility(false);

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  // Abrir DevTools en modo desarrollo
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }
}

// Configurar auto-updater
autoUpdater.autoDownload = false;

autoUpdater.on('update-available', (info) => {
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Actualización disponible',
    message: `Nueva versión ${info.version} disponible`,
    detail: '¿Desea descargar e instalar la actualización?',
    buttons: ['Descargar', 'Más tarde']
  }).then((result) => {
    if (result.response === 0) {
      autoUpdater.downloadUpdate();
    }
  });
});

autoUpdater.on('download-progress', (progress) => {
  const percent = Math.round(progress.percent);
  mainWindow.setProgressBar(percent / 100);
});

autoUpdater.on('update-downloaded', () => {
  mainWindow.setProgressBar(-1);
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Actualización lista',
    message: 'La actualización se instalará ahora. La aplicación se reiniciará automáticamente.',
    buttons: ['Instalar y reiniciar']
  }).then(() => {
    // Forzar instalación inmediata con NSIS
    setImmediate(() => {
      autoUpdater.quitAndInstall(true, true);
    });
  });
});

// Eventos de la aplicación
app.whenReady().then(async () => {
  await checkAndShowLicense();
  
  if (licenseStatus && licenseStatus.valid) {
    initDatabase();
    createWindow();
    
    // Verificar actualizaciones después de 3 segundos
    setTimeout(() => {
      autoUpdater.checkForUpdates();
    }, 3000);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (db) {
      db.close();
    }
    app.quit();
  }
});

app.on('before-quit', () => {
  if (db) {
    db.close();
  }
});

// IPC Handlers - Productos
ipcMain.handle('obtener-productos', () => {
  const productos = db.prepare('SELECT * FROM productos ORDER BY nombre').all();
  return productos;
});

ipcMain.handle('crear-producto', (event, { nombre, precio, codigoBarras }) => {
  const insert = db.prepare('INSERT INTO productos (nombre, precio, codigo_barras) VALUES (?, ?, ?)');
  const result = insert.run(nombre, precio, codigoBarras || null);
  return { id: result.lastInsertRowid, nombre, precio, stock: null, codigo_barras: codigoBarras || null };
});

ipcMain.handle('actualizar-producto', (event, { id, nombre, precio, codigoBarras }) => {
  const update = db.prepare('UPDATE productos SET nombre = ?, precio = ?, codigo_barras = ? WHERE id = ?');
  update.run(nombre, precio, codigoBarras || null, id);
  return { id, nombre, precio, codigo_barras: codigoBarras || null };
});

ipcMain.handle('eliminar-producto', (event, id) => {
  const del = db.prepare('DELETE FROM productos WHERE id = ?');
  del.run(id);
  return { success: true };
});

// IPC Handlers - Ventas
ipcMain.handle('guardar-venta', (event, { items, total }) => {
  const fecha = new Date().toLocaleString('es-ES', { 
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false 
  });
  const itemsJson = JSON.stringify(items);
  const insert = db.prepare('INSERT INTO ventas (fecha, items, total) VALUES (?, ?, ?)');
  const result = insert.run(fecha, itemsJson, total);
  return { 
    id: result.lastInsertRowid, 
    fecha, 
    items, 
    total 
  };
});

ipcMain.handle('obtener-ventas', () => {
  const ventas = db.prepare('SELECT * FROM ventas ORDER BY fecha DESC LIMIT 100').all();
  return ventas.map(venta => ({
    ...venta,
    items: JSON.parse(venta.items)
  }));
});

ipcMain.handle('obtener-venta', (event, id) => {
  const venta = db.prepare('SELECT * FROM ventas WHERE id = ?').get(id);
  if (venta) {
    venta.items = JSON.parse(venta.items);
  }
  return venta;
});

// IPC Handler - Imprimir
ipcMain.handle('imprimir-ticket', (event, { venta }) => {
  const printWindow = new BrowserWindow({
    width: 302,
    height: 800,
    show: false,
    webPreferences: {
      nodeIntegration: false
    }
  });

  // Obtener configuración para el ticket
  const config = db.prepare('SELECT * FROM configuracion WHERE id = 1').get();
  const nombreNegocio = config?.nombre_negocio || 'Mi Negocio';
  const piePagina = config?.pie_pagina || '¡Gracias por su compra!';
  const logoBase64 = config?.logo_base64 || null;

  // La fecha ya viene en formato español desde el backend
  const fecha = venta.fecha;
  
  const itemsHtml = venta.items.map(item => {
    const subtotal = item.cantidad * item.precio;
    const modificadoresHtml = item.modificadores ? 
      '<tr><td colspan="3" style="font-size: 9px; padding-left: 10px;">' + 
      Object.values(item.modificadores).map(m => `* ${m.nombre}: ${m.valor}`).join('<br>') + 
      '</td></tr>' : '';
    
    return `
      <tr>
        <td colspan="3" class="producto-nombre">${item.nombre}</td>
      </tr>
      ${modificadoresHtml}
      <tr>
        <td>${item.cantidad} x $${item.precio.toFixed(2)}</td>
        <td></td>
        <td class="align-right">$${subtotal.toFixed(2)}</td>
      </tr>
    `;
  }).join('');

  const ticketHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        @page {
          size: 80mm auto;
          margin: 0;
        }
        
        body {
          font-family: 'Courier New', 'Consolas', monospace;
          font-size: 11px;
          margin: 0;
          padding: 5mm;
          width: 80mm;
          background: white;
        }
        
        .ticket-header {
          text-align: center;
          border-bottom: 2px dashed #000;
          padding-bottom: 8px;
          margin-bottom: 8px;
        }
        
        h1 {
          font-size: 18px;
          font-weight: bold;
          margin: 5px 0;
          letter-spacing: 1px;
        }
        
        .info {
          text-align: center;
          margin: 8px 0;
          font-size: 10px;
        }
        
        .info-line {
          margin: 3px 0;
        }
        
        .separator {
          border-bottom: 1px dashed #000;
          margin: 8px 0;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 8px 0;
        }
        
        td {
          padding: 2px 0;
          vertical-align: top;
        }
        
        .producto-nombre {
          font-weight: bold;
          padding-top: 6px;
        }
        
        .align-right {
          text-align: right;
        }
        
        .totales {
          border-top: 2px solid #000;
          margin-top: 10px;
          padding-top: 8px;
        }
        
        .total-row {
          display: flex;
          justify-content: space-between;
          margin: 5px 0;
          font-size: 12px;
        }
        
        .total-final {
          font-size: 16px;
          font-weight: bold;
          border-top: 2px solid #000;
          padding-top: 8px;
          margin-top: 8px;
        }
        
        .footer {
          text-align: center;
          margin-top: 15px;
          padding-top: 10px;
          border-top: 2px dashed #000;
          font-size: 10px;
        }
        
        .gracias {
          font-weight: bold;
          margin: 8px 0;
        }
      </style>
    </head>
    <body>
      <div class="ticket-header">
        ${logoBase64 ? `<img src="${logoBase64}" alt="Logo" style="max-width: 60mm; max-height: 30mm; margin-bottom: 8px;">` : ''}
        <h1>${nombreNegocio.toUpperCase()}</h1>
        <div style="font-size: 10px; margin-top: 5px;">TICKET DE VENTA</div>
      </div>
      
      <div class="info">
        <div class="info-line"><strong>Ticket #${String(venta.id).padStart(6, '0')}</strong></div>
        <div class="info-line">${fecha}</div>
      </div>
      
      <div class="separator"></div>
      
      <table>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      
      <div class="totales">
        <div class="total-row">
          <span>Items:</span>
          <span>${venta.items.reduce((sum, item) => sum + item.cantidad, 0)}</span>
        </div>
        <div class="total-row total-final">
          <span>TOTAL:</span>
          <span>$${venta.total.toFixed(2)}</span>
        </div>
      </div>
      
      <div class="footer">
        <div class="gracias">${piePagina.toUpperCase()}</div>
        <div>${nombreNegocio}</div>
      </div>
    </body>
    </html>
  `;

  printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(ticketHtml)}`);

  return new Promise((resolve, reject) => {
    printWindow.webContents.on('did-finish-load', () => {
      printWindow.webContents.print({
        silent: false,
        printBackground: true,
        pageSize: {
          width: 80000,  // 80mm en micrones
          height: 297000 // Altura automática (A4 como máximo)
        },
        margins: {
          marginType: 'none'
        }
      }, (success, errorType) => {
        if (!success) {
          console.error('Error al imprimir:', errorType);
        }
        printWindow.close();
        resolve({ success: success, error: errorType });
      });
    });
  });
});

// IPC Handlers - Licencia
ipcMain.handle('activar-sistema', async (event, codigo) => {
  const result = license.activateLicense(codigo);
  if (result.success) {
    licenseStatus = license.checkLicense();
  }
  return result;
});

ipcMain.handle('obtener-system-id', () => {
  return license.getSystemId();
});

ipcMain.handle('obtener-info-trial', () => {
  return license.getTrialInfo();
});

// IPC Handlers - Configuración
ipcMain.handle('obtener-configuracion', () => {
  const config = db.prepare('SELECT * FROM configuracion WHERE id = 1').get();
  return config || { logo_base64: null, pie_pagina: '¡Gracias por su compra!', nombre_negocio: 'Mi Negocio' };
});

ipcMain.handle('guardar-configuracion', (event, { logoBase64, piePagina, nombreNegocio }) => {
  const update = db.prepare(`
    UPDATE configuracion 
    SET logo_base64 = ?, pie_pagina = ?, nombre_negocio = ? 
    WHERE id = 1
  `);
  update.run(logoBase64, piePagina, nombreNegocio);
  return { success: true };
});

// IPC Handlers - Modificadores
ipcMain.handle('obtener-modificadores', (event, productoId) => {
  let modificadores;
  
  if (productoId) {
    // Obtener solo los modificadores activos para este producto
    modificadores = db.prepare(`
      SELECT m.* FROM modificadores m
      INNER JOIN producto_modificadores pm ON m.id = pm.modificador_id
      WHERE m.activo = 1 AND pm.producto_id = ?
      ORDER BY m.nombre
    `).all(productoId);
  } else {
    // Obtener todos los modificadores activos (para gestión)
    modificadores = db.prepare('SELECT * FROM modificadores WHERE activo = 1 ORDER BY nombre').all();
  }
  
  return modificadores.map(m => ({
    ...m,
    opciones: m.opciones ? JSON.parse(m.opciones) : null
  }));
});

ipcMain.handle('crear-modificador', (event, { nombre, tipo, opciones, precioAdicional }) => {
  const insert = db.prepare('INSERT INTO modificadores (nombre, tipo, opciones, precio_adicional) VALUES (?, ?, ?, ?)');
  const result = insert.run(nombre, tipo, opciones ? JSON.stringify(opciones) : null, precioAdicional || 0);
  return { id: result.lastInsertRowid, nombre, tipo, opciones, precio_adicional: precioAdicional };
});

ipcMain.handle('actualizar-modificador', (event, { id, nombre, tipo, opciones, precioAdicional }) => {
  const update = db.prepare('UPDATE modificadores SET nombre = ?, tipo = ?, opciones = ?, precio_adicional = ? WHERE id = ?');
  update.run(nombre, tipo, opciones ? JSON.stringify(opciones) : null, precioAdicional || 0, id);
  return { success: true };
});

ipcMain.handle('eliminar-modificador', (event, id) => {
  const update = db.prepare('UPDATE modificadores SET activo = 0 WHERE id = ?');
  update.run(id);
  return { success: true };
});

// IPC Handlers - Opciones Predefinidas
ipcMain.handle('obtener-opciones-predefinidas', () => {
  const opciones = db.prepare('SELECT id, nombre, precio_adicional, activo FROM opciones_predefinidas WHERE activo = 1 ORDER BY nombre').all();
  return opciones;
});

ipcMain.handle('crear-opcion-predefinida', (event, nombre, precio) => {
  const precioFinal = precio || 0;
  const insert = db.prepare('INSERT INTO opciones_predefinidas (nombre, precio_adicional) VALUES (?, ?)');
  const result = insert.run(nombre, precioFinal);
  return { id: result.lastInsertRowid, nombre, precio_adicional: precioFinal };
});

ipcMain.handle('eliminar-opcion-predefinida', (event, id) => {
  const update = db.prepare('UPDATE opciones_predefinidas SET activo = 0 WHERE id = ?');
  update.run(id);
  return { success: true };
});

ipcMain.handle('actualizar-precio-opcion', (event, id, precio) => {
  const update = db.prepare('UPDATE opciones_predefinidas SET precio_adicional = ? WHERE id = ?');
  update.run(precio, id);
  return { success: true };
});

// IPC Handlers - Producto-Modificadores
ipcMain.handle('obtener-modificadores-producto', (event, productoId) => {
  const modsProd = db.prepare(`
    SELECT modificador_id FROM producto_modificadores WHERE producto_id = ?
  `).all(productoId);
  return modsProd.map(m => m.modificador_id);
});

ipcMain.handle('guardar-modificadores-producto', (event, { productoId, modificadorIds }) => {
  // Eliminar todas las relaciones existentes
  db.prepare('DELETE FROM producto_modificadores WHERE producto_id = ?').run(productoId);
  
  // Insertar las nuevas relaciones
  const insert = db.prepare('INSERT INTO producto_modificadores (producto_id, modificador_id) VALUES (?, ?)');
  modificadorIds.forEach(modId => {
    insert.run(productoId, modId);
  });
  
  return { success: true };
});
