// ========================================
// COTIZAFÁCIL - PANTALLA INICIAL
// Bloque 0: Prueba de Tailwind CSS
// ========================================

function App() {
  return (
    <main className="min-h-screen bg-fondo flex items-center justify-center p-4">

      {/* Tarjeta principal */}
      <section className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 text-center">

        {/* Nombre de la aplicación */}
        <h1 className="text-3xl font-bold text-principal">
          Cotizafácil
        </h1>

        {/* Mensaje de bienvenida */}
        <p className="text-texto mt-3">
          Cotizaciones profesionales en minutos.
        </p>

        {/* Botón de prueba visual: todavía sin funcionalidad */}
        <div className="mt-6 rounded-xl bg-accion p-4 text-lg font-bold text-white">
          + Nueva cotización
        </div>

        {/* Estado del proyecto */}
        <p className="mt-5 text-sm text-gray-500">
          Bloque 0 - Configuración inicial
        </p>

      </section>

    </main>
  );
}

export default App;