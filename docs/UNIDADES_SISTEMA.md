# Sistema de Unidades para CartPilot

## Descripción

CartPilot ahora soporta dos tipos de unidades para las cantidades de productos:
- **Unidades**: Para productos que se cuentan por piezas (ej: 3 manzanas, 2 botellas)
- **Kilogramos**: Para productos que se miden por peso (ej: 1.5 kg de carne, 0.8 kg de queso)

## Funcionalidades

### 1. Agregar Productos con Unidades

Cuando agregas un producto a una lista:
1. Selecciona el producto
2. Aparece un modal con selector de cantidad
3. Puedes elegir entre "Unidades" 📦 o "Kilogramos" ⚖️
4. El input se ajusta automáticamente:
   - **Unidades**: Solo números enteros (1, 2, 3, etc.)
   - **Kilogramos**: Permite decimales (0.5, 1.2, 2.3, etc.)

### 2. Editar Cantidades

En la lista de productos:
1. Haz clic en la cantidad mostrada
2. Se abre un editor inline con:
   - Selector de unidades en la parte superior
   - Input numérico con validación
   - Botones para guardar/cancelar

### 3. Visualización Inteligente

- **Unidades**: Se muestra solo el número (ej: "3")
- **Kilogramos**: Se muestra con "kg" (ej: "1.5 kg")
- El sistema detecta automáticamente el tipo basado en si hay decimales

## Lógica de Detección

El sistema usa una lógica inteligente para determinar el tipo de unidad:

```javascript
// Si la cantidad tiene decimales = kg
// Si la cantidad es un entero = unidades

function determineUnit(cantidad) {
  return cantidad % 1 !== 0 ? 'kg' : 'unidades';
}
```

## Ejemplos de Uso

### Unidades (números enteros)
- 1 → "1" (unidades)
- 3 → "3" (unidades)
- 12 → "12" (unidades)

### Kilogramos (números decimales)
- 0.5 → "0.5 kg"
- 1.2 → "1.2 kg"
- 2.0 → "2 kg" (se omite el .0)

## Validaciones

### Para Unidades
- Mínimo: 1
- Máximo: 9999
- Solo números enteros
- Incremento: 1

### Para Kilogramos
- Mínimo: 0.1
- Máximo: 999.9
- Máximo 1 decimal
- Incremento: 0.1 (siempre)
- Los botones +/- siempre incrementan/decrementan en 0.1

## Compatibilidad con Base de Datos

El sistema es totalmente compatible con la estructura actual de la base de datos:
- Utiliza el campo `cantidad` existente (tipo `numeric`)
- No requiere cambios en la BD
- Mantiene la compatibilidad con datos existentes

## Interfaz de Usuario

### Selector de Unidades
- Botones con iconos intuitivos
- 📦 para Unidades
- ⚖️ para Kilogramos
- Cambio automático de validaciones
- Feedback visual claro

### Entrada de Datos
- Input numérico con restricciones apropiadas
- Botones +/- que respetan las reglas de cada unidad
- **Para kilogramos**: Incremento fijo de 0.1, máximo 1 decimal
- **Para unidades**: Incremento de 1, solo enteros
- Validación en tiempo real
- Mensajes de error claros
- Redondeo automático para mantener precisión

## Casos de Uso Reales

1. **Verduras y Frutas**: 
   - Manzanas: 6 unidades
   - Bananas: 1.5 kg

2. **Carnes y Pescados**:
   - Pollo: 2 kg
   - Filetes de pescado: 4 unidades

3. **Productos Empacados**:
   - Yogurt: 6 unidades
   - Queso: 0.8 kg

4. **Productos de Limpieza**:
   - Detergente: 2 unidades
   - Jabón líquido: 1.2 kg

## Beneficios

- **Intuitividad**: Fácil de entender y usar
- **Flexibilidad**: Soporta ambos tipos de medida
- **Precisión**: Permite cantidades exactas
- **Compatibilidad**: No rompe funcionalidad existente
- **Visual**: Interfaz clara y moderna
