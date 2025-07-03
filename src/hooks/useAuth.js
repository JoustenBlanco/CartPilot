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

    if (error) throw error;
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
      const { data, error } = await getUserProfile(userId);
      if (!error && data) {
        console.log("PUTO EL QUE LO LEAAAA");
        setProfile(data);
      } else {
        console.log("PUTO EL QUE LO LEA");
        console.warn("Error loading user profile:", error);
        setProfile(null);
      }
    } catch (error) {
      console.error("Exception loading user profile:", error);
      console.log("PUTO EL QUE LO LEAUUUU");
      setProfile(null);
    }
  };

  useEffect(() => {
    let timeoutId;

    // Get initial session
    const getSession = async () => {
      try {
        setLoading(true);

        // Obtener sesión directamente sin wrapper para evitar problemas
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.log("Pasando por el error de sesión");
          console.error("Error getting session:", error.message);

          // Manejar el error pero no bloquear
          await handleAuthError(error);
          setUser(null);
          setProfile(null);
          setLoading(false);
          clearTimeout(timeoutId);
          console.log("Pasando por el error de sesión");
          return;
        }

        if (session?.user) {
          console.log("Pasando por el if de sesión");
          console.log("Session found:", session.user);
          setUser(session.user);
          // Esperar a que termine de cargar el perfil antes de quitar el loading
          await loadUserProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }

        clearTimeout(timeoutId);
        setLoading(false);
      } catch (error) {
        console.error("Error in getSession:", error.message);
        setUser(null);
        setProfile(null);
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(
        "Auth state change:",
        event,
        session ? "has session" : "no session",
        "isAuthenticating:",
        isAuthenticating
      );

      // Ignorar cambios de estado durante el proceso de autenticación manual
      // para evitar redirecciones no deseadas cuando hay errores
      if (isAuthenticating && event === "SIGNED_OUT") {
        console.log("Ignorando SIGNED_OUT durante autenticación manual");
        return;
      }

      // Manejar eventos específicos de error de token
      if (event === "TOKEN_REFRESHED" && !session) {
        console.warn("Token refresh failed, clearing session");
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

      // Para eventos de login exitoso, siempre actualizar
      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user);
        await loadUserProfile(session.user.id);
        setLoading(false);
        return;
      }

      // Para otros eventos, actualizar el estado solo si no estamos autenticando
      if (!isAuthenticating) {
        setUser(session?.user ?? null);

        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setProfile(null);
        }

        setLoading(false);
      }
    });

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      subscription?.unsubscribe();
    };
  }, [isAuthenticating]); // Agregar isAuthenticating como dependencia

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
          console.error("Error upserting profile:", profileError);
        } else {
          console.log("Profile created/updated successfully for:", fullName);
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
        console.warn("Error cerrando sesión en servidor:", error.message);

        // Si es un error de sesión faltante, intentar con signOut sin parámetros
        if (error.message.includes("Auth session missing")) {
          try {
            await supabase.auth.signOut();
          } catch (retryError) {
            console.warn("Retry signOut también falló:", retryError.message);
          }
        }
      }
    } catch (error) {
      console.error("Error signing out:", error.message);
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
        console.warn("Error limpiando storage:", e.message);
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
