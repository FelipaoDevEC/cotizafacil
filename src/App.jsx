import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import {
  AuthProvider,
  useAuth,
} from "./contexts/AuthContext";

import Auth from "./pages/Auth";
import Bienvenida from "./pages/Bienvenida";
import RutaPrivada from "./components/RutaPrivada";

// Controla el acceso a la pantalla de login.
function RutaAcceso() {
  const { usuario, cargandoSesion } = useAuth();

  // Esperar mientras se comprueba la sesión.
  if (cargandoSesion) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-fondo p-4">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-accion" />

          <p className="font-medium text-principal">
            Cargando Cotizafácil...
          </p>
        </div>
      </main>
    );
  }

  // Si ya inició sesión, enviar al dashboard.
  if (usuario) {
    return <Navigate to="/dashboard" replace />;
  }

  // Si no tiene sesión, mostrar el formulario.
  return <Auth />;
}

// Rutas de la aplicación.
function RutasApp() {
  return (
    <Routes>
      {/* Pantalla pública */}
      <Route path="/login" element={<RutaAcceso />} />

      {/* Pantallas privadas */}
      <Route element={<RutaPrivada />}>
        <Route
          path="/dashboard"
          element={<Bienvenida />}
        />
      </Route>

      {/* Dirección principal */}
      <Route
        path="/"
        element={<Navigate to="/dashboard" replace />}
      />

      {/* Direcciones inexistentes */}
      <Route
        path="*"
        element={<Navigate to="/dashboard" replace />}
      />
    </Routes>
  );
}

// Componente principal.
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <RutasApp />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
