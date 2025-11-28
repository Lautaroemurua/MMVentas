# 📝 Guía de Modificadores - Sistema POS MMVentas

## ¿Qué son los Modificadores?

Los **modificadores** son opciones personalizables que puedes agregar a cualquier producto durante la venta. Son genéricos y funcionan para cualquier tipo de negocio:

### 🍔 Ejemplos en Gastronomía:
- "Sin lechuga"
- "Con extra queso"
- "Cocción: jugoso"
- "Sin cebolla, con mayonesa"

### 🧴 Ejemplos en Productos de Limpieza:
- "Envase de 5L"
- "Presentación: botella spray"
- "Fragancia: lavanda"

### 🛠️ Ejemplos en Ferretería:
- "Medida: 1/2 pulgada"
- "Color: negro mate"
- "Longitud: 2 metros"

---

## 🚀 Cómo Configurar Modificadores

### Paso 1: Acceder al Panel de Modificadores
1. En la pantalla principal, haz clic en el botón **"📝 Modificadores"**
2. Se abrirá el modal de gestión de modificadores

### Paso 2: Crear un Modificador

Hay **2 tipos de modificadores**:

#### Tipo 1: **Texto Libre**
Permite que el cajero escriba cualquier comentario especial.

**Ejemplo:**
- **Nombre:** Observaciones especiales
- **Tipo:** Texto libre
- **Precio Adicional:** 0.00 (sin cargo extra)

**Uso:** El cajero puede escribir "Sin cebolla, con extra salsa"

---

#### Tipo 2: **Opciones Predefinidas**
Muestra un menú desplegable con opciones fijas.

**Ejemplo para Restaurante:**
- **Nombre:** Cocción de la carne
- **Tipo:** Opciones predefinidas
- **Opciones:** Jugoso, A punto, Bien cocido
- **Precio Adicional:** 0.00

**Ejemplo para Limpieza:**
- **Nombre:** Tamaño de envase
- **Tipo:** Opciones predefinidas
- **Opciones:** 500ml, 1L, 5L, 20L
- **Precio Adicional:** 0.00

**Ejemplo con Precio Extra:**
- **Nombre:** Extra queso
- **Tipo:** Opciones predefinidas
- **Opciones:** Simple, Doble, Triple
- **Precio Adicional:** 1.50

---

### Paso 3: Guardar el Modificador
1. Completa todos los campos
2. Haz clic en **"Guardar Modificador"**
3. El modificador aparecerá en la tabla de "Modificadores Activos"

---

## 💼 Cómo Usar los Modificadores en una Venta

### Flujo de Venta con Modificadores:

1. **Busca el producto** en el buscador (Ej: "Hamburguesa completa")
2. **Selecciona el producto** de la lista
3. **Verás los modificadores disponibles** debajo del producto seleccionado
4. **Completa los modificadores** que necesites:
   - Si es texto libre: escribe el comentario
   - Si es opciones: selecciona de la lista
5. **Ingresa la cantidad**
6. **Presiona Enter o clic en "Agregar al Ticket"**

### Ejemplo Práctico - Restaurante:

```
Cliente: "Una hamburguesa completa sin lechuga y con extra mayonesa"

1. Busca "hamburguesa completa" → Precio: $8.50
2. Selecciona el producto
3. Modificadores disponibles:
   - Observaciones: "Sin lechuga, con extra mayonesa"
   - Cocción: "A punto"
4. Cantidad: 1
5. Agregar → Se suma al ticket con los modificadores
```

**Ticket impreso:**
```
Hamburguesa completa           1   $8.50   $8.50
  • Observaciones: Sin lechuga, con extra mayonesa
  • Cocción: A punto
```

---

### Ejemplo Práctico - Productos de Limpieza:

```
Cliente: "Un desinfectante en envase de 5 litros"

1. Busca "desinfectante" → Precio: $12.00
2. Selecciona el producto
3. Modificadores disponibles:
   - Tamaño de envase: "5L"
   - Fragancia: "Lavanda"
4. Cantidad: 1
5. Agregar → Se suma al ticket
```

**Ticket impreso:**
```
Desinfectante multiuso         1   $12.00  $12.00
  • Tamaño de envase: 5L
  • Fragancia: Lavanda
```

---

## 💰 Modificadores con Precio Adicional

Si un modificador tiene costo extra, el precio se suma **automáticamente** al producto:

**Ejemplo:**
- Hamburguesa: $8.50
- Extra queso (+$1.50)
- **Total del item:** $10.00

**Ticket:**
```
Hamburguesa completa           1   $10.00  $10.00
  • Extra queso: Doble
```

---

## 🗑️ Eliminar un Modificador

1. Ve al panel de **"📝 Modificadores"**
2. En la tabla de "Modificadores Activos", localiza el modificador
3. Haz clic en **"Eliminar"**
4. Confirma la eliminación

⚠️ **Nota:** Los modificadores ya guardados en ventas anteriores se conservan en el historial.

---

## 🎯 Ventajas del Sistema de Modificadores

✅ **Genérico:** Funciona para cualquier tipo de negocio  
✅ **Flexible:** Texto libre o opciones predefinidas  
✅ **Precios dinámicos:** Suma automáticamente costos extras  
✅ **Visible en tickets:** Se imprime claramente para el cliente  
✅ **Historial completo:** Cada venta guarda los modificadores usados  

---

## 📊 Casos de Uso Reales

### Restaurante / Bar:
- Cocción de carnes
- Ingredientes a quitar/agregar
- Salsas adicionales
- Temperatura de bebidas (frío/caliente)

### Limpieza / Bazar:
- Tamaños de envase
- Fragancias
- Presentaciones (spray, gel, líquido)
- Cantidad de unidades en pack

### Ferretería / Hardware:
- Medidas/dimensiones
- Colores
- Materiales
- Acabados (brillante, mate, texturado)

### Indumentaria:
- Talles
- Colores
- Ajustes (dobladillo, cintura)

---

## 🔧 Consejos de Configuración

1. **Empieza simple:** Crea solo los modificadores que realmente uses
2. **Nombres claros:** Usa descripciones cortas y entendibles
3. **Agrupa por función:** Separa modificadores obligatorios de opcionales
4. **Revisa precios:** Asegúrate de que los costos adicionales estén bien configurados
5. **Capacita al personal:** Explica a tu equipo cómo usar cada modificador

---

## 📞 Soporte

**Desarrollado por:**
- Lautaro (lautaroemurua@gmail.com)
- Leandro (moralesleandro21@gmail.com)

**Versión del sistema:** 1.0.0  
**Última actualización:** 2025
