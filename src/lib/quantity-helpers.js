// Helpers para manejar cantidades y unidades
// Como no modificamos la BD, usaremos convenciones para determinar el tipo de unidad

/**
 * Determina si una cantidad es en kg o unidades basado en el valor
 * @param {number} cantidad - La cantidad numérica
 * @returns {string} - 'kg' o 'unidades'
 */
export function determineUnit(cantidad) {
  // Si la cantidad tiene decimales, la consideramos kg
  // Si es un número entero, la consideramos unidades
  return cantidad % 1 !== 0 ? 'kg' : 'unidades';
}

/**
 * Formatea una cantidad para mostrar con su unidad
 * @param {number} cantidad - La cantidad numérica
 * @returns {string} - La cantidad formateada con su unidad
 */
export function formatQuantity(cantidad) {
  const unit = determineUnit(cantidad);
  
  if (unit === 'kg') {
    // Para kg, mostrar con 1 decimal si es necesario, pero sin .0 si es entero
    const formatted = cantidad % 1 !== 0 ? cantidad.toFixed(1) : cantidad.toString();
    return `${formatted} kg`;
  } else {
    // Para unidades, mostrar sin decimales
    return cantidad.toString();
  }
}

/**
 * Convierte una cantidad y unidad a un valor numérico para almacenar en BD
 * @param {number} cantidad - La cantidad
 * @param {string} unit - 'kg' o 'unidades'
 * @returns {number} - El valor numérico a almacenar
 */
export function convertToStorageValue(cantidad, unit) {
  if (unit === 'kg') {
    // Para kg, redondear a 1 decimal para evitar problemas de precisión
    return Math.round(parseFloat(cantidad) * 10) / 10;
  } else {
    // Para unidades, convertir a entero
    return parseInt(cantidad);
  }
}

/**
 * Valida que una cantidad sea válida para la unidad especificada
 * @param {number} cantidad - La cantidad a validar
 * @param {string} unit - 'kg' o 'unidades'
 * @returns {boolean} - Si la cantidad es válida
 */
export function validateQuantity(cantidad, unit) {
  if (unit === 'kg') {
    return cantidad >= 0.1 && cantidad <= 999.9;
  } else {
    return cantidad >= 1 && cantidad <= 9999 && cantidad % 1 === 0;
  }
}

/**
 * Obtiene el valor mínimo permitido para una unidad
 * @param {string} unit - 'kg' o 'unidades'
 * @returns {number} - El valor mínimo
 */
export function getMinValue(unit) {
  return unit === 'kg' ? 0.1 : 1;
}

/**
 * Obtiene el step (incremento) para una unidad
 * @param {string} unit - 'kg' o 'unidades'
 * @returns {number} - El step
 */
export function getStep(unit) {
  return unit === 'kg' ? 0.1 : 1;
}

/**
 * Suma una cantidad respetando las reglas de la unidad
 * @param {number} currentQuantity - La cantidad actual
 * @param {string} unit - 'kg' o 'unidades'
 * @returns {number} - La nueva cantidad
 */
export function addQuantity(currentQuantity, unit) {
  if (unit === 'kg') {
    // Para kg, sumar 0.1 y redondear a 1 decimal
    return Math.round((currentQuantity + 0.1) * 10) / 10;
  } else {
    // Para unidades, sumar 1
    return currentQuantity + 1;
  }
}

/**
 * Resta una cantidad respetando las reglas de la unidad
 * @param {number} currentQuantity - La cantidad actual
 * @param {string} unit - 'kg' o 'unidades'
 * @returns {number} - La nueva cantidad
 */
export function subtractQuantity(currentQuantity, unit) {
  if (unit === 'kg') {
    // Para kg, restar 0.1 y redondear a 1 decimal, mínimo 0.1
    const newQuantity = Math.round((currentQuantity - 0.1) * 10) / 10;
    return Math.max(0.1, newQuantity);
  } else {
    // Para unidades, restar 1, mínimo 1
    return Math.max(1, currentQuantity - 1);
  }
}
