# Sistema de Actualizaciones Automáticas

## Configuración Completa

El sistema ya tiene actualizaciones automáticas configuradas con `electron-updater`.

### ¿Cómo funciona?

1. **Al iniciar la app**: Verifica si hay actualizaciones después de 3 segundos
2. **Actualización disponible**: Muestra diálogo preguntando si descargar
3. **Descarga**: Muestra barra de progreso
4. **Instalación**: Se instala automáticamente al cerrar la app

### Para publicar una actualización:

```bash
# 1. Cambiar versión en package.json
# "version": "1.0.1"  → "version": "1.0.2"

# 2. Crear release en GitHub con instalador
npm run build:win

# 3. Subir el instalador a GitHub Releases
# El archivo estará en: dist/MMVentas Setup 1.0.2.exe

# 4. Todos los clientes recibirán notificación automática
```

### Configuración en package.json:

```json
{
  "build": {
    "publish": {
      "provider": "github",
      "owner": "Lautaroemurua",
      "repo": "MMVentas"
    }
  }
}
```

### Variables de entorno necesarias:

Para publicar automáticamente a GitHub, necesitás:

```bash
# GitHub Token con permisos de repo
setx GH_TOKEN "tu_token_de_github"
```

### Flujo completo:

1. Cliente instala v1.0.0
2. Vos publicás v1.0.1 en GitHub Releases
3. Cliente abre la app → detecta actualización
4. Cliente acepta → descarga en segundo plano
5. Al cerrar la app → instala automáticamente
6. Próxima vez que abra → tendrá v1.0.1

### Comandos disponibles:

```bash
npm run build          # Build para tu plataforma
npm run build:win      # Build solo para Windows
npm run publish        # Build + publicar a GitHub
```

## IMPORTANTE

Antes de hacer el primer build:
1. Crear un ícono real en `build/icon.ico` (256x256 o 512x512)
2. Actualizar información en package.json (author, description)
3. Crear GitHub Release con el primer instalador manualmente

## Estructura de archivos generados:

```
dist/
  ├── MMVentas Setup 1.0.0.exe      (Instalador)
  ├── latest.yml                     (Info de actualización)
  └── MMVentas-1.0.0.exe            (Portable)
```

El archivo `latest.yml` es el que usa electron-updater para verificar actualizaciones.
