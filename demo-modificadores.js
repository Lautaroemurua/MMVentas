/**
 * Script de prueba para sistema de modificadores
 * 
 * Este script inserta datos de ejemplo para demostrar cómo funciona
 * el sistema de modificadores en diferentes tipos de negocios.
 */

const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');

// Conectar a la base de datos
const dbPath = path.join(app.getPath('userData'), 'ventas.db');
const db = new Database(dbPath);

console.log('🔧 Iniciando inserción de datos de prueba...\n');

// Limpiar modificadores anteriores
console.log('🗑️ Limpiando modificadores anteriores...');
db.prepare('DELETE FROM modificadores').run();

// Insertar modificadores de ejemplo para RESTAURANTE
console.log('\n🍔 Insertando modificadores para RESTAURANTE:');

const modRestaurante = [
  { nombre: 'Observaciones especiales', tipo: 'texto', opciones: null, precio: 0 },
  { nombre: 'Cocción de la carne', tipo: 'opciones', opciones: 'Jugoso,A punto,Bien cocido', precio: 0 },
  { nombre: 'Extra ingrediente', tipo: 'opciones', opciones: 'Queso,Bacon,Huevo,Cebolla caramelizada', precio: 1.50 },
  { nombre: 'Salsas adicionales', tipo: 'opciones', opciones: 'Mayonesa,Ketchup,Mostaza,BBQ,Chimichurri', precio: 0.50 },
];

const insertMod = db.prepare('INSERT INTO modificadores (nombre, tipo, opciones, precio_adicional, activo) VALUES (?, ?, ?, ?, 1)');

modRestaurante.forEach(mod => {
  insertMod.run(mod.nombre, mod.tipo, mod.opciones, mod.precio);
  console.log(`  ✅ ${mod.nombre} (${mod.tipo}) ${mod.precio > 0 ? '+$' + mod.precio : ''}`);
});

// Insertar productos de ejemplo para RESTAURANTE
console.log('\n🍕 Insertando productos de ejemplo:');

const productos = [
  { nombre: 'Hamburguesa Completa', precio: 8.50 },
  { nombre: 'Hamburguesa Simple', precio: 6.00 },
  { nombre: 'Lomito Completo', precio: 10.00 },
  { nombre: 'Pizza Muzzarella', precio: 12.00 },
  { nombre: 'Empanadas (c/u)', precio: 1.50 },
];

const insertProd = db.prepare('INSERT INTO productos (nombre, precio) VALUES (?, ?)');

productos.forEach(prod => {
  insertProd.run(prod.nombre, prod.precio);
  console.log(`  ✅ ${prod.nombre} - $${prod.precio.toFixed(2)}`);
});

console.log('\n✨ Datos de prueba insertados correctamente!');
console.log('\n📋 EJEMPLOS DE USO:');
console.log('\n1️⃣ Hamburguesa Completa sin lechuga, con extra queso:');
console.log('   → Busca "Hamburguesa Completa"');
console.log('   → Observaciones: "Sin lechuga"');
console.log('   → Extra ingrediente: "Queso"');
console.log('   → Precio final: $8.50 + $1.50 = $10.00');

console.log('\n2️⃣ Lomito con cocción a punto y extra bacon:');
console.log('   → Busca "Lomito Completo"');
console.log('   → Cocción: "A punto"');
console.log('   → Extra ingrediente: "Bacon"');
console.log('   → Precio final: $10.00 + $1.50 = $11.50');

console.log('\n\n🔄 Para otros rubros, elimina estos modificadores y crea nuevos:');
console.log('\n🧴 LIMPIEZA:');
console.log('   - Tamaño de envase (opciones: 500ml, 1L, 5L, 20L)');
console.log('   - Fragancia (opciones: Lavanda, Limón, Manzana, Sin fragancia)');
console.log('   - Presentación (opciones: Botella, Spray, Bidón)');

console.log('\n🛠️ FERRETERÍA:');
console.log('   - Medida (texto libre: "1/2 pulgada", "20mm", etc.)');
console.log('   - Color (opciones: Negro, Blanco, Gris, Cromado)');
console.log('   - Longitud (opciones: 1m, 2m, 5m, 10m)');

console.log('\n👕 INDUMENTARIA:');
console.log('   - Talle (opciones: XS, S, M, L, XL, XXL)');
console.log('   - Color (texto libre)');
console.log('   - Ajustes (texto libre: "Dobladillo 2cm", etc.)');

console.log('\n💡 TIP: Los modificadores tipo "texto" son más flexibles.');
console.log('    Los tipo "opciones" son más rápidos y consistentes.\n');

db.close();

console.log('✅ Base de datos cerrada. ¡Reinicia la app para ver los cambios!');
