"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import AddProductToList from "./AddProductToList";
import Avatar from "./Avatar";
import SettingsModal from "./SettingsModal";
import EmergencySignOut from "./EmergencySignOut";
import Navigation from "./Navigation";

export default function Dashboard() {
  const { user, profile, signOut, loading } = useAuth();
  const [currentView, setCurrentView] = useState('main'); // 'main', 'list', 'create'
  const [lists, setLists] = useState([]);
  const [currentList, setCurrentList] = useState(null);
  const [loadingData, setLoadingData] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Estados para edición de listas
  const [editingList, setEditingList] = useState(null);
  const [editingListData, setEditingListData] = useState({});
  const [showListActions, setShowListActions] = useState(null); // Para mostrar menú de acciones

  // Función utilitaria para convertir fecha a formato local YYYY-MM-DD
  const dateToLocalString = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Función utilitaria para convertir fecha local a formato ISO para la BD
  const localStringToISODate = (localDateString) => {
    if (!localDateString) return '';
    return localDateString; // Ya está en formato YYYY-MM-DD
  };

  // Cargar listas del usuario
  const loadLists = useCallback(async () => {
    if (!user) return;
    setLoadingData(true);
    try {
      const { data, error } = await supabase
        .from('listas')
        .select('*')
        .eq('user_id', user.id)
        .order('fecha', { ascending: false });
      
      if (error) throw error;
      setLists(data || []);
    } catch (error) {
      console.error('Error cargando listas:', error);
    } finally {
      setLoadingData(false);
    }
  }, [user]);

  // Cargar productos para búsqueda
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
        .eq('user_id', user.id);
      
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error cargando productos:', error);
    }
  }, [user]);

  // Cargar productos de una lista específica
  const loadListProducts = async (listId) => {
    try {
      const { data, error } = await supabase
        .from('lista_productos')
        .select(`
          *,
          productos (
            id,
            nombre,
            descripcion,
            foto_url,
            estante,
            cara,
            categorias (nombre),
            supermercados (nombre)
          )
        `)
        .eq('lista_id', listId);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error cargando productos de la lista:', error);
      return [];
    }
  };

  useEffect(() => {
    if (user) {
      loadLists();
      loadProducts();
    }
  }, [user, loadLists, loadProducts]);

  // Cerrar menú de acciones al hacer clic fuera - SIMPLIFICADO
  useEffect(() => {
    const handleClickOutside = () => {
      // Solo cerrar si hay un menú abierto
      if (showListActions) {
        setTimeout(() => setShowListActions(null), 100);
      }
    };

    if (showListActions) {
      document.addEventListener('click', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showListActions]);

  // Crear nueva lista
  const createList = async () => {
    if (!newListName.trim() || !user) return;
    
    try {
      const { data, error } = await supabase
        .from('listas')
        .insert([{
          nombre: newListName,
          fecha: new Date().toISOString().split('T')[0],
          user_id: user.id
        }])
        .select();
      
      if (error) throw error;
      
      setNewListName("");
      setCurrentView('main');
      loadLists();
    } catch (error) {
      console.error('Error creando lista:', error);
    }
  };

  // Editar lista
  const updateList = async (listId, updatedData) => {
    if (!updatedData.nombre || !updatedData.nombre.trim()) return;
    
    try {
      const { error } = await supabase
        .from('listas')
        .update({
          nombre: updatedData.nombre.trim(),
          fecha: updatedData.fecha
        })
        .eq('id', listId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setEditingList(null);
      setEditingListData({});
      loadLists();
      
      // Si estamos editando la lista actual, actualizarla
      if (currentList && currentList.id === listId) {
        setCurrentList({
          ...currentList,
          nombre: updatedData.nombre,
          fecha: updatedData.fecha
        });
      }
    } catch (error) {
      console.error('Error actualizando lista:', error);
      alert('Error al actualizar la lista');
    }
  };

  // Eliminar lista
  const deleteList = async (listId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta lista? Esta acción no se puede deshacer.')) return;
    
    try {
      // Primero eliminar todos los productos de la lista
      const { error: deleteProductsError } = await supabase
        .from('lista_productos')
        .delete()
        .eq('lista_id', listId);
      
      if (deleteProductsError) throw deleteProductsError;
      
      // Luego eliminar la lista
      const { error } = await supabase
        .from('listas')
        .delete()
        .eq('id', listId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Si estamos viendo la lista que se eliminó, volver al main
      if (currentList && currentList.id === listId) {
        setCurrentView('main');
        setCurrentList(null);
      }
      
      loadLists();
    } catch (error) {
      console.error('Error eliminando lista:', error);
      alert('Error al eliminar la lista');
    }
  };

  // Marcar producto como comprado/no comprado
  const toggleProductPurchased = async (listProductId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('lista_productos')
        .update({ comprado: !currentStatus })
        .eq('id', listProductId);
      
      if (error) throw error;
      
      // Recargar productos de la lista actual
      if (currentList) {
        const updatedProducts = await loadListProducts(currentList.id);
        setCurrentList({ ...currentList, productos: updatedProducts });
      }
    } catch (error) {
      console.error('Error actualizando producto:', error);
    }
  };

  // Función mejorada para cerrar sesión
  const handleSignOut = async () => {
    try {
      // Confirmar con el usuario
      if (!confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        return;
      }

      // Usar la función de signOut del hook
      await signOut();
      
    } catch (error) {
      console.error('Error durante el cierre de sesión:', error);
      
      // Si hay error, forzar cierre de sesión local
      try {
        // Limpiar localStorage
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.includes('supabase') || key.includes('sb-')) {
            localStorage.removeItem(key);
          }
        });
        
        // Limpiar sessionStorage
        const sessionKeys = Object.keys(sessionStorage);
        sessionKeys.forEach(key => {
          if (key.includes('supabase') || key.includes('sb-')) {
            sessionStorage.removeItem(key);
          }
        });
        
        // Redirigir manualmente
        window.location.href = '/';
        
      } catch (cleanupError) {
        console.error('Error en limpieza manual:', cleanupError);
        // Como última opción, recargar la página
        window.location.reload();
      }
    }
  };

  // Abrir lista específica
  const openList = async (list) => {
    const products = await loadListProducts(list.id);
    setCurrentList({ ...list, productos: products });
    setCurrentView('list');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <svg
            className="animate-spin h-8 w-8 mx-auto"
            style={{ color: "var(--primary)" }}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
            Cargando...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--background)" }}
    >
      {/* Navigation */}
      <Navigation 
        profile={profile}
        user={user}
        onSettingsClick={() => setShowSettings(true)}
        onSignOut={handleSignOut}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          
          {/* Vista Principal - Lista de Listas */}
          {currentView === 'main' && (
            <div className="space-y-6">
              {/* Estadísticas rápidas */}
              {lists.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div 
                    className="rounded-lg p-6 text-center"
                    style={{ backgroundColor: "var(--surface)" }}
                  >
                    <div 
                      className="text-2xl font-bold"
                      style={{ color: "var(--primary)" }}
                    >
                      {lists.length}
                    </div>
                    <p 
                      className="text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Listas Totales
                    </p>
                  </div>
                  <div 
                    className="rounded-lg p-6 text-center"
                    style={{ backgroundColor: "var(--surface)" }}
                  >
                    <div 
                      className="text-2xl font-bold"
                      style={{ color: "var(--success)" }}
                    >
                      {lists.filter(list => new Date(list.fecha).toDateString() === new Date().toDateString()).length}
                    </div>
                    <p 
                      className="text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Listas de Hoy
                    </p>
                  </div>
                  <div 
                    className="rounded-lg p-6 text-center"
                    style={{ backgroundColor: "var(--surface)" }}
                  >
                    <div 
                      className="text-2xl font-bold"
                      style={{ color: "var(--warning)" }}
                    >
                      {products.length}
                    </div>
                    <p 
                      className="text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Productos Guardados
                    </p>
                  </div>
                </div>
              )}

              {/* Header con botón crear */}
              <div className="flex justify-between items-center">
                <div>
                  <h1 
                    className="text-3xl font-bold"
                    style={{ color: "var(--foreground)" }}
                  >
                    Mis Listas de Compras
                  </h1>
                  <p 
                    className="mt-1 text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Gestiona tus listas de compras de forma inteligente
                  </p>
                </div>
                <button
                  onClick={() => setCurrentView('create')}
                  className="px-6 py-3 rounded-lg text-white font-medium transition-all hover:scale-105 shadow-lg"
                  style={{ backgroundColor: "var(--primary)" }}
                >
                  <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                  Nueva Lista
                </button>
              </div>

              {/* Grid de listas */}
              {loadingData ? (
                <div className="text-center py-12">
                  <svg
                    className="animate-spin h-8 w-8 mx-auto"
                    style={{ color: "var(--primary)" }}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
                    Cargando listas...
                  </p>
                </div>
              ) : lists.length === 0 ? (
                <div className="text-center py-12">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <h3 className="mt-2 text-lg font-medium" style={{ color: "var(--foreground)" }}>
                    No tienes listas aún
                  </h3>
                  <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                    Crea tu primera lista de compras para comenzar
                  </p>
                  <button
                    onClick={() => setCurrentView('create')}
                    className="mt-4 px-4 py-2 rounded-md text-white"
                    style={{ backgroundColor: "var(--primary)" }}
                  >
                    Crear Lista
                  </button>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {lists.map((list) => (
                    <div
                      key={list.id}
                      className="rounded-lg p-6 transition-all hover:shadow-lg border cursor-pointer group"
                      style={{ 
                        backgroundColor: "var(--surface)",
                        borderColor: "var(--border)"
                      }}
                      onClick={() => openList(list)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 
                            className="text-lg font-semibold mb-2 group-hover:text-blue-600 transition-colors"
                            style={{ color: "var(--foreground)" }}
                          >
                            {list.nombre || `Lista del ${new Date(list.fecha).toLocaleDateString()}`}
                          </h3>
                          <p 
                            className="text-sm flex items-center"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            {new Date(list.fecha).toLocaleDateString()}
                          </p>
                        </div>
                        
                        {/* Botón de menú de acciones */}
                        <div className="relative ml-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('Menu button clicked for list:', list.id, 'current showListActions:', showListActions);
                              setShowListActions(showListActions === list.id ? null : list.id);
                            }}
                            className="p-2 rounded-md transition-colors"
                            style={{ 
                              color: "var(--text-secondary)",
                              ":hover": { backgroundColor: "var(--background)" }
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = "var(--background)";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = "transparent";
                            }}
                            title="Más opciones"
                            data-menu-button="true"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                            </svg>
                          </button>
                          
                          {/* Menú desplegable */}
                          {showListActions === list.id && (
                            <div 
                              className="absolute right-0 mt-1 w-48 rounded-md shadow-lg z-10 border"
                              style={{ 
                                backgroundColor: "var(--surface)",
                                borderColor: "var(--border)"
                              }}
                              onClick={(e) => e.stopPropagation()}
                              data-menu-container="true"
                            >
                              <div className="py-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openList(list);
                                    setShowListActions(null);
                                  }}
                                  className="flex items-center w-full px-4 py-2 text-sm transition-colors"
                                  style={{ 
                                    color: "var(--foreground)",
                                    textAlign: "left"
                                  }}
                                  onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = "var(--background)";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = "transparent";
                                  }}
                                >
                                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                  </svg>
                                  Ver lista
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    console.log('Editar clicked for list:', list.id);
                                    setEditingList(list.id);
                                    setEditingListData({
                                      nombre: list.nombre,
                                      fecha: dateToLocalString(list.fecha)
                                    });
                                    setShowListActions(null);
                                  }}
                                  className="flex items-center w-full px-4 py-2 text-sm transition-colors"
                                  style={{ 
                                    color: "var(--foreground)",
                                    textAlign: "left"
                                  }}
                                  onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = "var(--background)";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = "transparent";
                                  }}
                                >
                                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                  </svg>
                                  Editar
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    console.log('Eliminar clicked for list:', list.id);
                                    deleteList(list.id);
                                    setShowListActions(null);
                                  }}
                                  className="flex items-center w-full px-4 py-2 text-sm transition-colors"
                                  style={{ 
                                    color: "var(--error)",
                                    textAlign: "left"
                                  }}
                                  onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = "rgba(255, 0, 0, 0.1)";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = "transparent";
                                  }}
                                >
                                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                  </svg>
                                  Eliminar
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Modo de edición */}
                      {editingList === list.id && (
                        <div className="space-y-3 mb-4 p-3 rounded-md" style={{ backgroundColor: "var(--background)" }}>
                          <div>
                            <label className="block text-sm font-medium mb-1" style={{ color: "var(--foreground)" }}>
                              Nombre de la lista
                            </label>
                            <input
                              type="text"
                              value={editingListData.nombre !== undefined ? editingListData.nombre : list.nombre}
                              onChange={(e) => setEditingListData({
                                ...editingListData,
                                nombre: e.target.value
                              })}
                              className="w-full px-3 py-2 rounded border text-sm"
                              style={{ 
                                backgroundColor: "var(--surface)",
                                borderColor: "var(--border)",
                                color: "var(--foreground)"
                              }}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  const dataToUpdate = {
                                    nombre: editingListData.nombre !== undefined ? editingListData.nombre : list.nombre,
                                    fecha: editingListData.fecha !== undefined ? editingListData.fecha : dateToLocalString(list.fecha)
                                  };
                                  updateList(list.id, dataToUpdate);
                                }
                              }}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1" style={{ color: "var(--foreground)" }}>
                              Fecha
                            </label>
                            <input
                              type="date"
                              value={editingListData.fecha !== undefined ? editingListData.fecha : dateToLocalString(list.fecha)}
                              onChange={(e) => setEditingListData({
                                ...editingListData,
                                fecha: e.target.value
                              })}
                              className="w-full px-3 py-2 rounded border text-sm"
                              style={{ 
                                backgroundColor: "var(--surface)",
                                borderColor: "var(--border)",
                                color: "var(--foreground)"
                              }}
                            />
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                const dataToUpdate = {
                                  nombre: editingListData.nombre !== undefined ? editingListData.nombre : list.nombre,
                                  fecha: editingListData.fecha !== undefined ? editingListData.fecha : dateToLocalString(list.fecha)
                                };
                                updateList(list.id, dataToUpdate);
                              }}
                              className="flex-1 px-3 py-2 rounded text-white text-sm font-medium"
                              style={{ backgroundColor: "var(--primary)" }}
                            >
                              ✓ Guardar Cambios
                            </button>
                            <button
                              onClick={() => {
                                setEditingList(null);
                                setEditingListData({});
                              }}
                              className="flex-1 px-3 py-2 rounded border text-sm"
                              style={{ 
                                borderColor: "var(--border)",
                                color: "var(--text-secondary)"
                              }}
                            >
                              ✕ Cancelar
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {/* Indicadores de estado - solo mostrar si no está en modo edición */}
                      {editingList !== list.id && (
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-3">
                            <span 
                              className="flex items-center"
                              style={{ color: "var(--text-muted)" }}
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-4h-2m0 0V6a2 2 0 00-2-2h-2M9 3v2M7 6V4a2 2 0 012-2h2v2" />
                              </svg>
                              Lista
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div 
                              className="text-xs px-2 py-1 rounded-full"
                              style={{ 
                                backgroundColor: new Date(list.fecha).toDateString() === new Date().toDateString() 
                                  ? "var(--success)" 
                                  : "var(--background)",
                                color: new Date(list.fecha).toDateString() === new Date().toDateString() 
                                  ? "white" 
                                  : "var(--text-muted)"
                              }}
                            >
                              {new Date(list.fecha).toDateString() === new Date().toDateString() ? 'Hoy' : 'Pendiente'}
                            </div>
                            {/* Indicador visual de que es clickeable */}
                            <svg 
                              className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" 
                              style={{ color: "var(--primary)" }}
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Vista Crear Lista */}
          {currentView === 'create' && (
            <div className="max-w-md mx-auto">
              <div 
                className="rounded-lg p-6 shadow-lg"
                style={{ backgroundColor: "var(--surface)" }}
              >
                <h2 
                  className="text-2xl font-bold mb-6 text-center"
                  style={{ color: "var(--foreground)" }}
                >
                  Crear Nueva Lista
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label 
                      className="block text-sm font-medium mb-2"
                      style={{ color: "var(--foreground)" }}
                    >
                      Nombre de la lista
                    </label>
                    <input
                      type="text"
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      placeholder={`Lista del ${new Date().toLocaleDateString()}`}
                      className="w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2"
                      style={{ 
                        backgroundColor: "var(--background)",
                        borderColor: "var(--border)",
                        color: "var(--foreground)",
                        "--tw-ring-color": "var(--primary)"
                      }}
                      onKeyPress={(e) => e.key === 'Enter' && createList()}
                    />
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setCurrentView('main')}
                      className="flex-1 px-4 py-2 rounded-md border transition-colors"
                      style={{ 
                        borderColor: "var(--border)",
                        color: "var(--text-secondary)"
                      }}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={createList}
                      disabled={!newListName.trim()}
                      className="flex-1 px-4 py-2 rounded-md text-white transition-colors disabled:opacity-50"
                      style={{ backgroundColor: "var(--primary)" }}
                    >
                      Crear Lista
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Vista Lista Específica */}
          {currentView === 'list' && currentList && (
            <div className="space-y-6">
              {/* Header de la lista */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setCurrentView('main')}
                    className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                  </button>
                  <div className="flex-1">
                    {editingList === currentList.id ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editingListData.nombre !== undefined ? editingListData.nombre : currentList.nombre}
                          onChange={(e) => setEditingListData({
                            ...editingListData,
                            nombre: e.target.value
                          })}
                          className="text-2xl font-bold bg-transparent border-b-2 focus:outline-none"
                          style={{ 
                            color: "var(--foreground)",
                            borderColor: "var(--primary)"
                          }}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              const dataToUpdate = {
                                nombre: editingListData.nombre !== undefined ? editingListData.nombre : currentList.nombre,
                                fecha: editingListData.fecha !== undefined ? editingListData.fecha : dateToLocalString(currentList.fecha)
                              };
                              updateList(currentList.id, dataToUpdate);
                            }
                          }}
                        />
                        <input
                          type="date"
                          value={editingListData.fecha !== undefined ? editingListData.fecha : dateToLocalString(currentList.fecha)}
                          onChange={(e) => setEditingListData({
                            ...editingListData,
                            fecha: e.target.value
                          })}
                          className="text-sm px-2 py-1 rounded border focus:outline-none focus:ring-2"
                          style={{ 
                            backgroundColor: "var(--surface)",
                            borderColor: "var(--border)",
                            color: "var(--text-secondary)",
                            "--tw-ring-color": "var(--primary)"
                          }}
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              const dataToUpdate = {
                                nombre: editingListData.nombre !== undefined ? editingListData.nombre : currentList.nombre,
                                fecha: editingListData.fecha !== undefined ? editingListData.fecha : dateToLocalString(currentList.fecha)
                              };
                              updateList(currentList.id, dataToUpdate);
                            }}
                            className="px-3 py-1 rounded text-white text-sm font-medium"
                            style={{ backgroundColor: "var(--primary)" }}
                          >
                            ✓ Guardar
                          </button>
                          <button
                            onClick={() => {
                              setEditingList(null);
                              setEditingListData({});
                            }}
                            className="px-3 py-1 rounded border text-sm"
                            style={{ 
                              borderColor: "var(--border)",
                              color: "var(--text-secondary)"
                            }}
                          >
                            ✕ Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center space-x-3">
                          <h1 
                            className="text-2xl font-bold"
                            style={{ color: "var(--foreground)" }}
                          >
                            {currentList.nombre || `Lista del ${new Date(currentList.fecha).toLocaleDateString()}`}
                          </h1>
                          
                          {/* Menú de acciones para vista individual */}
                          <div className="relative">
                            <button
                              onClick={() => {
                                setShowListActions(showListActions === currentList.id ? null : currentList.id);
                              }}
                              className="p-2 rounded-md transition-colors"
                              style={{ 
                                color: "var(--text-secondary)"
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.backgroundColor = "var(--background)";
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor = "transparent";
                              }}
                              title="Más opciones"
                              data-menu-button="true"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                              </svg>
                            </button>
                            
                            {/* Menú desplegable */}
                            {showListActions === currentList.id && (
                              <div 
                                className="absolute right-0 mt-1 w-48 rounded-md shadow-lg z-10 border"
                                style={{ 
                                  backgroundColor: "var(--surface)",
                                  borderColor: "var(--border)"
                                }}
                                data-menu-container="true"
                              >
                                <div className="py-1">
                                  <button
                                    onClick={() => {
                                      setEditingList(currentList.id);
                                      setEditingListData({
                                        nombre: currentList.nombre,
                                        fecha: dateToLocalString(currentList.fecha)
                                      });
                                      setShowListActions(null);
                                    }}
                                    className="flex items-center w-full px-4 py-2 text-sm transition-colors"
                                    style={{ 
                                      color: "var(--foreground)",
                                      textAlign: "left"
                                    }}
                                    onMouseEnter={(e) => {
                                      e.target.style.backgroundColor = "var(--background)";
                                    }}
                                    onMouseLeave={(e) => {
                                      e.target.style.backgroundColor = "transparent";
                                    }}
                                  >
                                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                    </svg>
                                    Editar lista
                                  </button>
                                  <button
                                    onClick={() => {
                                      deleteList(currentList.id);
                                      setShowListActions(null);
                                    }}
                                    className="flex items-center w-full px-4 py-2 text-sm transition-colors"
                                    style={{ 
                                      color: "var(--error)",
                                      textAlign: "left"
                                    }}
                                    onMouseEnter={(e) => {
                                      e.target.style.backgroundColor = "rgba(255, 0, 0, 0.1)";
                                    }}
                                    onMouseLeave={(e) => {
                                      e.target.style.backgroundColor = "transparent";
                                    }}
                                  >
                                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                    </svg>
                                    Eliminar lista
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <p 
                          className="text-sm mt-1"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          📅 {new Date(currentList.fecha).toLocaleDateString()} • {currentList.productos?.filter(p => p.comprado).length || 0} de {currentList.productos?.length || 0} productos completados
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Botón agregar producto */}
                {editingList !== currentList.id && (
                  <button
                    onClick={() => setShowAddProduct(true)}
                    className="px-4 py-2 rounded-lg text-white font-medium transition-all hover:scale-105 shadow-md"
                    style={{ backgroundColor: "var(--primary)" }}
                  >
                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                    Agregar Producto
                  </button>
                )}
              </div>

              {/* Progreso de la lista */}
              {currentList.productos && currentList.productos.length > 0 && (
                <div 
                  className="rounded-lg p-4"
                  style={{ backgroundColor: "var(--surface)" }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span 
                      className="text-sm font-medium"
                      style={{ color: "var(--foreground)" }}
                    >
                      Progreso de la lista
                    </span>
                    <span 
                      className="text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {Math.round((currentList.productos.filter(p => p.comprado).length / currentList.productos.length) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        backgroundColor: "var(--success)",
                        width: `${(currentList.productos.filter(p => p.comprado).length / currentList.productos.length) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Lista de productos agrupada por supermercado */}
              {currentList.productos && currentList.productos.length > 0 ? (
                <div className="space-y-6">
                  {/* Agrupar productos por supermercado */}
                  {Object.entries(
                    currentList.productos.reduce((groups, item) => {
                      const supermarket = item.productos.supermercados?.nombre || 'Sin supermercado';
                      if (!groups[supermarket]) groups[supermarket] = [];
                      groups[supermarket].push(item);
                      return groups;
                    }, {})
                  ).map(([supermarket, items]) => (
                    <div key={supermarket} className="space-y-3">
                      {/* Header del supermercado - responsive */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-opacity-50 rounded-lg p-3" style={{ backgroundColor: "var(--background)" }}>
                        <h3 
                          className="text-lg sm:text-xl font-semibold flex items-center"
                          style={{ color: "var(--foreground)" }}
                        >
                          <span className="text-xl sm:text-2xl mr-2">🏪</span>
                          <span className="break-words">{supermarket}</span>
                        </h3>
                        <div className="mt-1 sm:mt-0 flex items-center space-x-3">
                          <span 
                            className="text-sm sm:text-base font-medium px-3 py-1 rounded-full"
                            style={{ 
                              backgroundColor: "var(--primary)",
                              color: "white"
                            }}
                          >
                            {items.filter(p => p.comprado).length}/{items.length}
                          </span>
                          <span 
                            className="text-xs sm:text-sm"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {Math.round((items.filter(p => p.comprado).length / items.length) * 100)}% completado
                          </span>
                        </div>
                      </div>
                      {/* Lista de productos */}
                      <div className="space-y-2 sm:space-y-3">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className={`rounded-lg border transition-all cursor-pointer ${
                              item.comprado ? 'opacity-60' : 'hover:shadow-md'
                            }`}
                            style={{ 
                              backgroundColor: "var(--surface)",
                              borderColor: item.comprado ? "var(--success)" : "var(--border)"
                            }}
                            onClick={() => toggleProductPurchased(item.id, item.comprado)}
                          >
                            {/* Layout responsive: mobile vs desktop */}
                            <div className="p-3 sm:p-4">
                              {/* Header del producto - siempre visible */}
                              <div className="flex items-start space-x-3">
                                {/* Checkbox */}
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                  item.comprado ? 'bg-green-500 border-green-500' : 'border-gray-300'
                                }`}>
                                  {item.comprado && (
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                  )}
                                </div>
                                
                                {/* Contenido principal */}
                                <div className="flex-1 min-w-0">
                                  {/* Nombre del producto */}
                                  <h4 
                                    className={`font-medium text-base sm:text-lg leading-tight ${item.comprado ? 'line-through' : ''}`}
                                    style={{ color: "var(--foreground)" }}
                                  >
                                    {item.productos.nombre}
                                  </h4>
                                  
                                  {/* Información principal - Layout responsive */}
                                  <div className="mt-2 space-y-1 sm:space-y-0">
                                    {/* Primera línea: Cantidad + Categoría */}
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                                      <span className="flex items-center">
                                        <span className="mr-1">📦</span>
                                        <span className="font-medium">Cantidad:</span>
                                        <span className="ml-1">{item.cantidad}</span>
                                      </span>
                                      {item.productos.categorias && (
                                        <span className="flex items-center">
                                          <span className="mr-1">📂</span>
                                          <span>{item.productos.categorias.nombre}</span>
                                        </span>
                                      )}
                                    </div>
                                    
                                    {/* Segunda línea: Ubicación (solo si existe) */}
                                    {(item.productos.estante || item.productos.cara) && (
                                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                                        {item.productos.estante && (
                                          <span className="flex items-center">
                                            <span className="mr-1">📍</span>
                                            <span>Estante {item.productos.estante}</span>
                                          </span>
                                        )}
                                        {item.productos.cara && (
                                          <span className="flex items-center">
                                            <span className="mr-1">👉</span>
                                            <span>{item.productos.cara}</span>
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Descripción (si existe) */}
                                  {item.productos.descripcion && (
                                    <p 
                                      className="text-sm mt-2 leading-relaxed"
                                      style={{ color: "var(--text-muted)" }}
                                    >
                                      {item.productos.descripcion}
                                    </p>
                                  )}
                                </div>
                                
                                {/* Indicador de estado */}
                                <div className="flex-shrink-0 text-right">
                                  {item.comprado ? (
                                    <div className="text-center">
                                      <div className="text-green-500 text-lg sm:text-xl">✓</div>
                                      <span className="text-green-500 text-xs font-medium block sm:hidden">Listo</span>
                                      <span className="text-green-500 text-sm font-medium hidden sm:block">Listo</span>
                                    </div>
                                  ) : (
                                    <div className="text-center">
                                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-dashed mx-auto mb-1" style={{ borderColor: "var(--text-muted)" }}></div>
                                      <span style={{ color: "var(--text-muted)" }} className="text-xs sm:text-sm block">
                                        <span className="sm:hidden">Tocar</span>
                                        <span className="hidden sm:inline">Toca para marcar</span>
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-4h-2m0 0V6a2 2 0 00-2-2h-2M9 3v2M7 6V4a2 2 0 012-2h2v2" />
                  </svg>
                  <h3 className="text-lg font-medium mb-2" style={{ color: "var(--foreground)" }}>
                    Lista vacía
                  </h3>
                  <p style={{ color: "var(--text-secondary)" }} className="mb-4">
                    Agrega productos para comenzar tu lista de compras
                  </p>
                  <button
                    onClick={() => setShowAddProduct(true)}
                    className="px-4 py-2 rounded-md text-white"
                    style={{ backgroundColor: "var(--primary)" }}
                  >
                    Agregar Primer Producto
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Modal para agregar productos */}
          {showAddProduct && currentList && (
            <AddProductToList
              listId={currentList.id}
              user={user}
              onProductAdded={async () => {
                // Recargar productos de la lista
                const updatedProducts = await loadListProducts(currentList.id);
                setCurrentList({ ...currentList, productos: updatedProducts });
                setShowAddProduct(false);
              }}
              onClose={() => setShowAddProduct(false)}
            />
          )}

          {/* Modal de configuración */}
          {showSettings && (
            <SettingsModal
              user={user}
              onClose={() => setShowSettings(false)}
            />
          )}
        </div>
      </main>
    </div>
  );
}
