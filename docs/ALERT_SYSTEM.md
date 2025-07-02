# Sistema de Alertas y Confirmaciones - CartPilot

Un sistema moderno y elegante de alertas y confirmaciones que se integra perfectamente con el diseño de CartPilot.

## 🚀 Características

- **Múltiples tipos de alertas**: Éxito, Error, Advertencia, Información
- **Confirmaciones modales**: Diálogos de confirmación elegantes
- **Auto-dismissible**: Las alertas se ocultan automáticamente
- **Responsive**: Funciona perfectamente en móviles y desktop
- **Dark mode**: Soporte completo para modo oscuro
- **Animaciones suaves**: Transiciones elegantes
- **Context API**: Gestión global del estado
- **TypeScript ready**: Tipos incluidos para mejor DX

## 📦 Instalación

El sistema ya está integrado en el proyecto. Solo necesitas:

1. Asegúrate de que `AlertProvider` esté en tu layout principal (ya incluido)
2. Importa el hook en tu componente
3. ¡Úsalo!

## 🎯 Uso Básico

### 1. Importar el hook

```javascript
import { useAlertHelpers } from '@/hooks/useAlertHelpers';
```

### 2. Usar en tu componente

```javascript
export default function MiComponente() {
  const alerts = useAlertHelpers();

  const handleSuccess = () => {
    alerts.success('¡Operación exitosa!');
  };

  const handleError = () => {
    alerts.error('Algo salió mal');
  };

  return (
    <div>
      <button onClick={handleSuccess}>Mostrar éxito</button>
      <button onClick={handleError}>Mostrar error</button>
    </div>
  );
}
```

## 📋 API Reference

### Alertas Básicas

```javascript
// Alerta de éxito
alerts.success('Mensaje de éxito', options);

// Alerta de error
alerts.error('Mensaje de error', options);

// Alerta de advertencia
alerts.warning('Mensaje de advertencia', options);

// Alerta informativa
alerts.info('Mensaje informativo', options);
```

### Confirmaciones

```javascript
// Confirmación simple
alerts.confirm('¿Estás seguro?', () => {
  console.log('Confirmado');
});

// Confirmar eliminación
alerts.confirmDelete('item', () => {
  console.log('Eliminado');
});

// Confirmar cerrar sesión
alerts.confirmLogout(() => {
  console.log('Sesión cerrada');
});

// Confirmar guardar cambios
alerts.confirmSave(() => {
  console.log('Guardado');
});
```

### Opciones Avanzadas

```javascript
// Con opciones personalizadas
alerts.success('Mensaje', {
  title: 'Título personalizado',
  duration: 3000, // 3 segundos
});

// Confirmación con opciones
alerts.confirm('¿Continuar?', onConfirm, {
  title: 'Título personalizado',
  confirmText: 'Sí, continuar',
  cancelText: 'No, cancelar',
  onCancel: () => console.log('Cancelado')
});
```

## 🎨 Personalización

### Duración de las alertas

```javascript
// Por defecto
alerts.success('Mensaje'); // 4 segundos

// Personalizado
alerts.error('Error grave', { duration: 8000 }); // 8 segundos
```

### Títulos personalizados

```javascript
alerts.info('Información importante', {
  title: 'Atención'
});
```

### Callbacks de confirmación

```javascript
alerts.confirmDelete('archivo importante', 
  () => {
    // Al confirmar
    console.log('Archivo eliminado');
  },
  {
    onCancel: () => {
      // Al cancelar
      console.log('Eliminación cancelada');
    }
  }
);
```

## 🛠 Métodos Disponibles

| Método | Descripción | Parámetros |
|--------|-------------|------------|
| `success(message, options?)` | Muestra alerta de éxito | message: string, options?: object |
| `error(message, options?)` | Muestra alerta de error | message: string, options?: object |
| `warning(message, options?)` | Muestra alerta de advertencia | message: string, options?: object |
| `info(message, options?)` | Muestra alerta informativa | message: string, options?: object |
| `confirm(message, onConfirm, options?)` | Muestra confirmación | message: string, onConfirm: function, options?: object |
| `confirmDelete(itemName, onConfirm, options?)` | Confirmación de eliminación | itemName: string, onConfirm: function, options?: object |
| `confirmLogout(onConfirm, options?)` | Confirmación de cerrar sesión | onConfirm: function, options?: object |
| `confirmSave(onConfirm, options?)` | Confirmación de guardar | onConfirm: function, options?: object |

## 🎯 Ejemplos Prácticos

### En un formulario

```javascript
const handleSubmit = async (data) => {
  try {
    await saveData(data);
    alerts.success('Datos guardados correctamente');
  } catch (error) {
    alerts.error('Error al guardar los datos');
  }
};
```

### Confirmar antes de eliminar

```javascript
const handleDelete = (itemId, itemName) => {
  alerts.confirmDelete(itemName, async () => {
    try {
      await deleteItem(itemId);
      alerts.success('Item eliminado correctamente');
    } catch (error) {
      alerts.error('Error al eliminar el item');
    }
  });
};
```

### Validaciones

```javascript
const handleAction = () => {
  if (!isValid) {
    alerts.warning('Por favor completa todos los campos');
    return;
  }
  
  processAction();
};
```

## 🎨 Estilos

El sistema utiliza las variables CSS definidas en `globals.css` para mantener consistencia:

- `--primary`: Color principal (naranja)
- `--success`: Verde para éxito
- `--error`: Rojo para errores
- `--warning`: Amarillo para advertencias
- `--info`: Azul para información

## 🔧 Demo

Visita `/alert-demo` para ver todos los tipos de alertas en acción y experimentar con ellas.

## 📱 Responsive

El sistema es completamente responsive:

- **Desktop**: Alertas en esquina superior derecha
- **Mobile**: Alertas adaptadas al ancho de pantalla
- **Confirmaciones**: Siempre centradas y adaptativas

## 🌙 Dark Mode

Soporte completo para modo oscuro usando las variables CSS de CartPilot.

## 🚀 Performance

- **Lazy loading**: Los componentes se cargan solo cuando se necesitan
- **Portal rendering**: Las alertas se renderizan fuera del árbol principal
- **Auto cleanup**: Limpieza automática de alertas vencidas
- **Optimized animations**: Animaciones eficientes con CSS

---

¡Disfruta usando el sistema de alertas en CartPilot! 🎉
