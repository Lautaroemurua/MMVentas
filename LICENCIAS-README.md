# Sistema de Licencias MMVentas - Configuración

## 🔒 Sistema de Seguridad con Validación Online

Las licencias ahora se validan contra un archivo JSON almacenado en un repositorio privado de GitHub. Esto hace **imposible** la ingeniería inversa o generación de códigos falsos.

## 📋 Configuración Inicial

### 1. Crear Repositorio en GitHub

1. Ve a GitHub y crea un nuevo repositorio **PRIVADO**
2. Nombre sugerido: `MMVentas-Licenses`
3. Márcalo como **Private**
4. Inicializa con un README

### 2. Crear Archivo de Licencias

1. En el repositorio, crea un archivo llamado `licenses.json`
2. Contenido inicial:
```json
[]
```

### 3. Configurar la Aplicación

Edita el archivo `src/main/license.js` en la línea 117:

**Cambiar:**
```javascript
path: '/TU_USUARIO/MMVentas-Licenses/main/licenses.json',
```

**Por:**
```javascript
path: '/moralesleandro21/MMVentas-Licenses/main/licenses.json',
```
*(Usa tu usuario real de GitHub)*

### 4. Hacer el Repositorio Accesible

Aunque el repositorio es privado, necesitas que el archivo `licenses.json` sea accesible:

**Opción A - Token de Acceso (Recomendado):**
- Ve a GitHub Settings → Developer Settings → Personal Access Tokens
- Genera un token con permisos de lectura de repositorios
- Actualiza la URL en `license.js` para incluir autenticación

**Opción B - Repositorio Público (Más Simple):**
- Cambia el repositorio a público
- Solo contendrá códigos, no el sistema de generación

## 🎯 Uso Diario

### Generar Nueva Licencia para Cliente

1. Abre `GENERADOR_LICENCIAS_V2.html` en tu navegador
2. Cliente te envía su **System ID** (aparece cuando expira el trial)
3. Ingresas:
   - System ID del cliente
   - Nombre del cliente (opcional)
   - Notas (opcional)
4. Click "Generar Licencia"
5. Se genera un código aleatorio único: `ABCD1-EFGH2-IJKL3-MNOP4`

### Agregar al Sistema

6. Click "Agregar Licencia al Archivo"
7. Click "Copiar Archivo Completo"
8. Ve a tu repositorio GitHub → `licenses.json`
9. Pega el nuevo contenido
10. Commit y guarda

### Enviar al Cliente

11. Copia solo el código con "Copiar Solo el Código"
12. Envíalo al cliente por email
13. Cliente lo ingresa en la ventana de activación
14. ✅ Sistema validará online y se activará

## 📁 Estructura del Archivo licenses.json

```json
[
  {
    "systemId": "a1b2c3d4e5f6g7h8",
    "key": "ABCD1-EFGH2-IJKL3-MNOP4",
    "active": true,
    "client": "Restaurante El Buen Sabor",
    "activationDate": "2025-11-27",
    "notes": "Licencia anual 2025"
  },
  {
    "systemId": "9876543210fedcba",
    "key": "ZYXW9-VUTT8-SRQP7-ONML6",
    "active": true,
    "client": "Almacén Don Pedro",
    "activationDate": "2025-11-28",
    "notes": ""
  }
]
```

## 🔐 Ventajas de Seguridad

✅ **Imposible ingeniería inversa** - No hay algoritmo que descifrar
✅ **Control centralizado** - Puedes desactivar licencias cambiando `"active": false`
✅ **Códigos únicos** - Cada cliente tiene un código aleatorio diferente
✅ **Validación online** - Requiere conexión a internet para activar
✅ **Trazabilidad** - Sabes quién tiene qué licencia y cuándo se activó
✅ **Revocación remota** - Puedes bloquear licencias editando el JSON

## 🚫 Revocar una Licencia

Para bloquear un sistema, edita `licenses.json`:

```json
{
  "systemId": "a1b2c3d4e5f6g7h8",
  "key": "ABCD1-EFGH2-IJKL3-MNOP4",
  "active": false,  // ← Cambiar a false
  "client": "Cliente Moroso",
  "notes": "Bloqueado por falta de pago"
}
```

## 📧 Notificaciones Automáticas

Cuando un trial expira, el sistema puede enviar automáticamente un email. 

Configura webhook en `license.js` línea 124 para recibir notificaciones en:
- moralesleandro21@gmail.com
- lautaroemurua@gmail.com

## 🧪 Modo de Prueba

Para probar el sistema bloqueado:

```bash
npm run force-expire    # Simular trial expirado
npm run test-license    # Obtener código de prueba
npm start              # Probar activación
```

## ⚠️ Importante

- **NUNCA** compartas el archivo `GENERADOR_LICENCIAS_V2.html` con clientes
- **NUNCA** subas el generador al repositorio público
- **SIEMPRE** mantén el repositorio de licencias privado
- Haz backup del `licenses.json` regularmente

## 📞 Soporte

Email: moralesleandro21@gmail.com / lautaroemurua@gmail.com
