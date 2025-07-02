import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

// Configurar el transportador de correo
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true para 465, false para otros puertos
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

// Verificar la configuración del transportador
const verifyTransporter = async () => {
  try {
    await transporter.verify();
    console.log('✅ Servidor de correo listo para enviar mensajes');
  } catch (error) {
    console.error('❌ Error en la configuración del servidor de correo:', error);
  }
};

verifyTransporter();

export async function POST(request) {
  try {
    const { userEmail, userName, listName, listDate, products } = await request.json();

    // Validar datos requeridos
    if (!userEmail || !listName) {
      return NextResponse.json(
        { error: 'Email del usuario y nombre de la lista son requeridos' },
        { status: 400 }
      );
    }

    // Generar el contenido HTML del correo
    const htmlContent = generateEmailHTML({
      userName,
      listName,
      listDate,
      products,
    });

    // Configurar el correo
    const mailOptions = {
      from: {
        name: 'CartPilot',
        address: process.env.EMAIL_USER,
      },
      to: userEmail,
      subject: `� Nueva lista pendiente: ${listName}`,
      html: htmlContent,
      text: generateEmailText({ userName, listName, listDate, products }),
    };

    // Enviar el correo
    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Correo enviado exitosamente:', info.messageId);

    return NextResponse.json({
      success: true,
      message: 'Correo enviado exitosamente',
      messageId: info.messageId,
    });
  } catch (error) {
    console.error('❌ Error enviando correo:', error);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor al enviar correo',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// Función para generar el contenido HTML del correo
function generateEmailHTML({ userName, listName, listDate, products = [] }) {
  const formattedDate = new Date(listDate).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nueva Lista Pendiente - CartPilot</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6; 
          color: #1a1a1a; 
          background: linear-gradient(135deg, #e67e00 0%, #ff8e01 25%, #ffb03f 50%, #d47300 75%, #b85c00 100%);
          padding: 20px;
        }
        .email-wrapper {
          background: linear-gradient(135deg, #e67e00 0%, #ff8e01 25%, #ffb03f 50%, #d47300 75%, #b85c00 100%);
          padding: 40px 20px;
          min-height: 100vh;
        }
        .container { 
          max-width: 500px; 
          margin: 0 auto; 
          background: #ffffff; 
          border-radius: 20px; 
          overflow: hidden; 
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
        .header { 
          background: #ffffff;
          padding: 40px 30px 20px 30px; 
          text-align: center; 
          border-bottom: 1px solid #f0f0f0;
        }
        .logo {
          width: 80px;
          height: 80px;
          margin: 0 auto 20px auto;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(212, 115, 0, 0.3);
        }
        .logo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .brand-name {
          font-size: 28px;
          font-weight: 700;
          background: linear-gradient(135deg, #e67e00 0%, #ff8e01 25%, #d47300 75%, #b85c00 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 8px;
        }
        .tagline {
          color: #666;
          font-size: 14px;
          font-weight: 500;
        }
        .content { 
          padding: 40px 30px; 
          text-align: center;
        }
        .notification-icon {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #e67e00 0%, #ff8e01 25%, #d47300 75%, #b85c00 100%);
          border-radius: 50%;
          margin: 0 auto 25px auto;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          box-shadow: 0 4px 12px rgba(212, 115, 0, 0.25);
        }
        .main-message {
          font-size: 24px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 15px;
          line-height: 1.3;
        }
        .sub-message {
          color: #666;
          font-size: 16px;
          margin-bottom: 30px;
          line-height: 1.5;
        }
        .list-card {
          background: #fff8f0;
          border: 2px solid #ffe5cc;
          border-radius: 16px;
          padding: 25px;
          margin: 30px 0;
          text-align: left;
        }
        .list-name {
          font-size: 20px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .list-date {
          color: #666;
          font-size: 14px;
          margin-bottom: 15px;
        }
        .list-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: linear-gradient(135deg, #e67e00 0%, #ff8e01 25%, #d47300 75%, #b85c00 100%);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 500;
          box-shadow: 0 2px 8px rgba(212, 115, 0, 0.2);
        }
        .cta-section { 
          margin: 35px 0 25px 0; 
        }
        .cta-button { 
          background: linear-gradient(135deg, #e67e00 0%, #ff8e01 25%, #d47300 75%, #b85c00 100%); 
          color: white; 
          padding: 16px 40px; 
          border-radius: 30px; 
          text-decoration: none; 
          font-weight: 600; 
          font-size: 16px;
          display: inline-block; 
          transition: all 0.3s ease;
          box-shadow: 0 6px 20px rgba(212, 115, 0, 0.35);
        }
        .cta-button:hover { 
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(212, 115, 0, 0.45);
        }
        .footer { 
          background: #f8f9fa; 
          color: #666; 
          padding: 25px 30px; 
          text-align: center; 
          font-size: 13px;
          border-top: 1px solid #f0f0f0;
        }
        .footer-brand {
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 5px;
        }
        @media (max-width: 600px) {
          .email-wrapper {
            padding: 20px 10px;
          }
          .container { 
            margin: 0;
            border-radius: 16px; 
          }
          .header, .content, .footer { 
            padding-left: 20px;
            padding-right: 20px;
          }
          .main-message { 
            font-size: 20px; 
          }
          .list-card {
            padding: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="container">
          <div class="header">
            <div class="logo">
              <img src="${baseUrl}/images/logo.png" alt="CartPilot Logo" />
            </div>
            <div class="brand-name">CartPilot</div>
            <div class="tagline">Tu asistente personal de compras</div>
          </div>
          
          <div class="content">
            
            <h1 class="main-message">
              ¡Nueva lista pendiente!
            </h1>
            
            <p class="sub-message">
              Hola${userName ? ` ${userName}` : ''}, tienes una nueva lista de compras lista para usar.
            </p>
            
            <div class="list-card">
              <div class="list-name">
                📝 ${listName}
              </div>
              <div class="list-date">
                Creada el ${formattedDate}
              </div>
              <div class="list-status">
                ⏳ Pendiente
              </div>
            </div>
            
            <div class="cta-section">
              <a href="${baseUrl}" class="cta-button">
                Ver mi lista
              </a>
            </div>
          </div>
          
          <div class="footer">
            <div class="footer-brand">CartPilot</div>
            <p>Simplificando tus compras, una lista a la vez.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Función para generar el contenido de texto plano del correo
function generateEmailText({ userName, listName, listDate, products = [] }) {
  const formattedDate = new Date(listDate).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  let text = `CartPilot - Nueva Lista Pendiente\n\n`;
  text += `¡Hola${userName ? ` ${userName}` : ''}!\n\n`;
  text += `Tienes una nueva lista de compras lista para usar:\n\n`;
  text += `Lista: ${listName}\n`;
  text += `Creada: ${formattedDate}\n`;
  text += `Estado: Pendiente\n\n`;
  
  text += `Accede a tu lista: ${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}\n\n`;
  text += `---\nCartPilot\n`;
  text += `Simplificando tus compras, una lista a la vez.`;
  
  return text;
}
