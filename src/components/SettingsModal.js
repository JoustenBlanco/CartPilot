"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAlertHelpers } from "@/hooks/useAlertHelpers";

export default function SettingsModal({ user, onClose }) {
  const alerts = useAlertHelpers();
  const alertsRef = useRef(alerts);
  
  // Actualizar la referencia cuando cambie alerts
  useEffect(() => {
    alertsRef.current = alerts;
  }, [alerts]);
  
  const [activeTab, setActiveTab] = useState("categories"); // 'categories' | 'supermarkets' | 'products'
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
    foto_url: "",
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
        .from("categorias")
        .select("*")
        .eq("user_id", user.id)
        .order("nombre");

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error cargando categorías:", error);
      alertsRef.current.error("Error al cargar las categorías");
    }
  }, [user]);

  // Cargar supermercados
  const loadSupermarkets = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("supermercados")
        .select("*")
        .eq("user_id", user.id)
        .order("nombre");

      if (error) throw error;
      setSupermarkets(data || []);
    } catch (error) {
      console.error("Error cargando supermercados:", error);
      alertsRef.current.error("Error al cargar los supermercados");
    }
  }, [user]);

  // Cargar productos
  const loadProducts = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("productos")
        .select(
          `
          *,
          categorias (nombre),
          supermercados (nombre)
        `
        )
        .eq("user_id", user.id)
        .order("nombre");

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error cargando productos:", error);
      alertsRef.current.error("Error al cargar los productos");
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
      const { error } = await supabase.from("categorias").insert([
        {
          nombre: newCategoryName.trim(),
          user_id: user.id,
        },
      ]);

      if (error) throw error;

      setNewCategoryName("");
      alertsRef.current.success("Categoría creada exitosamente");
      loadCategories();
    } catch (error) {
      console.error("Error creando categoría:", error);
      alertsRef.current.error("Error al crear la categoría");
    } finally {
      setLoading(false);
    }
  };

  // Crear supermercado
  const createSupermarket = async () => {
    if (!newSupermarketName.trim() || !user) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("supermercados").insert([
        {
          nombre: newSupermarketName.trim(),
          user_id: user.id,
        },
      ]);

      if (error) throw error;

      setNewSupermarketName("");
      alertsRef.current.success("Supermercado creado exitosamente");
      loadSupermarkets();
    } catch (error) {
      console.error("Error creando supermercado:", error);
      alertsRef.current.error("Error al crear el supermercado");
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
        .from("categorias")
        .update({ nombre: newName.trim() })
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      setEditingCategory(null);
      alertsRef.current.success("Categoría actualizada exitosamente");
      loadCategories();
    } catch (error) {
      console.error("Error actualizando categoría:", error);
      alertsRef.current.error("Error al actualizar la categoría");
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
        .from("supermercados")
        .update({ nombre: newName.trim() })
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      setEditingSupermarket(null);
      alertsRef.current.success("Supermercado actualizado exitosamente");
      loadSupermarkets();
    } catch (error) {
      console.error("Error actualizando supermercado:", error);
      alertsRef.current.error("Error al actualizar el supermercado");
    } finally {
      setLoading(false);
    }
  };

  // Eliminar categoría
  const deleteCategory = async (id) => {
    const confirmed = await alertsRef.current.confirmDelete("esta categoría");
    if (!confirmed) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("categorias")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      alertsRef.current.success("Categoría eliminada exitosamente");
      loadCategories();
    } catch (error) {
      console.error("Error eliminando categoría:", error);
      alertsRef.current.error(
        "Error al eliminar la categoría. Puede que esté siendo usada por productos."
      );
    } finally {
      setLoading(false);
    }
  };

  // Eliminar supermercado
  const deleteSupermarket = async (id) => {
    const confirmed = await alertsRef.current.confirmDelete("este supermercado");
    if (!confirmed) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("supermercados")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      alertsRef.current.success("Supermercado eliminado exitosamente");
      loadSupermarkets();
    } catch (error) {
      console.error("Error eliminando supermercado:", error);
      alertsRef.current.error(
        "Error al eliminar el supermercado. Puede que esté siendo usado por productos."
      );
    } finally {
      setLoading(false);
    }
  };

  // === FUNCIONES PARA PRODUCTOS ===

  // Crear producto
  const createProduct = async () => {
    // Validaciones obligatorias
    if (!newProduct.nombre.trim()) {
      alertsRef.current.warning("El nombre del producto es obligatorio");
      return;
    }
    
    if (!newProduct.categoria_id) {
      alertsRef.current.warning("Debe seleccionar una categoría para el producto");
      return;
    }
    
    if (!newProduct.supermercado_id) {
      alertsRef.current.warning("Debe seleccionar un supermercado para el producto");
      return;
    }
    
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("productos").insert([
        {
          nombre: newProduct.nombre.trim(),
          descripcion: newProduct.descripcion.trim() || null,
          categoria_id: newProduct.categoria_id,
          supermercado_id: newProduct.supermercado_id,
          estante: newProduct.estante.trim() || null,
          cara: newProduct.cara.trim() || null,
          foto_url: newProduct.foto_url.trim() || null,
          user_id: user.id,
        },
      ]);

      if (error) throw error;

      setNewProduct({
        nombre: "",
        descripcion: "",
        categoria_id: "",
        supermercado_id: "",
        estante: "",
        cara: "",
        foto_url: "",
      });
      alertsRef.current.success("Producto creado exitosamente");
      loadProducts();
    } catch (error) {
      console.error("Error creando producto:", error);
      alertsRef.current.error("Error al crear el producto");
    } finally {
      setLoading(false);
    }
  };

  // Editar producto
  const updateProduct = async (id, updatedProduct) => {
    // Validaciones obligatorias
    if (!updatedProduct.nombre || !updatedProduct.nombre.trim()) {
      alertsRef.current.warning("El nombre del producto es obligatorio");
      return;
    }
    
    if (!updatedProduct.categoria_id) {
      alertsRef.current.warning("Debe seleccionar una categoría para el producto");
      return;
    }
    
    if (!updatedProduct.supermercado_id) {
      alertsRef.current.warning("Debe seleccionar un supermercado para el producto");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("productos")
        .update({
          nombre: updatedProduct.nombre.trim(),
          descripcion: updatedProduct.descripcion
            ? updatedProduct.descripcion.trim()
            : null,
          categoria_id: updatedProduct.categoria_id,
          supermercado_id: updatedProduct.supermercado_id,
          estante: updatedProduct.estante
            ? updatedProduct.estante.trim()
            : null,
          cara: updatedProduct.cara ? updatedProduct.cara.trim() : null,
          foto_url: updatedProduct.foto_url
            ? updatedProduct.foto_url.trim()
            : null,
        })
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      setEditingProduct(null);
      setEditingProductData({});
      alertsRef.current.success("Producto actualizado exitosamente");
      loadProducts();
    } catch (error) {
      console.error("Error actualizando producto:", error);
      alertsRef.current.error("Error al actualizar el producto");
    } finally {
      setLoading(false);
    }
  };

  // Eliminar producto
  const deleteProduct = async (id) => {
    const confirmed = await alertsRef.current.confirmDelete("este producto");
    if (!confirmed) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("productos")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      alertsRef.current.success("Producto eliminado exitosamente");
      loadProducts();
    } catch (error) {
      console.error("Error eliminando producto:", error);
      alertsRef.current.error(
        "Error al eliminar el producto. Puede que esté siendo usado en listas."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div
        className="rounded-lg p-3 sm:p-6 w-full max-w-sm sm:max-w-4xl max-h-[95vh] sm:max-h-[85vh] overflow-y-auto"
        style={{ backgroundColor: "var(--surface)" }}
      >
        {/* Header */}
        <div
          className="flex justify-between items-center mb-3 sm:mb-6 sticky top-0 z-10 py-2 -mx-3 sm:-mx-6 px-3 sm:px-6"
          style={{ backgroundColor: "var(--surface)" }}
        >
          <h2
            className="text-lg sm:text-2xl font-bold"
            style={{ color: "var(--foreground)" }}
          >
            ⚙️ Configuración
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            style={{ color: "var(--text-secondary)" }}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div
          className="flex flex-row space-x-1 mb-4 sm:mb-6 rounded-lg p-1 overflow-x-auto"
          style={{ backgroundColor: "var(--background)" }}
        >
          <button
            onClick={() => setActiveTab("categories")}
            className={`flex-shrink-0 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === "categories" ? "text-white" : ""
            }`}
            style={{
              backgroundColor:
                activeTab === "categories" ? "var(--primary)" : "transparent",
              color:
                activeTab === "categories" ? "white" : "var(--text-secondary)",
            }}
          >
            📂 Categorías
          </button>
          <button
            onClick={() => setActiveTab("supermarkets")}
            className={`flex-shrink-0 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === "supermarkets" ? "text-white" : ""
            }`}
            style={{
              backgroundColor:
                activeTab === "supermarkets" ? "var(--primary)" : "transparent",
              color:
                activeTab === "supermarkets"
                  ? "white"
                  : "var(--text-secondary)",
            }}
          >
            🏪 Supermercados
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`flex-shrink-0 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === "products" ? "text-white" : ""
            }`}
            style={{
              backgroundColor:
                activeTab === "products" ? "var(--primary)" : "transparent",
              color:
                activeTab === "products" ? "white" : "var(--text-secondary)",
            }}
          >
            📦 Productos
          </button>
        </div>

        {/* Contenido de Categorías */}
        {activeTab === "categories" && (
          <div className="space-y-4">
            {/* Agregar nueva categoría */}
            <div
              className="rounded-lg p-3 sm:p-4"
              style={{ backgroundColor: "var(--background)" }}
            >
              <h3
                className="text-base sm:text-lg font-semibold mb-3"
                style={{ color: "var(--foreground)" }}
              >
                Agregar Nueva Categoría
              </h3>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Nombre de la categoría"
                  className="flex-1 px-3 py-2 rounded-md border focus:outline-none focus:ring-2 text-sm"
                  style={{
                    backgroundColor: "var(--surface)",
                    borderColor: "var(--border)",
                    color: "var(--foreground)",
                    "--tw-ring-color": "var(--primary)",
                  }}
                  onKeyPress={(e) => e.key === "Enter" && createCategory()}
                />
                <button
                  onClick={createCategory}
                  disabled={loading || !newCategoryName.trim()}
                  className="px-4 py-2 rounded-md text-white transition-colors disabled:opacity-50 text-sm font-medium whitespace-nowrap"
                  style={{ backgroundColor: "var(--primary)" }}
                >
                  {loading ? "Creando..." : "Agregar"}
                </button>
              </div>
            </div>

            {/* Lista de categorías */}
            <div className="space-y-2">
              <h3
                className="text-base sm:text-lg font-semibold"
                style={{ color: "var(--foreground)" }}
              >
                Categorías Existentes ({categories.length})
              </h3>
              {categories.length === 0 ? (
                <p
                  className="text-center py-8 text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  No tienes categorías creadas aún
                </p>
              ) : (
                <div className="space-y-2 max-h-48 sm:max-h-60 overflow-y-auto">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-md border space-y-2 sm:space-y-0"
                      style={{
                        backgroundColor: "var(--background)",
                        borderColor: "var(--border)",
                      }}
                    >
                      {editingCategory === category.id ? (
                        <div className="flex-1 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                          <input
                            type="text"
                            defaultValue={category.nombre}
                            className="flex-1 px-2 py-1 rounded border focus:outline-none focus:ring-1 text-sm"
                            style={{
                              backgroundColor: "var(--surface)",
                              borderColor: "var(--border)",
                              color: "var(--foreground)",
                              "--tw-ring-color": "var(--primary)",
                            }}
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                updateCategory(category.id, e.target.value);
                              }
                            }}
                            autoFocus
                          />
                          <button
                            onClick={() => setEditingCategory(null)}
                            className="px-3 py-1 text-sm rounded border self-start"
                            style={{
                              borderColor: "var(--border)",
                              color: "var(--text-secondary)",
                            }}
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <>
                          <span
                            className="font-medium text-sm sm:text-base"
                            style={{ color: "var(--foreground)" }}
                          >
                            📂 {category.nombre}
                          </span>
                          <div className="flex gap-2 self-end sm:self-center">
                            <button
                              onClick={() => setEditingCategory(category.id)}
                              className="p-3 rounded-md transition-colors"
                              style={{
                                backgroundColor: "var(--primary)",
                                color: "white",
                              }}
                              title="Editar categoría"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                ></path>
                              </svg>
                            </button>
                            <button
                              onClick={() => deleteCategory(category.id)}
                              className="p-3 rounded-md transition-colors"
                              style={{
                                backgroundColor: "var(--error)",
                                color: "white",
                              }}
                              title="Eliminar categoría"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                ></path>
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
        {activeTab === "supermarkets" && (
          <div className="space-y-4">
            {/* Agregar nuevo supermercado */}
            <div
              className="rounded-lg p-3 sm:p-4"
              style={{ backgroundColor: "var(--background)" }}
            >
              <h3
                className="text-base sm:text-lg font-semibold mb-3"
                style={{ color: "var(--foreground)" }}
              >
                Agregar Nuevo Supermercado
              </h3>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <input
                  type="text"
                  value={newSupermarketName}
                  onChange={(e) => setNewSupermarketName(e.target.value)}
                  placeholder="Nombre del supermercado"
                  className="flex-1 px-3 py-2 rounded-md border focus:outline-none focus:ring-2 text-sm"
                  style={{
                    backgroundColor: "var(--surface)",
                    borderColor: "var(--border)",
                    color: "var(--foreground)",
                    "--tw-ring-color": "var(--primary)",
                  }}
                  onKeyPress={(e) => e.key === "Enter" && createSupermarket()}
                />
                <button
                  onClick={createSupermarket}
                  disabled={loading || !newSupermarketName.trim()}
                  className="px-4 py-2 rounded-md text-white transition-colors disabled:opacity-50 text-sm font-medium whitespace-nowrap"
                  style={{ backgroundColor: "var(--primary)" }}
                >
                  {loading ? "Creando..." : "Agregar"}
                </button>
              </div>
            </div>

            {/* Lista de supermercados */}
            <div className="space-y-2">
              <h3
                className="text-base sm:text-lg font-semibold"
                style={{ color: "var(--foreground)" }}
              >
                Supermercados Existentes ({supermarkets.length})
              </h3>
              {supermarkets.length === 0 ? (
                <p
                  className="text-center py-8 text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  No tienes supermercados creados aún
                </p>
              ) : (
                <div className="space-y-2 max-h-48 sm:max-h-60 overflow-y-auto">
                  {supermarkets.map((supermarket) => (
                    <div
                      key={supermarket.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-md border space-y-2 sm:space-y-0"
                      style={{
                        backgroundColor: "var(--background)",
                        borderColor: "var(--border)",
                      }}
                    >
                      {editingSupermarket === supermarket.id ? (
                        <div className="flex-1 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                          <input
                            type="text"
                            defaultValue={supermarket.nombre}
                            className="flex-1 px-2 py-1 rounded border focus:outline-none focus:ring-1 text-sm"
                            style={{
                              backgroundColor: "var(--surface)",
                              borderColor: "var(--border)",
                              color: "var(--foreground)",
                              "--tw-ring-color": "var(--primary)",
                            }}
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                updateSupermarket(
                                  supermarket.id,
                                  e.target.value
                                );
                              }
                            }}
                            autoFocus
                          />
                          <button
                            onClick={() => setEditingSupermarket(null)}
                            className="px-3 py-1 text-sm rounded border self-start"
                            style={{
                              borderColor: "var(--border)",
                              color: "var(--text-secondary)",
                            }}
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <>
                          <span
                            className="font-medium text-sm sm:text-base"
                            style={{ color: "var(--foreground)" }}
                          >
                            🏪 {supermarket.nombre}
                          </span>
                          <div className="flex gap-2 self-end sm:self-center">
                            <button
                              onClick={() =>
                                setEditingSupermarket(supermarket.id)
                              }
                              className="p-3 rounded-md transition-colors"
                              style={{
                                backgroundColor: "var(--primary)",
                                color: "white",
                              }}
                              title="Editar supermercado"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                ></path>
                              </svg>
                            </button>
                            <button
                              onClick={() => deleteSupermarket(supermarket.id)}
                              className="p-3 rounded-md transition-colors"
                              style={{
                                backgroundColor: "var(--error)",
                                color: "white",
                              }}
                              title="Eliminar supermercado"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                ></path>
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
        {activeTab === "products" && (
          <div className="space-y-6">
            {/* Formulario para crear producto */}
            <div
              className="rounded-lg p-4 sm:p-5"
              style={{ backgroundColor: "var(--background)" }}
            >
              <h3
                className="text-base sm:text-lg font-semibold mb-4"
                style={{ color: "var(--foreground)" }}
              >
                Crear Nuevo Producto
              </h3>

              <div className="space-y-4">
                {/* Nombre del producto - Campo principal */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--foreground)" }}
                  >
                    Nombre del producto *
                  </label>
                  <input
                    type="text"
                    value={newProduct.nombre}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, nombre: e.target.value })
                    }
                    placeholder="Ej: Leche entera"
                    className="w-full px-3 py-3 rounded-md border focus:outline-none focus:ring-2 text-sm"
                    style={{
                      backgroundColor: "var(--surface)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                      "--tw-ring-color": "var(--primary)",
                    }}
                    onKeyPress={(e) => e.key === "Enter" && createProduct()}
                  />
                </div>

                {/* Descripción */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--foreground)" }}
                  >
                    Descripción
                  </label>
                  <input
                    type="text"
                    value={newProduct.descripcion}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        descripcion: e.target.value,
                      })
                    }
                    placeholder="Ej: 1 litro, marca X"
                    className="w-full px-3 py-3 rounded-md border focus:outline-none focus:ring-2 text-sm"
                    style={{
                      backgroundColor: "var(--surface)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                      "--tw-ring-color": "var(--primary)",
                    }}
                  />
                </div>

                {/* Categoría y Supermercado */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: "var(--foreground)" }}
                    >
                      Categoría *
                    </label>
                    <select
                      value={newProduct.categoria_id}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          categoria_id: e.target.value,
                        })
                      }
                      className="w-full px-3 py-3 rounded-md border focus:outline-none focus:ring-2 text-sm"
                      style={{
                        backgroundColor: "var(--surface)",
                        borderColor: "var(--border)",
                        color: "var(--foreground)",
                        "--tw-ring-color": "var(--primary)",
                      }}
                    >
                      <option value="">Seleccionar categoría</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: "var(--foreground)" }}
                    >
                      Supermercado *
                    </label>
                    <select
                      value={newProduct.supermercado_id}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          supermercado_id: e.target.value,
                        })
                      }
                      className="w-full px-3 py-3 rounded-md border focus:outline-none focus:ring-2 text-sm"
                      style={{
                        backgroundColor: "var(--surface)",
                        borderColor: "var(--border)",
                        color: "var(--foreground)",
                        "--tw-ring-color": "var(--primary)",
                      }}
                    >
                      <option value="">Seleccionar supermercado</option>
                      {supermarkets.map((supermarket) => (
                        <option key={supermarket.id} value={supermarket.id}>
                          {supermarket.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Ubicación en el supermercado */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: "var(--foreground)" }}
                    >
                      Estante
                    </label>
                    <input
                      type="text"
                      value={newProduct.estante}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          estante: e.target.value,
                        })
                      }
                      placeholder="Ej: A1, B3, Refrigerado"
                      className="w-full px-3 py-3 rounded-md border focus:outline-none focus:ring-2 text-sm"
                      style={{
                        backgroundColor: "var(--surface)",
                        borderColor: "var(--border)",
                        color: "var(--foreground)",
                        "--tw-ring-color": "var(--primary)",
                      }}
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: "var(--foreground)" }}
                    >
                      Ubicación específica
                    </label>
                    <input
                      type="text"
                      value={newProduct.cara}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, cara: e.target.value })
                      }
                      placeholder="Ej: Izquierda, Centro, Arriba"
                      className="w-full px-3 py-3 rounded-md border focus:outline-none focus:ring-2 text-sm"
                      style={{
                        backgroundColor: "var(--surface)",
                        borderColor: "var(--border)",
                        color: "var(--foreground)",
                        "--tw-ring-color": "var(--primary)",
                      }}
                    />
                  </div>
                </div>

                {/* URL de imagen */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--foreground)" }}
                  >
                    URL de la imagen (opcional)
                  </label>
                  <input
                    type="url"
                    value={newProduct.foto_url}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, foto_url: e.target.value })
                    }
                    placeholder="https://ejemplo.com/imagen.jpg"
                    className="w-full px-3 py-3 rounded-md border focus:outline-none focus:ring-2 text-sm"
                    style={{
                      backgroundColor: "var(--surface)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                      "--tw-ring-color": "var(--primary)",
                    }}
                  />
                </div>
              </div>

              {/* Mensaje informativo sobre campos obligatorios */}
              <div className="mt-4 p-3 rounded-md border-l-4 text-sm" 
                style={{ 
                  backgroundColor: "var(--background)", 
                  borderLeftColor: "var(--primary)",
                  color: "var(--text-secondary)"
                }}>
                <p>📝 Los campos marcados con asterisco (*) son obligatorios para crear un producto.</p>
              </div>

              <button
                onClick={createProduct}
                disabled={
                  !newProduct.nombre.trim() || 
                  !newProduct.categoria_id || 
                  !newProduct.supermercado_id || 
                  loading
                }
                className="mt-6 w-full sm:w-auto px-6 py-3 rounded-md text-white font-medium transition-colors disabled:opacity-50 text-sm"
                style={{ backgroundColor: "var(--primary)" }}
              >
                {loading ? "Creando..." : "Crear Producto"}
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
                <div
                  className="text-center py-8 rounded-lg"
                  style={{
                    backgroundColor: "var(--background)",
                    color: "var(--text-secondary)",
                  }}
                >
                  <div className="text-2xl mb-2">📦</div>
                  <p>No tienes productos creados aún</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="rounded-lg border overflow-hidden"
                      style={{
                        backgroundColor: "var(--background)",
                        borderColor: "var(--border)",
                      }}
                    >
                      {editingProduct === product.id ? (
                        <div className="p-4">
                          <div className="space-y-4">
                            {/* Campos de edición con mejor espaciado */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              <div>
                                <label
                                  className="block text-sm font-medium mb-2"
                                  style={{ color: "var(--foreground)" }}
                                >
                                  Nombre *
                                </label>
                                <input
                                  type="text"
                                  value={
                                    editingProductData.nombre ||
                                    product.nombre ||
                                    ""
                                  }
                                  onChange={(e) =>
                                    setEditingProductData({
                                      ...editingProductData,
                                      nombre: e.target.value,
                                    })
                                  }
                                  className="w-full px-3 py-2 rounded border text-sm"
                                  style={{
                                    backgroundColor: "var(--surface)",
                                    borderColor: "var(--border)",
                                    color: "var(--foreground)",
                                  }}
                                />
                              </div>
                              <div>
                                <label
                                  className="block text-sm font-medium mb-2"
                                  style={{ color: "var(--foreground)" }}
                                >
                                  Descripción
                                </label>
                                <input
                                  type="text"
                                  value={
                                    editingProductData.descripcion !== undefined
                                      ? editingProductData.descripcion
                                      : product.descripcion || ""
                                  }
                                  onChange={(e) =>
                                    setEditingProductData({
                                      ...editingProductData,
                                      descripcion: e.target.value,
                                    })
                                  }
                                  placeholder="Ej: 1 litro, marca X"
                                  className="w-full px-3 py-2 rounded border text-sm"
                                  style={{
                                    backgroundColor: "var(--surface)",
                                    borderColor: "var(--border)",
                                    color: "var(--foreground)",
                                  }}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              <div>
                                <label
                                  className="block text-sm font-medium mb-2"
                                  style={{ color: "var(--foreground)" }}
                                >
                                  Categoría *
                                </label>
                                <select
                                  value={
                                    editingProductData.categoria_id !==
                                    undefined
                                      ? editingProductData.categoria_id
                                      : product.categoria_id || ""
                                  }
                                  onChange={(e) =>
                                    setEditingProductData({
                                      ...editingProductData,
                                      categoria_id: e.target.value,
                                    })
                                  }
                                  className="w-full px-3 py-2 rounded border text-sm"
                                  style={{
                                    backgroundColor: "var(--surface)",
                                    borderColor: "var(--border)",
                                    color: "var(--foreground)",
                                  }}
                                >
                                  <option value="">Seleccionar categoría</option>
                                  {categories.map((category) => (
                                    <option
                                      key={category.id}
                                      value={category.id}
                                    >
                                      {category.nombre}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label
                                  className="block text-sm font-medium mb-2"
                                  style={{ color: "var(--foreground)" }}
                                >
                                  Supermercado *
                                </label>
                                <select
                                  value={
                                    editingProductData.supermercado_id !==
                                    undefined
                                      ? editingProductData.supermercado_id
                                      : product.supermercado_id || ""
                                  }
                                  onChange={(e) =>
                                    setEditingProductData({
                                      ...editingProductData,
                                      supermercado_id: e.target.value,
                                    })
                                  }
                                  className="w-full px-3 py-2 rounded border text-sm"
                                  style={{
                                    backgroundColor: "var(--surface)",
                                    borderColor: "var(--border)",
                                    color: "var(--foreground)",
                                  }}
                                >
                                  <option value="">Seleccionar supermercado</option>
                                  {supermarkets.map((supermarket) => (
                                    <option
                                      key={supermarket.id}
                                      value={supermarket.id}
                                    >
                                      {supermarket.nombre}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              <div>
                                <label
                                  className="block text-sm font-medium mb-2"
                                  style={{ color: "var(--foreground)" }}
                                >
                                  Estante
                                </label>
                                <input
                                  type="text"
                                  value={
                                    editingProductData.estante !== undefined
                                      ? editingProductData.estante
                                      : product.estante || ""
                                  }
                                  onChange={(e) =>
                                    setEditingProductData({
                                      ...editingProductData,
                                      estante: e.target.value,
                                    })
                                  }
                                  placeholder="Ej: A1, B3, Refrigerado"
                                  className="w-full px-3 py-2 rounded border text-sm"
                                  style={{
                                    backgroundColor: "var(--surface)",
                                    borderColor: "var(--border)",
                                    color: "var(--foreground)",
                                  }}
                                />
                              </div>
                              <div>
                                <label
                                  className="block text-sm font-medium mb-2"
                                  style={{ color: "var(--foreground)" }}
                                >
                                  Ubicación específica
                                </label>
                                <input
                                  type="text"
                                  value={
                                    editingProductData.cara !== undefined
                                      ? editingProductData.cara
                                      : product.cara || ""
                                  }
                                  onChange={(e) =>
                                    setEditingProductData({
                                      ...editingProductData,
                                      cara: e.target.value,
                                    })
                                  }
                                  placeholder="Ej: Izquierda, Centro, Arriba"
                                  className="w-full px-3 py-2 rounded border text-sm"
                                  style={{
                                    backgroundColor: "var(--surface)",
                                    borderColor: "var(--border)",
                                    color: "var(--foreground)",
                                  }}
                                />
                              </div>
                            </div>

                            <div>
                              <label
                                className="block text-sm font-medium mb-2"
                                style={{ color: "var(--foreground)" }}
                              >
                                URL de imagen
                              </label>
                              <input
                                type="url"
                                value={
                                  editingProductData.foto_url !== undefined
                                    ? editingProductData.foto_url
                                    : product.foto_url || ""
                                }
                                onChange={(e) =>
                                  setEditingProductData({
                                    ...editingProductData,
                                    foto_url: e.target.value,
                                  })
                                }
                                placeholder="https://ejemplo.com/imagen.jpg"
                                className="w-full px-3 py-2 rounded border text-sm"
                                style={{
                                  backgroundColor: "var(--surface)",
                                  borderColor: "var(--border)",
                                  color: "var(--foreground)",
                                }}
                              />
                            </div>
                          </div>

                          {/* Botones de acción más grandes y accesibles */}
                          <div
                            className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t"
                            style={{ borderColor: "var(--border)" }}
                          >
                            <button
                              onClick={() => {
                                const dataToUpdate = {
                                  nombre:
                                    editingProductData.nombre !== undefined
                                      ? editingProductData.nombre
                                      : product.nombre,
                                  descripcion:
                                    editingProductData.descripcion !== undefined
                                      ? editingProductData.descripcion
                                      : product.descripcion,
                                  categoria_id:
                                    editingProductData.categoria_id !==
                                    undefined
                                      ? editingProductData.categoria_id
                                      : product.categoria_id,
                                  supermercado_id:
                                    editingProductData.supermercado_id !==
                                    undefined
                                      ? editingProductData.supermercado_id
                                      : product.supermercado_id,
                                  estante:
                                    editingProductData.estante !== undefined
                                      ? editingProductData.estante
                                      : product.estante,
                                  cara:
                                    editingProductData.cara !== undefined
                                      ? editingProductData.cara
                                      : product.cara,
                                  foto_url:
                                    editingProductData.foto_url !== undefined
                                      ? editingProductData.foto_url
                                      : product.foto_url,
                                };
                                updateProduct(product.id, dataToUpdate);
                              }}
                              className="flex-1 sm:flex-none px-6 py-3 rounded-md text-white font-medium transition-colors"
                              style={{ backgroundColor: "var(--primary)" }}
                            >
                              ✓ Guardar Cambios
                            </button>
                            <button
                              onClick={() => {
                                setEditingProduct(null);
                                setEditingProductData({});
                              }}
                              className="flex-1 sm:flex-none px-6 py-3 rounded-md border font-medium transition-colors"
                              style={{
                                borderColor: "var(--border)",
                                color: "var(--text-secondary)",
                                backgroundColor: "var(--surface)",
                              }}
                            >
                              ✕ Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4">
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start flex-col sm:flex-row sm:items-center gap-2 mb-3">
                                <h4
                                  className="font-semibold text-base truncate"
                                  style={{ color: "var(--foreground)" }}
                                >
                                  {product.nombre}
                                </h4>
                                {product.descripcion && (
                                  <span
                                    className="text-sm opacity-75 break-words"
                                    style={{ color: "var(--text-secondary)" }}
                                  >
                                    {product.descripcion}
                                  </span>
                                )}
                              </div>

                              {/* Información organizada en badges */}
                              <div className="flex flex-wrap gap-2 text-xs">
                                {product.categorias && (
                                  <span
                                    className="px-2 py-1 rounded-full border"
                                    style={{
                                      backgroundColor: "var(--surface)",
                                      borderColor: "var(--border)",
                                      color: "var(--text-secondary)",
                                    }}
                                  >
                                    📂 {product.categorias.nombre}
                                  </span>
                                )}
                                {product.supermercados && (
                                  <span
                                    className="px-2 py-1 rounded-full border"
                                    style={{
                                      backgroundColor: "var(--surface)",
                                      borderColor: "var(--border)",
                                      color: "var(--text-secondary)",
                                    }}
                                  >
                                    🏪 {product.supermercados.nombre}
                                  </span>
                                )}
                                {product.estante && (
                                  <span
                                    className="px-2 py-1 rounded-full border"
                                    style={{
                                      backgroundColor: "var(--surface)",
                                      borderColor: "var(--border)",
                                      color: "var(--text-secondary)",
                                    }}
                                  >
                                    📍 {product.estante}
                                  </span>
                                )}
                                {product.cara && (
                                  <span
                                    className="px-2 py-1 rounded-full border"
                                    style={{
                                      backgroundColor: "var(--surface)",
                                      borderColor: "var(--border)",
                                      color: "var(--text-secondary)",
                                    }}
                                  >
                                    👉 {product.cara}
                                  </span>
                                )}
                                {product.foto_url && (
                                  <span
                                    className="px-2 py-1 rounded-full border"
                                    style={{
                                      backgroundColor: "var(--surface)",
                                      borderColor: "var(--border)",
                                      color: "var(--text-secondary)",
                                    }}
                                  >
                                    🖼️ Con imagen
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Botones de acción mejorados */}
                            <div className="flex gap-2 shrink-0">
                              <button
                                onClick={() => {
                                  setEditingProduct(product.id);
                                  setEditingProductData({
                                    nombre: product.nombre || "",
                                    descripcion: product.descripcion || "",
                                    categoria_id: product.categoria_id || "",
                                    supermercado_id:
                                      product.supermercado_id || "",
                                    estante: product.estante || "",
                                    cara: product.cara || "",
                                    foto_url: product.foto_url || "",
                                  });
                                }}
                                className="p-3 rounded-md transition-colors"
                                style={{
                                  backgroundColor: "var(--primary)",
                                  color: "white",
                                }}
                                title="Editar producto"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  ></path>
                                </svg>
                              </button>
                              <button
                                onClick={() => deleteProduct(product.id)}
                                className="p-3 rounded-md transition-colors"
                                style={{
                                  backgroundColor: "var(--error)",
                                  color: "white",
                                }}
                                title="Eliminar producto"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  ></path>
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
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
