
import { useState } from "react";
import { supabase } from "./lib/supabase";

function App() {
  const [estado, setEstado] = useState("sin_probar");
  const [mensaje, setMensaje] = useState("");

  async function probarConexion() {
    setEstado("probando");
    setMensaje("");

    try {
      // Consultamos la sesión actual para comprobar
      // que el cliente puede comunicarse con Supabase.
      const { error } = await supabase.auth.getSession();

      if (error) {
        throw error;
      }

      setEstado("correcto");
      setMensaje(
        "El cliente de Supabase respondió correctamente."
      );
    } catch (error) {
      setEstado("error");
      setMensaje(error.message);
    }
  }

  return (
    <main className="min-h-screen bg-fondo flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-principal">
          Cotizafácil
        </h1>

        <p className="mt-2 text-texto">
          Paso 0.9 — Conexión con Supabase
        </p>

        <button
          onClick={probarConexion}
          disabled={estado === "probando"}
          className="mt-6 w-full rounded-xl bg-accion px-5 py-3 font-semibold text-white disabled:opacity-60"
        >
          {estado === "probando"
            ? "Comprobando..."
            : "Probar conexión"}
        </button>

        {mensaje && (
          <div
            role="status"
            className={`mt-5 rounded-lg p-4 text-sm ${
              estado === "correcto"
                ? "bg-green-50 text-green-800"
                : "bg-red-50 text-red-800"
            }`}
          >
            {mensaje}
          </div>
        )}

        <p className="mt-6 text-center text-xs text-slate-500">
          Bloque 0 — Configuración inicial
        </p>
      </div>
    </main>
  );
}

export default App;
