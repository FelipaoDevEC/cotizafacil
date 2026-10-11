import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// Protege las pantallas que requieren iniciar sesión.
function RutaPrivada() {
  const { usuario, cargandoSesion } = useAuth();

  // Esperar mientras Supabase recupera la sesión.
  if (cargandoSesion) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-fondo p-4">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-accion" />

          <p className="font-medium text-principal">
            Verificando tu sesión...
          </p>
        </div>
      </main>
    );
  }

  // Si no existe sesión, regresar al acceso.
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  // Si existe sesión, permitir entrar.
  return <Outlet />;
}

export default RutaPrivada;
