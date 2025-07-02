// Función helper para enviar correos desde componentes
export async function sendNewListEmail({
  userEmail,
  userName,
  listName,
  listDate,
  products = []
}) {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userEmail,
        userName,
        listName,
        listDate,
        products
      }),
    });

    // Verificar si la respuesta es JSON válida
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('❌ Respuesta no es JSON:', text);
      throw new Error('La API no devolvió una respuesta JSON válida');
    }

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Error enviando correo');
    }

    console.log('✅ Correo enviado exitosamente:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error enviando correo:', error);
    return { success: false, error: error.message };
  }
}

// Función para obtener los productos de una lista con detalles completos
export async function getListProductsForEmail(listId, supabase) {
  try {
    const { data: products, error } = await supabase
      .from('lista_productos')
      .select(`
        cantidad,
        productos (
          nombre,
          descripcion
        )
      `)
      .eq('lista_id', listId);

    if (error) throw error;

    return products.map(item => ({
      nombre: item.productos.nombre,
      descripcion: item.productos.descripcion,
      cantidad: item.cantidad
    }));
  } catch (error) {
    console.error('Error obteniendo productos para email:', error);
    return [];
  }
}
