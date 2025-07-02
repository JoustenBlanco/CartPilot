"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export default function SettingsModal({ user, onClose }) {
  const [activeTab, setActiveTab] = useState('categories'); // 'categories' | 'supermarkets'
  const [categories, setCategories] = useState([]);
  const [supermarkets, setSupermarkets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newSupermarketName, setNewSupermarketName] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingSupermarket, setEditingSupermarket] = useState(null);

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

  useEffect(() => {
    loadCategories();
    loadSupermarkets();
  }, [loadCategories, loadSupermarkets]);

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
      </div>
    </div>
  );
}
