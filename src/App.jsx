import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Auth from "./pages/Auth";
import Bienvenida from "./pages/Bienvenida";
import ConfigurarNegocio from "./pages/ConfigurarNegocio";
import Clientes from "./pages/Clientes";
import CatalogoPrecios from "./pages/CatalogoPrecios";
import NuevaCotizacion from "./pages/NuevaCotizacion";
import HistorialCotizaciones from "./pages/HistorialCotizaciones";
import RutaPrivada from "./components/RutaPrivada";
import NavegacionMovil from "./components/NavegacionMovil";

function PantallaCarga() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-fondo p-4">
      <div className="text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-accion" />
        <p className="font-medium text-principal">Cargando Cotizafácil...</p>
      </div>
    </main>
  );
}

function RutaAcceso() {
  const { usuario, cargandoSesion } = useAuth();
  if (cargandoSesion) return <PantallaCarga />;
  if (usuario) return <Navigate to="/dashboard" replace />;
  return <Auth />;
}

function RutasApp() {
  const { usuario } = useAuth();
  const { pathname } = useLocation();
  const mostrarMenu = Boolean(usuario) && pathname !== "/login";
  return (
    <>
    <Routes>
      <Route path="/login" element={<RutaAcceso />} />
      <Route element={<RutaPrivada />}>
        <Route path="/dashboard" element={<Bienvenida />} />
        <Route path="/configurar-negocio" element={<ConfigurarNegocio />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/catalogo" element={<CatalogoPrecios />} />
        <Route path="/cotizaciones/nueva" element={<NuevaCotizacion />} />
        <Route path="/cotizaciones/:id/editar" element={<NuevaCotizacion />} />
        <Route path="/cotizaciones" element={<HistorialCotizaciones />} />
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
    {mostrarMenu && <><div className="h-20 md:hidden" aria-hidden="true" /><NavegacionMovil /></>}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter><RutasApp /></BrowserRouter>
    </AuthProvider>
  );
}

export default App;
