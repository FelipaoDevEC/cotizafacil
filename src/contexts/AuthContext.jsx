
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { supabase } from "../lib/supabase";

// Contexto que compartirá la sesión con la aplicación.
const AuthContext = createContext(null);

// Proveedor principal de autenticación.
export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);

  useEffect(() => {
    let activo = true;

    // Recuperar la sesión guardada al abrir la aplicación.
    async function recuperarSesion() {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (activo) {
          setUsuario(data.session?.user ?? null);
        }
      } catch (error) {
        console.error("Error al recuperar la sesión:", error);

        if (activo) {
          setUsuario(null);
        }
      } finally {
        if (activo) {
          setCargandoSesion(false);
        }
      }
    }

    // Escuchar cambios de autenticación.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evento, sesion) => {
      if (!activo) return;

      setUsuario(sesion?.user ?? null);
      setCargandoSesion(false);
    });

    recuperarSesion();

    // Limpiar la suscripción al desmontar el componente.
    return () => {
      activo = false;
      subscription.unsubscribe();
    };
  }, []);

  // Cerrar sesión en Supabase.
  async function cerrarSesion() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }
  }

  return (
    <AuthContext.Provider
      value={{
        usuario,
        cargandoSesion,
        cerrarSesion,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook para utilizar la autenticación en otros componentes.
export function useAuth() {
  const contexto = useContext(AuthContext);

  if (!contexto) {
    throw new Error(
      "useAuth debe utilizarse dentro de AuthProvider."
    );
  }

  return contexto;
}
