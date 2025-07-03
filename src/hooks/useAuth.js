"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { supabase } from "@/lib/supabase";
import {
  handleAuthError,
  withAuthErrorHandling,
  clearAllAuthData,
} from "@/lib/auth-error-handler";

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

// Función auxiliar para obtener el perfil del usuario
export const getUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Función para cargar el perfil del usuario
  const loadUserProfile = async (userId) => {
    if (!userId) {
      setProfile(null);
      return;
    }

    try {
      // Crear una promesa con timeout más corto para mejor UX
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Timeout loading profile")), 8000); // 8 segundos
      });

      const profilePromise = getUserProfile(userId);

      // Usar Promise.race para que falle si tarda más de 8 segundos
      const { data, error } = await Promise.race([
        profilePromise,
        timeoutPromise,
      ]);

      if (!error && data) {
        setProfile(data);
      } else {
        setProfile(null);
      }
    } catch (error) {
      setProfile(null);
    }
  };

  useEffect(() => {
    let mounted = true;
    let initialLoadComplete = false;
    let timeoutId;

    // Get initial session
    const getSession = async () => {
      if (!mounted) return;

      try {
        setLoading(true);

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (!mounted) return; // Verificar si aún está montado

        if (error) {
          await handleAuthError(error);
          setUser(null);
          setProfile(null);
          setLoading(false);
          initialLoadComplete = true;
          return;
        }

        if (session?.user) {
          setUser(session.user);

          try {
            await loadUserProfile(session.user.id);
          } catch (error) {
            setProfile(null);
          }
        } else {
          setUser(null);
          setProfile(null);
        }

        if (mounted) {
          setLoading(false);
          initialLoadComplete = true;
        }
      } catch (error) {
        if (mounted) {
          setUser(null);
          setProfile(null);
          setLoading(false);
          initialLoadComplete = true;
        }
      }
    };

    // Ejecutar getSession
    getSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      // Ignorar ciertos eventos durante la carga inicial para evitar race conditions
      if (
        !initialLoadComplete &&
        (event === "SIGNED_IN" || event === "INITIAL_SESSION")
      ) {
        return;
      }

      // Ignorar cambios de estado durante el proceso de autenticación manual
      if (isAuthenticating && event === "SIGNED_OUT") {
        return;
      }

      // Manejar eventos específicos de error de token
      if (event === "TOKEN_REFRESHED" && !session) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      // Manejar evento de logout
      if (event === "SIGNED_OUT" && !isAuthenticating) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      // Para eventos de login exitoso después de la carga inicial
      if (event === "SIGNED_IN" && session?.user && initialLoadComplete) {
        setUser(session.user);

        // Timeout de seguridad para evitar que se quede colgado
        const authTimeoutId = setTimeout(() => {
          if (mounted) setLoading(false);
        }, 15000); // 15 segundos

        try {
          await loadUserProfile(session.user.id);
        } catch (error) {
          setProfile(null);
        } finally {
          clearTimeout(authTimeoutId);
          if (mounted) {
            setLoading(false);
          }
        }
        return;
      }

      // Para otros eventos, actualizar el estado solo si no estamos autenticando
      if (!isAuthenticating && initialLoadComplete) {
        setUser(session?.user ?? null);

        if (session?.user) {
          // Timeout de seguridad
          const otherTimeoutId = setTimeout(() => {
            if (mounted) setLoading(false);
          }, 15000);

          try {
            await loadUserProfile(session.user.id);
          } catch (error) {
            setProfile(null);
          } finally {
            clearTimeout(otherTimeoutId);
            if (mounted) {
              setLoading(false);
            }
          }
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    });

    // Cleanup function
    return () => {
      mounted = false;
      initialLoadComplete = false;

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      subscription?.unsubscribe();
    };
  }, [isAuthenticating]);

  const signUp = async (email, password, fullName) => {
    try {
      setLoading(true);
      setIsAuthenticating(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;

      // Si el usuario se creó exitosamente, usar upsert para crear/actualizar el perfil
      if (data.user && fullName) {
        // Usar upsert (insert or update) para evitar conflictos
        const { error: profileError } = await supabase.from("profiles").upsert(
          {
            id: data.user.id,
            full_name: fullName,
            // No incluir avatar_url ya que la tabla no tiene esa columna
          },
          {
            onConflict: "id",
          }
        );

        if (profileError) {
          // Error upserting profile
        } else {
          // Profile created/updated successfully
        }
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    } finally {
      setLoading(false);
      setIsAuthenticating(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      setIsAuthenticating(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    } finally {
      setLoading(false);
      setIsAuthenticating(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      setIsAuthenticating(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    } finally {
      setLoading(false);
      setIsAuthenticating(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);

      // Intentar cerrar sesión con Supabase
      const { error } = await supabase.auth.signOut({
        scope: "local", // Solo cerrar sesión local, no global
      });

      // Si hay un error, lo loggeamos pero no impedimos la limpieza local
      if (error) {
        // Si es un error de sesión faltante, intentar con signOut sin parámetros
        if (error.message.includes("Auth session missing")) {
          try {
            await supabase.auth.signOut();
          } catch (retryError) {
            // Retry signOut también falló
          }
        }
      }
    } catch (error) {
      // Error signing out
    } finally {
      // Siempre limpiar el estado local, independientemente de si hubo errores
      setUser(null);
      setProfile(null);
      setLoading(false);

      // Limpiar datos del localStorage si existen
      try {
        const keys = Object.keys(localStorage);
        keys.forEach((key) => {
          if (key.includes("supabase") || key.includes("sb-")) {
            localStorage.removeItem(key);
          }
        });

        const sessionKeys = Object.keys(sessionStorage);
        sessionKeys.forEach((key) => {
          if (key.includes("supabase") || key.includes("sb-")) {
            sessionStorage.removeItem(key);
          }
        });
      } catch (e) {
        // Error limpiando storage
      }

      // Redirigir a la página de inicio
      setTimeout(() => {
        window.location.href = "/";
      }, 100);
    }
  };

  // Función para verificar si un email ya está registrado con un proveedor específico
  const checkEmailProvider = async (email) => {
    try {
      // Intentar iniciar sesión con una contraseña obviamente incorrecta
      // para forzar un error específico sin afectar la cuenta
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: "!!invalid-password-check!!", // Contraseña que nunca puede ser válida
      });

      if (error) {
        const errorMessage = error.message.toLowerCase();

        // Si el error indica específicamente credenciales inválidas,
        // significa que el usuario existe pero la contraseña es incorrecta
        if (errorMessage.includes("invalid login credentials")) {
          // Podría ser usuario con contraseña o con OAuth, necesitamos más información
          return { existsWithOAuth: false, userExists: true, error: null };
        }

        // Si el error indica que el usuario no fue encontrado
        if (
          errorMessage.includes("user not found") ||
          errorMessage.includes("email not confirmed")
        ) {
          return { existsWithOAuth: false, userExists: false, error: null };
        }

        // Para otros errores, asumir que podría ser OAuth
        return { existsWithOAuth: true, userExists: true, error: null };
      }

      // Si no hay error (muy improbable con esa contraseña), el usuario no existe
      return { existsWithOAuth: false, userExists: false, error: null };
    } catch (error) {
      return {
        existsWithOAuth: false,
        userExists: false,
        error: error.message,
      };
    }
  };

  const value = {
    user,
    profile,
    loading,
    isAuthenticating,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    loadUserProfile,
    checkEmailProvider,
    clearAllAuthData, // Función de emergencia para limpiar tokens
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
