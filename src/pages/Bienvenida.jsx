
import { useState } from "react";
import {
  FileText,
  CheckCircle2,
  LogOut,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from "../contexts/AuthContext";

function Bienvenida() {
  const { usuario, cerrarSesion } = useAuth();

  const [saliendo, setSaliendo] = useState(false);
  const [error, setError] = useState("");

  // Cerrar la sesión del usuario.
  async function manejarCerrarSesion() {
    setError("");
    setSaliendo(true);

    try {
      await cerrarSesion();

      // App.jsx mostrará automáticamente el formulario
      // cuando Supabase confirme el cierre de sesión.
    } catch (error) {
      console.error("Error al cerrar sesión:", error);

      setError(
        "No se pudo cerrar la sesión. Inténtalo nuevamente."
      );

      setSaliendo(false);
    }
  }

  return (
    <main className="min-h-screen bg-fondo px-4 py-8">
      <div className="mx-auto max-w-lg">

        {/* ENCABEZADO */}
        <header className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-principal">
            <FileText className="h-6 w-6 text-white" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-principal">
              Cotizafácil
            </h1>

            <p className="text-xs text-slate-500">
              Cotizaciones profesionales
            </p>
          </div>
        </header>

        {/* TARJETA DE BIENVENIDA */}
        <section className="rounded-2xl bg-white p-6 shadow-lg">

          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>

          <h2 className="text-2xl font-bold text-principal">
            ¡Bienvenido a Cotizafácil!
          </h2>

          <p className="mt-3 text-slate-600">
            Has iniciado sesión correctamente.
          </p>

          {/* CORREO DEL USUARIO */}
          <div className="mt-6 rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Tu cuenta
            </p>

            <p className="mt-1 break-all font-medium text-texto">
              {usuario?.email}
            </p>
          </div>

          {/* ESTADO DE LA SESIÓN */}
          <div className="mt-5 flex items-start gap-3 rounded-xl bg-green-50 p-4">
            <ShieldCheck className="h-5 w-5 flex-shrink-0 text-green-700" />

            <div>
              <p className="font-semibold text-green-800">
                Sesión activa
              </p>

              <p className="mt-1 text-sm text-green-700">
                Cotizafácil reconoce tu cuenta.
              </p>
            </div>
          </div>

          {/* AVISO TEMPORAL */}
          <p className="mt-6 text-sm text-slate-500">
            Esta es una pantalla temporal de prueba.
            Próximamente construiremos el panel principal
            para administrar tus cotizaciones.
          </p>

          {/* MENSAJE DE ERROR */}
          {error && (
            <div
              role="alert"
              className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {/* CERRAR SESIÓN */}
          <button
            type="button"
            onClick={manejarCerrarSesion}
            disabled={saliendo}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-principal px-5 py-3.5 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut className="h-5 w-5" />

            {saliendo ? "Cerrando sesión..." : "Cerrar sesión"}
          </button>

        </section>

        <p className="mt-6 text-center text-xs text-slate-500">
          Bloque A — Gestión de autenticación
        </p>

      </div>
    </main>
  );
}

export default Bienvenida;
