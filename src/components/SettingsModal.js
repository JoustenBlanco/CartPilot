"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export default function SettingsModal({ user, onClose }) {
  const [activeTab, setActiveTab] = useState('categories'); // 'categories' | 'supermarkets' | 'products'
  const [categories, setCategories] = useState([]);
  const [supermarkets, setSupermarkets] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newSupermarketName, setNewSupermarketName] = useState("");
  const [newProduct, setNewProduct] = useState({
    nombre: "",
    descripcion: "",
    categoria_id: "",
    supermercado_id: "",
    estante: "",
    cara: "",
    foto_url: ""
  });
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingSupermarket, setEditingSupermarket] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingProductData, setEditingProductData] = useState({});

  // Cargar categorías
  const loadCategories = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .eq('user_id', user.id)
        .order('nombre');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error cargando categorías:', error);
    }
  }, [user]);

  // Cargar supermercados
  const loadSupermarkets = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('supermercados')
        .select('*')
        .eq('user_id', user.id)
        .order('nombre');
      
      if (error) throw error;
      setSupermarkets(data || []);
    } catch (error) {
      console.error('Error cargando supermercados:', error);
    }
  }, [user]);

  // Cargar productos
  const loadProducts = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('productos')
        .select(`
          *,
          categorias (nombre),
          supermercados (nombre)
        `)
        .eq('user_id', user.id)
        .order('nombre');
      
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error cargando productos:', error);
    }
  }, [user]);

  useEffect(() => {
    loadCategories();
    loadSupermarkets();
    loadProducts();
  }, [loadCategories, loadSupermarkets, loadProducts]);

  // Crear categoría
  const createCategory = async () => {
    if (!newCategoryName.trim() || !user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('categorias')
        .insert([{
          nombre: newCategoryName.trim(),
          user_id: user.id
        }]);
      
      if (error) throw error;
      
      setNewCategoryName("");
      loadCategories();
    } catch (error) {
      console.error('Error creando categoría:', error);
      alert('Error al crear la categoría');
    } finally {
      setLoading(false);
    }
  };

  // Crear supermercado
  const createSupermarket = async () => {
    if (!newSupermarketName.trim() || !user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('supermercados')
        .insert([{
          nombre: newSupermarketName.trim(),
          user_id: user.id
        }]);
      
      if (error) throw error;
      
      setNewSupermarketName("");
      loadSupermarkets();
    } catch (error) {
      console.error('Error creando supermercado:', error);
      alert('Error al crear el supermercado');
    } finally {
      setLoading(false);
    }
  };

  // Editar categoría
  const updateCategory = async (id, newName) => {
    if (!newName.trim()) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('categorias')
        .update({ nombre: newName.trim() })
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setEditingCategory(null);
      loadCategories();
    } catch (error) {
      console.error('Error actualizando categoría:', error);
      alert('Error al actualizar la categoría');
    } finally {
      setLoading(false);
    }
  };

  // Editar supermercado
  const updateSupermarket = async (id, newName) => {
    if (!newName.trim()) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('supermercados')
        .update({ nombre: newName.trim() })
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setEditingSupermarket(null);
      loadSupermarkets();
    } catch (error) {
      console.error('Error actualizando supermercado:', error);
      alert('Error al actualizar el supermercado');
    } finally {
      setLoading(false);
    }
  };

  // Eliminar categoría
  const deleteCategory = async (id) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta categoría?')) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('categorias')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      loadCategories();
    } catch (error) {
      console.error('Error eliminando categoría:', error);
      alert('Error al eliminar la categoría. Puede que esté siendo usada por productos.');
    } finally {
      setLoading(false);
    }
  };

  // Eliminar supermercado
  const deleteSupermarket = async (id) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este supermercado?')) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('supermercados')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      loadSupermarkets();
    } catch (error) {
      console.error('Error eliminando supermercado:', error);
      alert('Error al eliminar el supermercado. Puede que esté siendo usado por productos.');
    } finally {
      setLoading(false);
    }
  };

  // === FUNCIONES PARA PRODUCTOS ===
  
  // Crear producto
  const createProduct = async () => {
    if (!newProduct.nombre.trim() || !user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('productos')
        .insert([{
          nombre: newProduct.nombre.trim(),
          descripcion: newProduct.descripcion.trim() || null,
          categoria_id: newProduct.categoria_id || null,
          supermercado_id: newProduct.supermercado_id || null,
          estante: newProduct.estante.trim() || null,
          cara: newProduct.cara.trim() || null,
          foto_url: newProduct.foto_url.trim() || null,
          user_id: user.id
        }]);
      
      if (error) throw error;
      
      setNewProduct({
        nombre: "",
        descripcion: "",
        categoria_id: "",
        supermercado_id: "",
        estante: "",
        cara: "",
        foto_url: ""
      });
      loadProducts();
    } catch (error) {
      console.error('Error creando producto:', error);
      alert('Error al crear el producto');
    } finally {
      setLoading(false);
    }
  };

  // Editar producto
  const updateProduct = async (id, updatedProduct) => {
    if (!updatedProduct.nombre || !updatedProduct.nombre.trim()) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('productos')
        .update({
          nombre: updatedProduct.nombre.trim(),
          descripcion: updatedProduct.descripcion ? updatedProduct.descripcion.trim() : null,
          categoria_id: updatedProduct.categoria_id || null,
          supermercado_id: updatedProduct.supermercado_id || null,
          estante: updatedProduct.estante ? updatedProduct.estante.trim() : null,
          cara: updatedProduct.cara ? updatedProduct.cara.trim() : null,
          foto_url: updatedProduct.foto_url ? updatedProduct.foto_url.trim() : null
        })
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setEditingProduct(null);
      setEditingProductData({});
      loadProducts();
    } catch (error) {
      console.error('Error actualizando producto:', error);
      alert('Error al actualizar el producto');
    } finally {
      setLoading(false);
    }
  };

  // Eliminar producto
  const deleteProduct = async (id) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('productos')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      loadProducts();
    } catch (error) {
      console.error('Error eliminando producto:', error);
      alert('Error al eliminar el producto. Puede que esté siendo usado en listas.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className="rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
        style={{ backgroundColor: "var(--surface)" }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 
            className="text-2xl font-bold"
            style={{ color: "var(--foreground)" }}
          >
            ⚙️ Configuración
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            style={{ color: "var(--text-secondary)" }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 rounded-lg p-1" style={{ backgroundColor: "var(--background)" }}>
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'categories' ? 'text-white' : ''
            }`}
            style={{ 
              backgroundColor: activeTab === 'categories' ? "var(--primary)" : "transparent",
              color: activeTab === 'categories' ? "white" : "var(--text-secondary)"
            }}
          >
            📂 Categorías
          </button>
          <button
            onClick={() => setActiveTab('supermarkets')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'supermarkets' ? 'text-white' : ''
            }`}
            style={{ 
              backgroundColor: activeTab === 'supermarkets' ? "var(--primary)" : "transparent",
              color: activeTab === 'supermarkets' ? "white" : "var(--text-secondary)"
            }}
          >
            🏪 Supermercados
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'products' ? 'text-white' : ''
            }`}
            style={{ 
              backgroundColor: activeTab === 'products' ? "var(--primary)" : "transparent",
              color: activeTab === 'products' ? "white" : "var(--text-secondary)"
            }}
          >
            📦 Productos
          </button>
        </div>

        {/* Contenido de Categorías */}
        {activeTab === 'categories' && (
          <div className="space-y-4">
            {/* Agregar nueva categoría */}
            <div 
              className="rounded-lg p-4"
              style={{ backgroundColor: "var(--background)" }}
            >
              <h3 
                className="text-lg font-semibold mb-3"
                style={{ color: "var(--foreground)" }}
              >
                Agregar Nueva Categoría
              </h3>
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Nombre de la categoría"
                  className="flex-1 px-3 py-2 rounded-md border focus:outline-none focus:ring-2"
                  style={{ 
                    backgroundColor: "var(--surface)",
                    borderColor: "var(--border)",
                    color: "var(--foreground)",
                    "--tw-ring-color": "var(--primary)"
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && createCategory()}
                />
                <button
                  onClick={createCategory}
                  disabled={loading || !newCategoryName.trim()}
                  className="px-4 py-2 rounded-md text-white transition-colors disabled:opacity-50"
                  style={{ backgroundColor: "var(--primary)" }}
                >
                  {loading ? 'Creando...' : 'Agregar'}
                </button>
              </div>
            </div>

            {/* Lista de categorías */}
            <div className="space-y-2">
              <h3 
                className="text-lg font-semibold"
                style={{ color: "var(--foreground)" }}
              >
                Categorías Existentes ({categories.length})
              </h3>
              {categories.length === 0 ? (
                <p 
                  className="text-center py-8"
                  style={{ color: "var(--text-secondary)" }}
                >
                  No tienes categorías creadas aún
                </p>
              ) : (
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-3 rounded-md border"
                      style={{ 
                        backgroundColor: "var(--background)",
                        borderColor: "var(--border)"
                      }}
                    >
                      {editingCategory === category.id ? (
                        <div className="flex-1 flex space-x-2">
                          <input
                            type="text"
                            defaultValue={category.nombre}
                            className="flex-1 px-2 py-1 rounded border focus:outline-none focus:ring-1"
                            style={{ 
                              backgroundColor: "var(--surface)",
                              borderColor: "var(--border)",
                              color: "var(--foreground)",
                              "--tw-ring-color": "var(--primary)"
                            }}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                updateCategory(category.id, e.target.value);
                              }
                            }}
                            autoFocus
                          />
                          <button
                            onClick={() => setEditingCategory(null)}
                            className="px-2 py-1 text-sm rounded border"
                            style={{ 
                              borderColor: "var(--border)",
                              color: "var(--text-secondary)"
                            }}
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <>
                          <span 
                            className="font-medium"
                            style={{ color: "var(--foreground)" }}
                          >
                            📂 {category.nombre}
                          </span>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setEditingCategory(category.id)}
                              className="p-1 rounded hover:bg-gray-100 transition-colors"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                              </svg>
                            </button>
                            <button
                              onClick={() => deleteCategory(category.id)}
                              className="p-1 rounded hover:bg-red-100 transition-colors"
                              style={{ color: "var(--error)" }}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                              </svg>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contenido de Supermercados */}
        {activeTab === 'supermarkets' && (
          <div className="space-y-4">
            {/* Agregar nuevo supermercado */}
            <div 
              className="rounded-lg p-4"
              style={{ backgroundColor: "var(--background)" }}
            >
              <h3 
                className="text-lg font-semibold mb-3"
                style={{ color: "var(--foreground)" }}
              >
                Agregar Nuevo Supermercado
              </h3>
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={newSupermarketName}
                  onChange={(e) => setNewSupermarketName(e.target.value)}
                  placeholder="Nombre del supermercado"
                  className="flex-1 px-3 py-2 rounded-md border focus:outline-none focus:ring-2"
                  style={{ 
                    backgroundColor: "var(--surface)",
                    borderColor: "var(--border)",
                    color: "var(--foreground)",
                    "--tw-ring-color": "var(--primary)"
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && createSupermarket()}
                />
                <button
                  onClick={createSupermarket}
                  disabled={loading || !newSupermarketName.trim()}
                  className="px-4 py-2 rounded-md text-white transition-colors disabled:opacity-50"
                  style={{ backgroundColor: "var(--primary)" }}
                >
                  {loading ? 'Creando...' : 'Agregar'}
                </button>
              </div>
            </div>

            {/* Lista de supermercados */}
            <div className="space-y-2">
              <h3 
                className="text-lg font-semibold"
                style={{ color: "var(--foreground)" }}
              >
                Supermercados Existentes ({supermarkets.length})
              </h3>
              {supermarkets.length === 0 ? (
                <p 
                  className="text-center py-8"
                  style={{ color: "var(--text-secondary)" }}
                >
                  No tienes supermercados creados aún
                </p>
              ) : (
                <div className="space-y-2">
                  {supermarkets.map((supermarket) => (
                    <div
                      key={supermarket.id}
                      className="flex items-center justify-between p-3 rounded-md border"
                      style={{ 
                        backgroundColor: "var(--background)",
                        borderColor: "var(--border)"
                      }}
                    >
                      {editingSupermarket === supermarket.id ? (
                        <div className="flex-1 flex space-x-2">
                          <input
                            type="text"
                            defaultValue={supermarket.nombre}
                            className="flex-1 px-2 py-1 rounded border focus:outline-none focus:ring-1"
                            style={{ 
                              backgroundColor: "var(--surface)",
                              borderColor: "var(--border)",
                              color: "var(--foreground)",
                              "--tw-ring-color": "var(--primary)"
                            }}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                updateSupermarket(supermarket.id, e.target.value);
                              }
                            }}
                            autoFocus
                          />
                          <button
                            onClick={() => setEditingSupermarket(null)}
                            className="px-2 py-1 text-sm rounded border"
                            style={{ 
                              borderColor: "var(--border)",
                              color: "var(--text-secondary)"
                            }}
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <>
                          <span 
                            className="font-medium"
                            style={{ color: "var(--foreground)" }}
                          >
                            🏪 {supermarket.nombre}
                          </span>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setEditingSupermarket(supermarket.id)}
                              className="p-1 rounded hover:bg-gray-100 transition-colors"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                              </svg>
                            </button>
                            <button
                              onClick={() => deleteSupermarket(supermarket.id)}
                              className="p-1 rounded hover:bg-red-100 transition-colors"
                              style={{ color: "var(--error)" }}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                              </svg>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contenido de Productos */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Formulario para crear producto */}
            <div>
              <h3 
                className="text-lg font-semibold mb-4"
                style={{ color: "var(--foreground)" }}
              >
                Crear Nuevo Producto
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nombre del producto */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>
                    Nombre del producto *
                  </label>
                  <input
                    type="text"
                    value={newProduct.nombre}
                    onChange={(e) => setNewProduct({ ...newProduct, nombre: e.target.value })}
                    placeholder="Ej: Leche entera"
                    className="w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: "var(--background)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                      "--tw-ring-color": "var(--primary)"
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && createProduct()}
                  />
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>
                    Descripción
                  </label>
                  <input
                    type="text"
                    value={newProduct.descripcion}
                    onChange={(e) => setNewProduct({ ...newProduct, descripcion: e.target.value })}
                    placeholder="Ej: 1 litro, marca X"
                    className="w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: "var(--background)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                      "--tw-ring-color": "var(--primary)"
                    }}
                  />
                </div>

                {/* Categoría */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>
                    Categoría
                  </label>
                  <select
                    value={newProduct.categoria_id}
                    onChange={(e) => setNewProduct({ ...newProduct, categoria_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: "var(--background)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                      "--tw-ring-color": "var(--primary)"
                    }}
                  >
                    <option value="">Sin categoría</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Supermercado */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>
                    Supermercado
                  </label>
                  <select
                    value={newProduct.supermercado_id}
                    onChange={(e) => setNewProduct({ ...newProduct, supermercado_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: "var(--background)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                      "--tw-ring-color": "var(--primary)"
                    }}
                  >
                    <option value="">Sin supermercado</option>
                    {supermarkets.map((supermarket) => (
                      <option key={supermarket.id} value={supermarket.id}>
                        {supermarket.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Estante */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>
                    Estante
                  </label>
                  <input
                    type="text"
                    value={newProduct.estante}
                    onChange={(e) => setNewProduct({ ...newProduct, estante: e.target.value })}
                    placeholder="Ej: A1, B3, Refrigerado"
                    className="w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: "var(--background)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                      "--tw-ring-color": "var(--primary)"
                    }}
                  />
                </div>

                {/* Cara */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>
                    Ubicación específica
                  </label>
                  <input
                    type="text"
                    value={newProduct.cara}
                    onChange={(e) => setNewProduct({ ...newProduct, cara: e.target.value })}
                    placeholder="Ej: Izquierda, Centro, Arriba"
                    className="w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: "var(--background)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                      "--tw-ring-color": "var(--primary)"
                    }}
                  />
                </div>
              </div>

              {/* URL de foto */}
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>
                  URL de la imagen (opcional)
                </label>
                <input
                  type="url"
                  value={newProduct.foto_url}
                  onChange={(e) => setNewProduct({ ...newProduct, foto_url: e.target.value })}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  className="w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2"
                  style={{ 
                    backgroundColor: "var(--background)",
                    borderColor: "var(--border)",
                    color: "var(--foreground)",
                    "--tw-ring-color": "var(--primary)"
                  }}
                />
              </div>
              
              <button
                onClick={createProduct}
                disabled={!newProduct.nombre.trim() || loading}
                className="mt-4 px-4 py-2 rounded-md text-white font-medium transition-colors disabled:opacity-50"
                style={{ backgroundColor: "var(--primary)" }}
              >
                {loading ? 'Creando...' : 'Crear Producto'}
              </button>
            </div>

            {/* Lista de productos */}
            <div>
              <h3 
                className="text-lg font-semibold mb-4"
                style={{ color: "var(--foreground)" }}
              >
                Productos Existentes ({products.length})
              </h3>
              
              {products.length === 0 ? (
                <p style={{ color: "var(--text-secondary)" }}>
                  No tienes productos creados aún
                </p>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-3 rounded-md border"
                      style={{ 
                        backgroundColor: "var(--background)",
                        borderColor: "var(--border)"
                      }}
                    >
                      {editingProduct === product.id ? (
                        <>
                          <div className="flex-1 space-y-3 mr-3">
                            {/* Primera fila: Nombre y Descripción */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <div>
                                <label className="block text-xs font-medium mb-1" style={{ color: "var(--foreground)" }}>
                                  Nombre *
                                </label>
                                <input
                                  type="text"
                                  value={editingProductData.nombre || product.nombre || ''}
                                  onChange={(e) => setEditingProductData({
                                    ...editingProductData,
                                    nombre: e.target.value
                                  })}
                                  className="w-full px-2 py-1 rounded border text-sm"
                                  style={{ 
                                    backgroundColor: "var(--surface)",
                                    borderColor: "var(--border)",
                                    color: "var(--foreground)"
                                  }}
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      const dataToUpdate = {
                                        nombre: editingProductData.nombre !== undefined ? editingProductData.nombre : product.nombre,
                                        descripcion: editingProductData.descripcion !== undefined ? editingProductData.descripcion : product.descripcion,
                                        categoria_id: editingProductData.categoria_id !== undefined ? editingProductData.categoria_id : product.categoria_id,
                                        supermercado_id: editingProductData.supermercado_id !== undefined ? editingProductData.supermercado_id : product.supermercado_id,
                                        estante: editingProductData.estante !== undefined ? editingProductData.estante : product.estante,
                                        cara: editingProductData.cara !== undefined ? editingProductData.cara : product.cara,
                                        foto_url: editingProductData.foto_url !== undefined ? editingProductData.foto_url : product.foto_url
                                      };
                                      updateProduct(product.id, dataToUpdate);
                                    }
                                  }}
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium mb-1" style={{ color: "var(--foreground)" }}>
                                  Descripción
                                </label>
                                <input
                                  type="text"
                                  value={editingProductData.descripcion !== undefined ? editingProductData.descripcion : (product.descripcion || '')}
                                  onChange={(e) => setEditingProductData({
                                    ...editingProductData,
                                    descripcion: e.target.value
                                  })}
                                  placeholder="Ej: 1 litro, marca X"
                                  className="w-full px-2 py-1 rounded border text-sm"
                                  style={{ 
                                    backgroundColor: "var(--surface)",
                                    borderColor: "var(--border)",
                                    color: "var(--foreground)"
                                  }}
                                />
                              </div>
                            </div>

                            {/* Segunda fila: Categoría y Supermercado */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <div>
                                <label className="block text-xs font-medium mb-1" style={{ color: "var(--foreground)" }}>
                                  Categoría
                                </label>
                                <select
                                  value={editingProductData.categoria_id !== undefined ? editingProductData.categoria_id : (product.categoria_id || '')}
                                  onChange={(e) => setEditingProductData({
                                    ...editingProductData,
                                    categoria_id: e.target.value
                                  })}
                                  className="w-full px-2 py-1 rounded border text-sm"
                                  style={{ 
                                    backgroundColor: "var(--surface)",
                                    borderColor: "var(--border)",
                                    color: "var(--foreground)"
                                  }}
                                >
                                  <option value="">Sin categoría</option>
                                  {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                      {category.nombre}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-medium mb-1" style={{ color: "var(--foreground)" }}>
                                  Supermercado
                                </label>
                                <select
                                  value={editingProductData.supermercado_id !== undefined ? editingProductData.supermercado_id : (product.supermercado_id || '')}
                                  onChange={(e) => setEditingProductData({
                                    ...editingProductData,
                                    supermercado_id: e.target.value
                                  })}
                                  className="w-full px-2 py-1 rounded border text-sm"
                                  style={{ 
                                    backgroundColor: "var(--surface)",
                                    borderColor: "var(--border)",
                                    color: "var(--foreground)"
                                  }}
                                >
                                  <option value="">Sin supermercado</option>
                                  {supermarkets.map((supermarket) => (
                                    <option key={supermarket.id} value={supermarket.id}>
                                      {supermarket.nombre}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            {/* Tercera fila: Estante y Ubicación específica */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <div>
                                <label className="block text-xs font-medium mb-1" style={{ color: "var(--foreground)" }}>
                                  Estante
                                </label>
                                <input
                                  type="text"
                                  value={editingProductData.estante !== undefined ? editingProductData.estante : (product.estante || '')}
                                  onChange={(e) => setEditingProductData({
                                    ...editingProductData,
                                    estante: e.target.value
                                  })}
                                  placeholder="Ej: A1, B3, Refrigerado"
                                  className="w-full px-2 py-1 rounded border text-sm"
                                  style={{ 
                                    backgroundColor: "var(--surface)",
                                    borderColor: "var(--border)",
                                    color: "var(--foreground)"
                                  }}
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium mb-1" style={{ color: "var(--foreground)" }}>
                                  Ubicación específica
                                </label>
                                <input
                                  type="text"
                                  value={editingProductData.cara !== undefined ? editingProductData.cara : (product.cara || '')}
                                  onChange={(e) => setEditingProductData({
                                    ...editingProductData,
                                    cara: e.target.value
                                  })}
                                  placeholder="Ej: Izquierda, Centro, Arriba"
                                  className="w-full px-2 py-1 rounded border text-sm"
                                  style={{ 
                                    backgroundColor: "var(--surface)",
                                    borderColor: "var(--border)",
                                    color: "var(--foreground)"
                                  }}
                                />
                              </div>
                            </div>

                            {/* Cuarta fila: URL de imagen */}
                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: "var(--foreground)" }}>
                                URL de imagen
                              </label>
                              <input
                                type="url"
                                value={editingProductData.foto_url !== undefined ? editingProductData.foto_url : (product.foto_url || '')}
                                onChange={(e) => setEditingProductData({
                                  ...editingProductData,
                                  foto_url: e.target.value
                                })}
                                placeholder="https://ejemplo.com/imagen.jpg"
                                className="w-full px-2 py-1 rounded border text-sm"
                                style={{ 
                                  backgroundColor: "var(--surface)",
                                  borderColor: "var(--border)",
                                  color: "var(--foreground)"
                                }}
                              />
                            </div>
                          </div>
                          <div className="flex flex-col space-y-2">
                            <button
                              onClick={() => {
                                console.log('Intentando actualizar producto:', product.id);
                                console.log('Datos de edición:', editingProductData);
                                
                                const dataToUpdate = {
                                  nombre: editingProductData.nombre !== undefined ? editingProductData.nombre : product.nombre,
                                  descripcion: editingProductData.descripcion !== undefined ? editingProductData.descripcion : product.descripcion,
                                  categoria_id: editingProductData.categoria_id !== undefined ? editingProductData.categoria_id : product.categoria_id,
                                  supermercado_id: editingProductData.supermercado_id !== undefined ? editingProductData.supermercado_id : product.supermercado_id,
                                  estante: editingProductData.estante !== undefined ? editingProductData.estante : product.estante,
                                  cara: editingProductData.cara !== undefined ? editingProductData.cara : product.cara,
                                  foto_url: editingProductData.foto_url !== undefined ? editingProductData.foto_url : product.foto_url
                                };
                                
                                console.log('Datos finales a actualizar:', dataToUpdate);
                                updateProduct(product.id, dataToUpdate);
                              }}
                              className="p-2 rounded text-green-600 hover:bg-green-50 transition-colors"
                              title="Guardar cambios"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                              </svg>
                            </button>
                            <button
                              onClick={() => {
                                setEditingProduct(null);
                                setEditingProductData({});
                              }}
                              className="p-2 rounded text-gray-600 hover:bg-gray-50 transition-colors"
                              title="Cancelar edición"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                              </svg>
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span 
                                className="font-medium text-base"
                                style={{ color: "var(--foreground)" }}
                              >
                                {product.nombre}
                              </span>
                              {product.descripcion && (
                                <span 
                                  className="text-sm"
                                  style={{ color: "var(--text-secondary)" }}
                                >
                                  - {product.descripcion}
                                </span>
                              )}
                            </div>
                            
                            {/* Primera línea de detalles */}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs" style={{ color: "var(--text-muted)" }}>
                              {product.categorias && (
                                <span className="flex items-center">
                                  📂 <span className="ml-1">{product.categorias.nombre}</span>
                                </span>
                              )}
                              {product.supermercados && (
                                <span className="flex items-center">
                                  🏪 <span className="ml-1">{product.supermercados.nombre}</span>
                                </span>
                              )}
                            </div>
                            
                            {/* Segunda línea de detalles */}
                            {(product.estante || product.cara || product.foto_url) && (
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                                {product.estante && (
                                  <span className="flex items-center">
                                    📍 <span className="ml-1">Estante {product.estante}</span>
                                  </span>
                                )}
                                {product.cara && (
                                  <span className="flex items-center">
                                    👉 <span className="ml-1">{product.cara}</span>
                                  </span>
                                )}
                                {product.foto_url && (
                                  <span className="flex items-center">
                                    🖼️ <span className="ml-1">Con imagen</span>
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setEditingProduct(product.id);
                                setEditingProductData({
                                  nombre: product.nombre || '',
                                  descripcion: product.descripcion || '',
                                  categoria_id: product.categoria_id || '',
                                  supermercado_id: product.supermercado_id || '',
                                  estante: product.estante || '',
                                  cara: product.cara || '',
                                  foto_url: product.foto_url || ''
                                });
                              }}
                              className="p-1 rounded text-blue-600 hover:bg-blue-50"
                              title="Editar"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                              </svg>
                            </button>
                            <button
                              onClick={() => deleteProduct(product.id)}
                              className="p-1 rounded text-red-600 hover:bg-red-50"
                              title="Eliminar"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                              </svg>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
