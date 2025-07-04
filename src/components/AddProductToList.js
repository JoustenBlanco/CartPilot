"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAlertHelpers } from "@/hooks/useAlertHelpers";
import { 
  convertToStorageValue, 
  validateQuantity, 
  getMinValue, 
  getStep, 
  formatQuantity,
  addQuantity,
  subtractQuantity
} from "@/lib/quantity-helpers";

export default function AddProductToList({ listId, onProductAdded, onClose, user }) {
  const alerts = useAlertHelpers();
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newProductName, setNewProductName] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [categories, setCategories] = useState([]);
  const [supermarkets, setSupermarkets] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('unidades'); // 'unidades' o 'kg'

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const [productsRes, categoriesRes, supermarketsRes] = await Promise.all([
        supabase.from('productos').select(`
          *,
          categorias (nombre),
          supermercados (nombre)
        `).eq('user_id', user.id),
        supabase.from('categorias').select('*').eq('user_id', user.id),
        supabase.from('supermercados').select('*').eq('user_id', user.id)
      ]);

      setProducts(productsRes.data || []);
      setCategories(categoriesRes.data || []);
      setSupermarkets(supermarketsRes.data || []);
    } catch (error) {
      console.error('Error cargando datos:', error);
      alerts.error('Error al cargar los datos. Por favor, intenta de nuevo.');
    }
  }, [user, alerts]);

  // Cargar productos, categorías y supermercados
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtrar productos basado en búsqueda
  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = products.filter(product =>
        product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
    }
  }, [searchTerm, products]);

  // Seleccionar producto para agregar (mostrar modal de cantidad)
  const selectProduct = (product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setUnit('unidades'); // Reset unit to default
  };

  // Cancelar selección de producto
  const cancelProductSelection = () => {
    setSelectedProduct(null);
    setQuantity(1);
    setUnit('unidades'); // Reset unit to default
  };

  // Confirmar agregar producto con cantidad
  const confirmAddProduct = async () => {
    if (selectedProduct && quantity > 0) {
      await addProductToList(selectedProduct.id, quantity, unit);
      setSelectedProduct(null);
      setQuantity(1);
      setUnit('unidades'); // Reset unit to default
    }
  };

  // Agregar producto existente a la lista
  const addProductToList = async (productId, quantity = 1, unit = 'unidades') => {
    setLoading(true);
    try {
      // Validar cantidad
      if (!validateQuantity(quantity, unit)) {
        alerts.warning(`La cantidad debe estar entre ${getMinValue(unit)} y ${unit === 'kg' ? '999.9' : '9999'}`);
        return;
      }

      // Convertir cantidad para almacenar
      const storageQuantity = convertToStorageValue(quantity, unit);
      
      const { error } = await supabase
        .from('lista_productos')
        .insert([{
          lista_id: listId,
          producto_id: productId,
          cantidad: storageQuantity,
          comprado: false
        }]);

      if (error) throw error;
      
      alerts.success(`Producto agregado correctamente a la lista (${formatQuantity(storageQuantity)})`);
      onProductAdded && onProductAdded();
      setSearchTerm("");
      setFilteredProducts([]);
    } catch (error) {
      console.error('Error agregando producto:', error);
      alerts.error('Error al agregar el producto. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Crear nuevo producto y agregarlo a la lista
  const createAndAddProduct = async (productData) => {
    setLoading(true);
    try {
      // Crear producto
      const { data: newProduct, error: productError } = await supabase
        .from('productos')
        .insert([productData])
        .select(`
          *,
          categorias (nombre),
          supermercados (nombre)
        `)
        .single();

      if (productError) throw productError;

      // Mostrar modal de cantidad para el nuevo producto
      setSelectedProduct(newProduct);
      setQuantity(1);
      setUnit('unidades'); // Reset unit to default
      
      setShowCreateForm(false);
      setNewProductName("");
      alerts.success('Nuevo producto creado correctamente');
    } catch (error) {
      console.error('Error creando producto:', error);
      alerts.error('Error al crear el producto. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className="rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto"
        style={{ backgroundColor: "var(--surface)" }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 
            className="text-xl font-bold"
            style={{ color: "var(--foreground)" }}
          >
            Agregar Producto
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

        {!showCreateForm ? (
          <>
            {/* Búsqueda */}
            <div className="mb-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar producto..."
                className="w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2"
                style={{ 
                  backgroundColor: "var(--background)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                  "--tw-ring-color": "var(--primary)"
                }}
              />
            </div>

            {/* Lista de productos encontrados */}
            {filteredProducts.length > 0 && (
              <div className="mb-4 space-y-2 max-h-60 overflow-y-auto">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="p-3 rounded-md border cursor-pointer hover:shadow-md transition-all"
                    style={{ 
                      backgroundColor: "var(--background)",
                      borderColor: "var(--border)"
                    }}
                    onClick={() => selectProduct(product)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 
                          className="font-medium"
                          style={{ color: "var(--foreground)" }}
                        >
                          {product.nombre}
                        </h3>
                        {product.descripcion && (
                          <p 
                            className="text-sm mt-1"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {product.descripcion}
                          </p>
                        )}
                        <div className="flex space-x-4 text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                          {product.categorias && (
                            <span>📂 {product.categorias.nombre}</span>
                          )}
                          {product.supermercados && (
                            <span>🏪 {product.supermercados.nombre}</span>
                          )}
                          {product.estante && (
                            <span>📍 Estante {product.estante}</span>
                          )}
                        </div>
                      </div>
                      <svg className="w-5 h-5 ml-2" style={{ color: "var(--primary)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Opción para crear nuevo producto */}
            {searchTerm && filteredProducts.length === 0 && (
              <div className="text-center py-4">
                <p 
                  className="text-sm mb-3"
                  style={{ color: "var(--text-secondary)" }}
                >
                  No se encontró &ldquo;{searchTerm}&rdquo;
                </p>
                <button
                  onClick={() => {
                    setNewProductName(searchTerm);
                    setShowCreateForm(true);
                  }}
                  className="px-4 py-2 rounded-md text-white transition-colors"
                  style={{ backgroundColor: "var(--primary)" }}
                >
                  Crear nuevo producto &ldquo;{searchTerm}&rdquo;
                </button>
              </div>
            )}

            {/* Instrucciones */}
            {!searchTerm && (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p style={{ color: "var(--text-secondary)" }}>
                  Busca un producto existente o escribe el nombre de uno nuevo
                </p>
              </div>
            )}
          </>
        ) : (
          /* Formulario de crear producto */
          <CreateProductForm
            initialName={newProductName}
            categories={categories}
            supermarkets={supermarkets}
            onSubmit={createAndAddProduct}
            onCancel={() => {
              setShowCreateForm(false);
              setNewProductName("");
            }}
            loading={loading}
            user={user}
          />
        )}
      </div>

      {/* Modal de cantidad */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div 
            className="rounded-lg p-6 w-full max-w-sm"
            style={{ backgroundColor: "var(--surface)" }}
          >
            <div className="text-center">
              <h3 
                className="text-lg font-semibold mb-2"
                style={{ color: "var(--foreground)" }}
              >
                Agregar a la lista
              </h3>
              <p 
                className="text-sm mb-4"
                style={{ color: "var(--text-secondary)" }}
              >
                {selectedProduct.nombre}
              </p>
              
              <div className="mb-6">
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--foreground)" }}
                >
                  ¿Qué cantidad necesitas?
                </label>
                
                {/* Selector de unidades */}
                <div className="flex justify-center space-x-2 mb-4">
                  <button
                    onClick={() => {
                      setUnit('unidades');
                      setQuantity(Math.max(1, Math.round(quantity)));
                    }}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      unit === 'unidades' 
                        ? 'text-white shadow-md' 
                        : 'border hover:bg-gray-50'
                    }`}
                    style={{ 
                      backgroundColor: unit === 'unidades' ? "var(--primary)" : "transparent",
                      borderColor: unit === 'unidades' ? "var(--primary)" : "var(--border)",
                      color: unit === 'unidades' ? 'white' : "var(--text-secondary)"
                    }}
                  >
                    <span className="mr-2">📦</span>
                    Por unidades
                  </button>
                  <button
                    onClick={() => {
                      setUnit('kg');
                      if (quantity < 0.1) setQuantity(0.1);
                    }}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      unit === 'kg' 
                        ? 'text-white shadow-md' 
                        : 'border hover:bg-gray-50'
                    }`}
                    style={{ 
                      backgroundColor: unit === 'kg' ? "var(--primary)" : "transparent",
                      borderColor: unit === 'kg' ? "var(--primary)" : "var(--border)",
                      color: unit === 'kg' ? 'white' : "var(--text-secondary)"
                    }}
                  >
                    <span className="mr-2">⚖️</span>
                    Por kilogramos
                  </button>
                </div>
                
                <div className="flex items-center justify-center space-x-3">
                  <button
                    onClick={() => setQuantity(subtractQuantity(quantity, unit))}
                    className="w-10 h-10 rounded-full border flex items-center justify-center transition-colors"
                    style={{ 
                      borderColor: "var(--border)",
                      color: "var(--text-secondary)"
                    }}
                    disabled={quantity <= getMinValue(unit)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path>
                    </svg>
                  </button>
                  
                  <input
                    type="number"
                    min={getMinValue(unit)}
                    step={getStep(unit)}
                    value={quantity}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || getMinValue(unit);
                      const newValue = unit === 'kg' ? Math.round(value * 10) / 10 : Math.max(getMinValue(unit), value);
                      setQuantity(newValue);
                    }}
                    className="w-20 text-center text-xl font-semibold py-2 rounded-md border focus:outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: "var(--background)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                      "--tw-ring-color": "var(--primary)"
                    }}
                  />
                  
                  <button
                    onClick={() => setQuantity(addQuantity(quantity, unit))}
                    className="w-10 h-10 rounded-full border flex items-center justify-center transition-colors"
                    style={{ 
                      borderColor: "var(--border)",
                      color: "var(--text-secondary)"
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                  </button>
                </div>
                
                {/* Mostrar unidad actual */}
                <div className="text-center mt-3">
                  <span className="text-lg font-semibold" style={{ color: "var(--primary)" }}>
                    {unit === 'kg' ? `${quantity} kg` : `${quantity} ${quantity === 1 ? 'unidad' : 'unidades'}`}
                  </span>
                  <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                    {unit === 'kg' 
                      ? 'Ideal para productos que se venden por peso' 
                      : 'Ideal para productos que se cuentan por piezas'
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={cancelProductSelection}
                  className="flex-1 px-4 py-2 rounded-md border transition-colors"
                  style={{ 
                    borderColor: "var(--border)",
                    color: "var(--text-secondary)"
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmAddProduct}
                  disabled={loading}
                  className="flex-1 px-4 py-2 rounded-md text-white transition-colors disabled:opacity-50"
                  style={{ backgroundColor: "var(--primary)" }}
                >
                  {loading ? 'Agregando...' : 'Agregar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente para crear nuevo producto
function CreateProductForm({ initialName, categories, supermarkets, onSubmit, onCancel, loading, user }) {
  const [formData, setFormData] = useState({
    nombre: initialName,
    descripcion: "",
    categoria_id: "",
    supermercado_id: "",
    estante: "",
    cara: ""
  });
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [showNewSupermarketInput, setShowNewSupermarketInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newSupermarketName, setNewSupermarketName] = useState("");
  const [creating, setCreating] = useState(false);

  // Limpiar campo "cara" cuando se borra el estante
  useEffect(() => {
    if (!formData.estante || !formData.estante.trim()) {
      setFormData(prev => ({ ...prev, cara: "" }));
    }
  }, [formData.estante]);

  // Crear nueva categoría
  const createCategory = async () => {
    if (!newCategoryName.trim() || !user) return;
    
    setCreating(true);
    try {
      const { data, error } = await supabase
        .from('categorias')
        .insert([{
          nombre: newCategoryName.trim(),
          user_id: user.id
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      // Actualizar la lista local de categorías
      categories.push(data);
      setFormData({ ...formData, categoria_id: data.id });
      setNewCategoryName("");
      setShowNewCategoryInput(false);
      alerts.success('Categoría creada exitosamente');
    } catch (error) {
      console.error('Error creando categoría:', error);
      alerts.error('Error al crear la categoría');
    } finally {
      setCreating(false);
    }
  };

  // Crear nuevo supermercado
  const createSupermarket = async () => {
    if (!newSupermarketName.trim() || !user) return;
    
    setCreating(true);
    try {
      const { data, error } = await supabase
        .from('supermercados')
        .insert([{
          nombre: newSupermarketName.trim(),
          user_id: user.id
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      // Actualizar la lista local de supermercados
      supermarkets.push(data);
      setFormData({ ...formData, supermercado_id: data.id });
      setNewSupermarketName("");
      setShowNewSupermarketInput(false);
      alerts.success('Supermercado creado exitosamente');
    } catch (error) {
      console.error('Error creando supermercado:', error);
      alerts.error('Error al crear el supermercado');
    } finally {
      setCreating(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validaciones obligatorias
    if (!formData.nombre.trim()) {
      alerts.warning("El nombre del producto es obligatorio");
      return;
    }
    
    if (!formData.categoria_id) {
      alerts.warning("Debe seleccionar una categoría para el producto");
      return;
    }
    
    if (!formData.supermercado_id) {
      alerts.warning("Debe seleccionar un supermercado para el producto");
      return;
    }
    
    const productData = {
      ...formData,
      categoria_id: formData.categoria_id,
      supermercado_id: formData.supermercado_id,
      user_id: user?.id
    };
    
    onSubmit(productData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: "var(--foreground)" }}>
          Nombre del producto *
        </label>
        <input
          type="text"
          value={formData.nombre}
          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
          className="w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2"
          style={{ 
            backgroundColor: "var(--background)",
            borderColor: "var(--border)",
            color: "var(--foreground)",
            "--tw-ring-color": "var(--primary)"
          }}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: "var(--foreground)" }}>
          Descripción
        </label>
        <input
          type="text"
          value={formData.descripcion}
          onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
          className="w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2"
          style={{ 
            backgroundColor: "var(--background)",
            borderColor: "var(--border)",
            color: "var(--foreground)",
            "--tw-ring-color": "var(--primary)"
          }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: "var(--foreground)" }}>
            Categoría *
          </label>
          {showNewCategoryInput ? (
            <div className="space-y-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Nueva categoría"
                className="w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2"
                style={{ 
                  backgroundColor: "var(--background)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                  "--tw-ring-color": "var(--primary)"
                }}
                onKeyPress={(e) => e.key === 'Enter' && createCategory()}
                autoFocus
              />
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={createCategory}
                  disabled={creating || !newCategoryName.trim()}
                  className="flex-1 px-2 py-1 text-xs rounded text-white"
                  style={{ backgroundColor: "var(--success)" }}
                >
                  {creating ? 'Creando...' : 'Crear'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewCategoryInput(false);
                    setNewCategoryName("");
                  }}
                  className="flex-1 px-2 py-1 text-xs rounded border"
                  style={{ 
                    borderColor: "var(--border)",
                    color: "var(--text-secondary)"
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <select
                value={formData.categoria_id}
                onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value })}
                className="w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2"
                style={{ 
                  backgroundColor: "var(--background)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                  "--tw-ring-color": "var(--primary)"
                }}
              >
                <option value="">Seleccionar categoría</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowNewCategoryInput(true)}
                className="w-full px-2 py-1 text-xs rounded border border-dashed hover:bg-gray-50 transition-colors"
                style={{ 
                  borderColor: "var(--primary)",
                  color: "var(--primary)"
                }}
              >
                + Nueva categoría
              </button>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: "var(--foreground)" }}>
            Supermercado *
          </label>
          {showNewSupermarketInput ? (
            <div className="space-y-2">
              <input
                type="text"
                value={newSupermarketName}
                onChange={(e) => setNewSupermarketName(e.target.value)}
                placeholder="Nuevo supermercado"
                className="w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2"
                style={{ 
                  backgroundColor: "var(--background)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                  "--tw-ring-color": "var(--primary)"
                }}
                onKeyPress={(e) => e.key === 'Enter' && createSupermarket()}
                autoFocus
              />
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={createSupermarket}
                  disabled={creating || !newSupermarketName.trim()}
                  className="flex-1 px-2 py-1 text-xs rounded text-white"
                  style={{ backgroundColor: "var(--success)" }}
                >
                  {creating ? 'Creando...' : 'Crear'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewSupermarketInput(false);
                    setNewSupermarketName("");
                  }}
                  className="flex-1 px-2 py-1 text-xs rounded border"
                  style={{ 
                    borderColor: "var(--border)",
                    color: "var(--text-secondary)"
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <select
                value={formData.supermercado_id}
                onChange={(e) => setFormData({ ...formData, supermercado_id: e.target.value })}
                className="w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2"
                style={{ 
                  backgroundColor: "var(--background)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                  "--tw-ring-color": "var(--primary)"
                }}
              >
                <option value="">Seleccionar supermercado</option>
                {supermarkets.map((supermarket) => (
                  <option key={supermarket.id} value={supermarket.id}>{supermarket.nombre}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowNewSupermarketInput(true)}
                className="w-full px-2 py-1 text-xs rounded border border-dashed hover:bg-gray-50 transition-colors"
                style={{ 
                  borderColor: "var(--primary)",
                  color: "var(--primary)"
                }}
              >
                + Nuevo supermercado
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: "var(--foreground)" }}>
            Estante
          </label>
          <input
            type="text"
            value={formData.estante}
            onChange={(e) => setFormData({ ...formData, estante: e.target.value })}
            placeholder="A1, B3, etc."
            className="w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2"
            style={{ 
              backgroundColor: "var(--background)",
              borderColor: "var(--border)",
              color: "var(--foreground)",
              "--tw-ring-color": "var(--primary)"
            }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: "var(--foreground)" }}>
            Cara
          </label>
          <select
            value={formData.cara}
            onChange={(e) => setFormData({ ...formData, cara: e.target.value })}
            disabled={!formData.estante || !formData.estante.trim()}
            className="w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              backgroundColor: "var(--background)",
              borderColor: "var(--border)",
              color: "var(--foreground)",
              "--tw-ring-color": "var(--primary)"
            }}
          >
            <option value="">
              {!formData.estante || !formData.estante.trim() 
                ? "Primero ingrese un estante" 
                : "Seleccionar cara"
              }
            </option>
            {formData.estante && formData.estante.trim() && (
              <>
                <option value="1">Cara 1</option>
                <option value="2">Cara 2</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* Mensaje informativo sobre campos obligatorios */}
      <div className="p-3 rounded-md border-l-4 text-sm" 
        style={{ 
          backgroundColor: "var(--background)", 
          borderLeftColor: "var(--primary)",
          color: "var(--text-secondary)"
        }}>
        <p>📝 Los campos marcados con asterisco (*) son obligatorios para crear un producto.</p>
      </div>

      <div className="flex space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 rounded-md border transition-colors"
          style={{ 
            borderColor: "var(--border)",
            color: "var(--text-secondary)"
          }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={
            loading || 
            !formData.nombre.trim() || 
            !formData.categoria_id || 
            !formData.supermercado_id
          }
          className="flex-1 px-4 py-2 rounded-md text-white transition-colors disabled:opacity-50"
          style={{ backgroundColor: "var(--primary)" }}
        >
          {loading ? 'Creando...' : 'Crear y Agregar'}
        </button>
      </div>
    </form>
  );
}
