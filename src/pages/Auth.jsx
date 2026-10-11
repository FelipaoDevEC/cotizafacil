
import { useState } from "react";
import {
  FileText,
  Mail,
  LockKeyhole,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";

import { supabase } from "../lib/supabase";

function Auth() {
  // Modo actual: login o registro.
  const [modo, setModo] = useState("login");

  // Mostrar u ocultar la contraseña.
  const [mostrarPassword, setMostrarPassword] = useState(false);

  // Datos del formulario.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Estado del proceso.
  const [cargando, setCargando] = useState(false);

  // Mensajes para el usuario.
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("");

  const esRegistro = modo === "registro";

  // Cambiar entre iniciar sesión y crear cuenta.
  function cambiarModo(nuevoModo) {
    setModo(nuevoModo);
    setMensaje("");
    setTipoMensaje("");
    setPassword("");
    setMostrarPassword(false);
  }

  // Procesar el formulario.
  async function manejarEnvio(evento) {
    evento.preventDefault();

    setMensaje("");
    setTipoMensaje("");

    // Validación básica de la contraseña.
    if (password.length < 6) {
      setTipoMensaje("error");
      setMensaje(
        "La contraseña debe tener al menos 6 caracteres."
      );
      return;
    }

    setCargando(true);

    try {
      if (esRegistro) {
        // ===================================
        // REGISTRO DE NUEVOS USUARIOS
        // ===================================

        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });

        if (error) {
          throw error;
        }

        setTipoMensaje("exito");

        if (data.session) {
          setMensaje(
            "Tu cuenta fue creada correctamente. La sesión está activa."
          );
        } else {
          setMensaje(
            "Solicitud recibida. Si corresponde, revisa tu correo electrónico para confirmar tu cuenta."
          );
        }

        setPassword("");

      } else {
        // ===================================
        // INICIO DE SESIÓN
        // ===================================

        const { data, error } =
          await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });

        if (error) {
          throw error;
        }

        if (data.session) {
          setTipoMensaje("exito");
          setMensaje(
            "¡Bienvenido a Cotizafácil! Has iniciado sesión correctamente."
          );

          // Por seguridad, limpiamos la contraseña.
          setPassword("");

          // El dashboard se implementará después.
        } else {
          setTipoMensaje("error");
          setMensaje(
            "No fue posible iniciar sesión. Inténtalo nuevamente."
          );
        }
      }

    } catch (error) {
      console.error("Error de autenticación:", error);

      setTipoMensaje("error");

      const codigo = error.code || "";
      const detalle = error.message?.toLowerCase() || "";

      if (
        codigo === "invalid_credentials" ||
        detalle.includes("invalid login credentials")
      ) {
        setMensaje(
          "Correo electrónico o contraseña incorrectos."
        );

      } else if (
        codigo === "email_not_confirmed" ||
        detalle.includes("email not confirmed")
      ) {
        setMensaje(
          "Debes confirmar tu correo electrónico antes de ingresar."
        );

      } else if (detalle.includes("rate limit")) {
        setMensaje(
          "Demasiados intentos. Espera unos minutos antes de volver a probar."
        );

      } else if (detalle.includes("password")) {
        setMensaje(
          "La contraseña no cumple los requisitos de seguridad."
        );

      } else {
        setMensaje(
          "No pudimos completar la operación. Revisa tus datos e inténtalo nuevamente."
        );
      }

    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="min-h-screen bg-fondo px-4 py-8 flex items-center justify-center">
      <div className="w-full max-w-md">

        {/* LOGO Y NOMBRE */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-principal">
            <FileText className="h-8 w-8 text-white" />
          </div>

          <h1 className="text-3xl font-bold text-principal">
            Cotizafácil
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Cotizaciones profesionales en minutos.
          </p>
        </div>

        {/* TARJETA PRINCIPAL */}
        <div className="rounded-2xl bg-white p-6 shadow-lg sm:p-8">

          <h2 className="text-2xl font-bold text-principal">
            {esRegistro
              ? "Crea tu cuenta"
              : "Bienvenido de nuevo"}
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {esRegistro
              ? "Empieza a crear cotizaciones profesionales."
              : "Ingresa para administrar tus cotizaciones."}
          </p>

          {/* CAMBIAR ENTRE REGISTRO Y LOGIN */}
          <div className="mt-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1">

            <button
              type="button"
              disabled={cargando}
              onClick={() => cambiarModo("login")}
              className={`rounded-lg px-3 py-3 text-sm font-semibold transition ${
                !esRegistro
                  ? "bg-white text-principal shadow-sm"
                  : "text-slate-500"
              }`}
            >
              Iniciar sesión
            </button>

            <button
              type="button"
              disabled={cargando}
              onClick={() => cambiarModo("registro")}
              className={`rounded-lg px-3 py-3 text-sm font-semibold transition ${
                esRegistro
                  ? "bg-white text-principal shadow-sm"
                  : "text-slate-500"
              }`}
            >
              Crear cuenta
            </button>

          </div>

          {/* FORMULARIO */}
          <form
            onSubmit={manejarEnvio}
            className="mt-6 space-y-5"
          >

            {/* CORREO ELECTRÓNICO */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-texto"
              >
                Correo electrónico
              </label>

              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={cargando}
                  value={email}
                  onChange={(evento) =>
                    setEmail(evento.target.value)
                  }
                  placeholder="ejemplo@correo.com"
                  className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 outline-none focus:border-accion focus:ring-2 focus:ring-orange-100"
                />
              </div>
            </div>

            {/* CONTRASEÑA */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-texto"
              >
                Contraseña
              </label>

              <div className="relative">
                <LockKeyhole className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />

                <input
                  id="password"
                  name="password"
                  type={
                    mostrarPassword
                      ? "text"
                      : "password"
                  }
                  autoComplete={
                    esRegistro
                      ? "new-password"
                      : "current-password"
                  }
                  minLength={6}
                  required
                  disabled={cargando}
                  value={password}
                  onChange={(evento) =>
                    setPassword(evento.target.value)
                  }
                  placeholder="Mínimo 6 caracteres"
                  className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-12 outline-none focus:border-accion focus:ring-2 focus:ring-orange-100"
                />

                {/* MOSTRAR / OCULTAR CONTRASEÑA */}
                <button
                  type="button"
                  disabled={cargando}
                  onClick={() =>
                    setMostrarPassword(!mostrarPassword)
                  }
                  aria-label={
                    mostrarPassword
                      ? "Ocultar contraseña"
                      : "Mostrar contraseña"
                  }
                  className="absolute right-3 top-3 text-slate-500"
                >
                  {mostrarPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              {esRegistro && (
                <p className="mt-2 text-xs text-slate-500">
                  Utiliza al menos 6 caracteres.
                </p>
              )}
            </div>

            {/* BOTÓN PRINCIPAL */}
            <button
              type="submit"
              disabled={cargando}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-accion px-5 py-3.5 font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {cargando
                ? esRegistro
                  ? "Creando cuenta..."
                  : "Ingresando..."
                : esRegistro
                ? "Crear mi cuenta"
                : "Ingresar"}

              <ArrowRight className="h-5 w-5" />
            </button>

          </form>

          {/* MENSAJES DE RESULTADO */}
          {mensaje && (
            <div
              role={
                tipoMensaje === "error"
                  ? "alert"
                  : "status"
              }
              className={`mt-5 rounded-xl p-4 text-sm ${
                tipoMensaje === "exito"
                  ? "bg-green-50 text-green-800"
                  : tipoMensaje === "error"
                  ? "bg-red-50 text-red-800"
                  : "bg-blue-50 text-blue-800"
              }`}
            >
              {mensaje}
            </div>
          )}

        </div>

        {/* PIE DE PÁGINA */}
        <p className="mt-6 text-center text-xs text-slate-500">
          Cotizafácil — Tu trabajo merece una presentación profesional.
        </p>

      </div>
    </main>
  );
}

export default Auth;
