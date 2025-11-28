# MMVentas - Sistema de Punto de Venta

Sistema de ventas profesional desarrollado con Electron, SQLite y JavaScript vanilla. Diseñado para pequeños y medianos comercios con impresión de tickets térmicos.

## 🚀 Características

- ✅ **Gestión de Productos** - CRUD completo con búsqueda en tiempo real
- ✅ **Sistema de Ventas** - Interfaz rápida optimizada para cajeros
- ✅ **Modificadores Genéricos** - Personalización de items (sin lechuga, tamaño 5L, etc.)
- ✅ **Impresión Térmica** - Tickets personalizados para impresoras de 80mm
- ✅ **Configuración Personalizable** - Logo y pie de página customizable
- ✅ **Base de Datos SQLite** - Persistencia local y rápida
- ✅ **Sistema de Licencias** - Validación online contra GitHub
- ✅ **Trial de 24 horas** - Sistema de prueba automático
- ✅ **Historial de Ventas** - Registro completo con reimpresión

## 📋 Requisitos

- Node.js 16 o superior
- Windows 10/11 (compatible con macOS y Linux con ajustes)
- Impresora térmica USB de 80mm (opcional)

## 🔧 Instalación

```bash
# Clonar el repositorio
git clone https://github.com/TU_USUARIO/MMVentas.git
cd MMVentas

# Instalar dependencias
npm install

# Compilar módulos nativos para Electron
npx electron-rebuild

# Ejecutar en modo desarrollo
npm start
```

## 📦 Estructura del Proyecto

```
MMVentas/
├── src/
│   ├── main/
│   │   ├── main.js          # Proceso principal de Electron
│   │   └── license.js       # Sistema de licencias
│   ├── preload/
│   │   └── preload.js       # Script de contexto seguro
│   └── renderer/
│       ├── index.html       # Interfaz principal
│       ├── activation.html  # Ventana de activación
│       ├── renderer.js      # Lógica de UI
│       └── styles.css       # Estilos
├── GENERADOR_LICENCIAS_V2.html  # Generador de códigos (interno)
├── package.json
└── README.md
```

## 🎯 Uso

### Para Clientes

1. **Primera ejecución**: El sistema inicia automáticamente un trial de 24 horas
2. **Configurar negocio**: Click en "⚙️ Configuración" para personalizar logo y datos
3. **Configurar modificadores**: Click en "📝 Modificadores" para crear opciones personalizables
   - Ver guía completa: `MODIFICADORES-GUIA.md`
4. **Agregar productos**: Click en "Gestionar Productos" para crear tu catálogo
5. **Realizar ventas**: Buscar producto, personalizar con modificadores, agregar al ticket
6. **Finalizar venta**: Click en "Finalizar e Imprimir" para generar el ticket

### Para Administradores

Ver documentación completa en `LICENCIAS-README.md`

## 🔐 Sistema de Licencias

El sistema implementa validación online de licencias mediante GitHub:

- Trial automático de 24 horas
- Validación contra repositorio privado
- Códigos únicos por sistema
- Control remoto de activaciones
- Imposible de piratear o hacer ingeniería inversa

## 🖨️ Configuración de Impresora

El sistema está optimizado para impresoras térmicas de 80mm:

1. Conectar impresora USB
2. Instalar drivers del fabricante
3. Configurar como impresora predeterminada (opcional)
4. El sistema detectará automáticamente la impresora al imprimir

## 🛠️ Scripts de Desarrollo

```bash
npm start              # Ejecutar aplicación
npm run dev            # Ejecutar con DevTools
npm run test-license   # Probar sistema de licencias
npm run force-expire   # Simular trial expirado
npm run reset-license  # Resetear licencias para pruebas
```

## 📝 Personalización

### Logo y Marca

1. Abrir aplicación
2. Click en "⚙️ Configuración"
3. Subir logo (máx 500KB, formato PNG/JPG)
4. Configurar nombre y pie de página
5. Guardar

### Productos

- ID automático
- Nombre descriptivo
- Precio unitario
- Campo stock preparado para futuras versiones

## 🚧 Desarrollo Futuro

- [ ] Control de stock e inventario
- [ ] Reportes y estadísticas
- [ ] Múltiples usuarios/cajeros
- [ ] Backup automático en la nube
- [ ] Aplicación móvil complementaria
- [ ] Integración con medios de pago

## 🐛 Solución de Problemas

### Error al iniciar
```bash
# Recompilar módulos nativos
npx electron-rebuild
```

### Impresora no detectada
- Verificar conexión USB
- Instalar drivers oficiales
- Probar impresión desde Windows

### Base de datos corrupta
```bash
# Ubicación: C:\Users\USUARIO\AppData\Roaming\mmventas\ventas.db
# Eliminar el archivo para resetear (perderás los datos)
```

## 📄 Licencia

Copyright © 2025 MMVentas. Todos los derechos reservados.

Sistema propietario de uso comercial. No redistribuir sin autorización.

## 📞 Soporte

- Email: moralesleandro21@gmail.com
- Email: lautaroemurua@gmail.com

## 🙏 Créditos

Desarrollado con ❤️ usando:
- [Electron](https://www.electronjs.org/)
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)
- JavaScript ES6+
