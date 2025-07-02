# Configuración de Correo Electrónico - CartPilot

## 📧 Configuración de Gmail

Para configurar el envío de correos desde la aplicación CartPilot, necesitas generar una contraseña de aplicación desde tu cuenta de Gmail.

### Pasos para configurar Gmail:

1. **Habilitar verificación en 2 pasos** (si no la tienes activada):
   - Ve a [myaccount.google.com](https://myaccount.google.com)
   - En el panel izquierdo, haz clic en "Seguridad"
   - En "Iniciar sesión en Google", selecciona "Verificación en 2 pasos"
   - Sigue las instrucciones para activarla

2. **Generar contraseña de aplicación**:
   - En la misma sección de "Seguridad"
   - Busca "Contraseñas de aplicaciones" (aparece solo si tienes 2FA activado)
   - Selecciona "Generar contraseña de aplicación"
   - Elige "Correo" como aplicación
   - Copia la contraseña de 16 dígitos que aparece

3. **Configurar variables de entorno**:
   - Abre el archivo `.env.local` en la raíz del proyecto
   - Reemplaza `xxxxxxxxxxxxxxxx` con la contraseña de aplicación generada:
   ```
   EMAIL_APP_PASSWORD=tu_contraseña_de_16_digitos
   ```

### Variables de entorno requeridas:

```bash
# Configuración de correo electrónico
EMAIL_USER=cartpilot.app@gmail.com
EMAIL_APP_PASSWORD=xxxxxxxxxxxxxxxx  # Contraseña de aplicación de 16 dígitos

# Configuración del servidor SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false

# URL del sitio (cambiar en producción)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 🚀 Funcionalidad Implementada

### Envío automático de correos:
- ✅ Correo de bienvenida al crear una nueva lista
- ✅ Diseño responsive y atractivo
- ✅ Información detallada de la lista creada
- ✅ Botón para acceder directamente a la aplicación

### Características del correo:
- **HTML responsivo**: Se ve bien en desktop y móvil
- **Branding de CartPilot**: Colores y estilo consistentes
- **Información útil**: Nombre de la lista, fecha, productos (si existen)
- **Call-to-action**: Botón para volver a la aplicación
- **Texto alternativo**: Para clientes de correo que no soportan HTML

## 🔧 API Endpoints

### POST `/api/send-email`

Envía un correo de confirmación cuando se crea una nueva lista.

**Body:**
```json
{
  "userEmail": "usuario@email.com",
  "userName": "Nombre Usuario",
  "listName": "Mi Lista de Compras",
  "listDate": "2025-01-15",
  "products": [
    {
      "nombre": "Leche",
      "cantidad": 2
    }
  ]
}
```

**Response exitoso:**
```json
{
  "success": true,
  "message": "Correo enviado exitosamente",
  "messageId": "mensaje_id"
}
```

## 🛠️ Desarrollo y Testing

### Probar el envío de correos localmente:

1. Configura las variables de entorno correctamente
2. Inicia el servidor de desarrollo: `npm run dev`
3. Crea una nueva lista en la aplicación
4. Verifica tu bandeja de entrada

### Logs y debugging:

El sistema incluye logs detallados:
- ✅ Confirmación de configuración del servidor SMTP
- ✅ Confirmación de envío exitoso
- ❌ Errores detallados (solo en desarrollo)

## 🌟 Próximas Mejoras

- [ ] Correo cuando se completa una lista
- [ ] Recordatorios programados
- [ ] Plantillas personalizables
- [ ] Notificaciones por producto agregado
- [ ] Integración con otros proveedores de email (SendGrid, etc.)

## 🔐 Seguridad

- Las contraseñas de aplicación se almacenan como variables de entorno
- No se envían datos sensibles en los correos
- Validación de entrada en la API
- Rate limiting recomendado para producción

## 📱 Producción

Para desplegar en producción:

1. Cambia `NEXT_PUBLIC_SITE_URL` por tu dominio real
2. Considera usar un servicio de correo profesional (SendGrid, Mailgun)
3. Implementa rate limiting
4. Configura logs de monitoreo
5. Añade validación adicional de dominios de correo
