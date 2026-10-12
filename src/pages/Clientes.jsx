
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  UserPlus,
  Search,
  Pencil,
  Save,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  StickyNote,
} from "lucide-react";

import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

const formularioVacio = {
  nombre: "",
  identificacion: "",
  telefono: "",
  email: "",
  direccion: "",
  notas: "",
};

const estiloInput =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-texto outline-none focus:border-accion focus:ring-2 focus:ring-orange-100";

function Clientes() {
  const { usuario } = useAuth();

  const [negocioId, setNegocioId] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [clienteEditando, setClienteEditando] = useState(null);

  const [formulario, setFormulario] = useState(formularioVacio);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    if (!usuario?.id) return;

    let activo = true;

    async function cargarDatos() {
      setCargando(true);
      setError("");

      const { data: negocio, error: errorNegocio } =
        await supabase
          .from("negocios")
          .select("id")
          .eq("usuario_id", usuario.id)
          .maybeSingle();

      if (!activo) return;

      if (errorNegocio) {
        setError(errorNegocio.message);
        setCargando(false);
        return;
      }

      if (!negocio) {
        setError(
          "Primero debes configurar tu negocio para registrar clientes."
        );
        setCargando(false);
        return;
      }

      setNegocioId(negocio.id);

      const { data, error: errorClientes } = await supabase
        .from("clientes")
        .select(
          "id, nombre, identificacion, telefono, email, direccion, notas"
        )
        .eq("negocio_id", negocio.id)
        .order("nombre", { ascending: true });

      if (!activo) return;

      if (errorClientes) {
        setError(errorClientes.message);
      } else {
        setClientes(data ?? []);
      }

      setCargando(false);
    }

    cargarDatos();

    return () => {
      activo = false;
    };
  }, [usuario?.id]);

  function cambiarCampo(evento) {
    const { name, value } = evento.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));

    setError("");
    setMensaje("");
  }

  function abrirNuevoCliente() {
    setClienteEditando(null);
    setFormulario({ ...formularioVacio });
    setMostrarFormulario(true);
    setError("");
    setMensaje("");
  }

  function abrirEdicion(cliente) {
    setClienteEditando(cliente.id);

    setFormulario({
      nombre: cliente.nombre ?? "",
      identificacion: cliente.identificacion ?? "",
      telefono: cliente.telefono ?? "",
      email: cliente.email ?? "",
      direccion: cliente.direccion ?? "",
      notas: cliente.notas ?? "",
    });

    setMostrarFormulario(true);
    setError("");
    setMensaje("");
  }

  function cerrarFormulario() {
    setMostrarFormulario(false);
    setClienteEditando(null);
    setFormulario({ ...formularioVacio });
    setError("");
  }

  async function guardarCliente(evento) {
    evento.preventDefault();
    setError("");
    setMensaje("");

    if (!negocioId || !usuario?.id) {
      setError("Primero configura tu negocio.");
      return;
    }

    if (!formulario.nombre.trim()) {
      setError("El nombre del cliente es obligatorio.");
      return;
    }

    setGuardando(true);

    try {
      const datos = {
        negocio_id: negocioId,
        usuario_id: usuario.id,
        nombre: formulario.nombre.trim(),
        identificacion:
          formulario.identificacion.trim() || null,
        telefono: formulario.telefono.trim() || null,
        email: formulario.email.trim() || null,
        direccion: formulario.direccion.trim() || null,
        notas: formulario.notas.trim() || null,
      };

      let resultado;

      if (clienteEditando) {
        resultado = await supabase
          .from("clientes")
          .update(datos)
          .eq("id", clienteEditando)
          .eq("negocio_id", negocioId)
          .select(
            "id, nombre, identificacion, telefono, email, direccion, notas"
          )
          .single();
      } else {
        resultado = await supabase
          .from("clientes")
          .insert(datos)
          .select(
            "id, nombre, identificacion, telefono, email, direccion, notas"
          )
          .single();
      }

      if (resultado.error) {
        throw resultado.error;
      }

      const clienteGuardado = resultado.data;

      setClientes((anteriores) => {
        const actualizados = clienteEditando
          ? anteriores.map((cliente) =>
              cliente.id === clienteEditando
                ? clienteGuardado
                : cliente
            )
          : [...anteriores, clienteGuardado];

        return actualizados.sort((a, b) =>
          a.nombre.localeCompare(b.nombre, "es")
        );
      });

      setMostrarFormulario(false);
      setClienteEditando(null);
      setFormulario({ ...formularioVacio });

      setMensaje(
        clienteEditando
          ? "Cliente actualizado correctamente."
          : "Cliente registrado correctamente."
      );
    } catch (errorGuardado) {
      setError(
        errorGuardado.message ||
          "No fue posible guardar el cliente."
      );
    } finally {
      setGuardando(false);
    }
  }

  const clientesFiltrados = clientes.filter((cliente) => {
    const texto = [
      cliente.nombre,
      cliente.identificacion,
      cliente.telefono,
      cliente.email,
    ]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase("es");

    return texto.includes(
      busqueda.trim().toLocaleLowerCase("es")
    );
  });

  if (cargando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-fondo">
        <div className="text-center">
          <Loader2 className="mx-auto mb-3 h-9 w-9 animate-spin text-accion" />
          <p className="text-principal">
            Cargando clientes...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-fondo px-4 py-7">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-principal hover:text-accion"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>

        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Users className="h-7 w-7 text-accion" />
              <h1 className="text-2xl font-bold text-principal">
                Mis clientes
              </h1>
            </div>

            <p className="text-sm text-slate-500">
              Registra y administra tus clientes.
            </p>
          </div>

          {negocioId && (
            <button
              type="button"
              onClick={abrirNuevoCliente}
              className="flex items-center gap-2 rounded-xl bg-accion px-4 py-3 font-semibold text-white hover:bg-orange-600"
            >
              <UserPlus className="h-5 w-5" />
              Nuevo cliente
            </button>
          )}
        </header>

        {mensaje && (
          <div
            role="status"
            className="mb-5 flex items-center gap-2 rounded-xl bg-green-50 p-4 text-sm text-green-700"
          >
            <CheckCircle2 className="h-5 w-5" />
            {mensaje}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-700"
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>

            {!negocioId && (
              <Link
                to="/configurar-negocio"
                className="mt-3 inline-block font-semibold underline"
              >
                Configurar mi negocio
              </Link>
            )}
          </div>
        )}

        {mostrarFormulario && (
          <form
            onSubmit={guardarCliente}
            className="mb-6 rounded-2xl border border-orange-200 bg-white p-5 shadow-sm sm:p-6"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-principal">
                {clienteEditando
                  ? "Editar cliente"
                  : "Registrar cliente"}
              </h2>

              <button
                type="button"
                onClick={cerrarFormulario}
                disabled={guardando}
                aria-label="Cerrar formulario"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-texto">
                  Nombre del cliente *
                </label>
                <input
                  name="nombre"
                  type="text"
                  required
                  maxLength={150}
                  value={formulario.nombre}
                  onChange={cambiarCampo}
                  placeholder="Ej. María González"
                  className={estiloInput}
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-texto">
                  <CreditCard className="h-4 w-4 text-accion" />
                  Cédula o RUC
                </label>
                <input
                  name="identificacion"
                  type="text"
                  maxLength={30}
                  value={formulario.identificacion}
                  onChange={cambiarCampo}
                  placeholder="Identificación"
                  className={estiloInput}
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-texto">
                  <Phone className="h-4 w-4 text-accion" />
                  Teléfono
                </label>
                <input
                  name="telefono"
                  type="tel"
                  maxLength={30}
                  value={formulario.telefono}
                  onChange={cambiarCampo}
                  placeholder="0991234567"
                  className={estiloInput}
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-texto">
                  <Mail className="h-4 w-4 text-accion" />
                  Correo electrónico
                </label>
                <input
                  name="email"
                  type="email"
                  maxLength={254}
                  value={formulario.email}
                  onChange={cambiarCampo}
                  placeholder="cliente@ejemplo.com"
                  className={estiloInput}
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-texto">
                  <MapPin className="h-4 w-4 text-accion" />
                  Dirección
                </label>
                <input
                  name="direccion"
                  type="text"
                  maxLength={500}
                  value={formulario.direccion}
                  onChange={cambiarCampo}
                  placeholder="Ciudad y dirección"
                  className={estiloInput}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-texto">
                  <StickyNote className="h-4 w-4 text-accion" />
                  Notas
                </label>
                <textarea
                  name="notas"
                  rows={3}
                  maxLength={1000}
                  value={formulario.notas}
                  onChange={cambiarCampo}
                  placeholder="Información adicional del cliente"
                  className={`${estiloInput} resize-y`}
                />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={guardando}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accion px-5 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
              >
                {guardando ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Save className="h-5 w-5" />
                )}
                {guardando
                  ? "Guardando..."
                  : "Guardar cliente"}
              </button>

              <button
                type="button"
                onClick={cerrarFormulario}
                disabled={guardando}
                className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-600"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {negocioId && (
          <>
            <div className="relative mb-5">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />

              <input
                type="search"
                value={busqueda}
                onChange={(evento) =>
                  setBusqueda(evento.target.value)
                }
                placeholder="Buscar por nombre, cédula o teléfono..."
                className={`${estiloInput} pl-12`}
              />
            </div>

            <p className="mb-4 text-sm text-slate-500">
              {clientesFiltrados.length} cliente(s)
            </p>

            {clientesFiltrados.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center">
                <Users className="mx-auto mb-4 h-12 w-12 text-slate-300" />

                <h2 className="text-lg font-bold text-principal">
                  {clientes.length === 0
                    ? "Todavía no tienes clientes"
                    : "No encontramos resultados"}
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  {clientes.length === 0
                    ? "Registra tu primer cliente para comenzar."
                    : "Prueba con otro nombre o número."}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {clientesFiltrados.map((cliente) => (
                  <article
                    key={cliente.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="break-words text-lg font-bold text-principal">
                          {cliente.nombre}
                        </h2>

                        {cliente.identificacion && (
                          <p className="mt-1 text-sm text-slate-500">
                            ID: {cliente.identificacion}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => abrirEdicion(cliente)}
                        aria-label={`Editar ${cliente.nombre}`}
                        className="flex shrink-0 items-center gap-1 rounded-lg bg-orange-50 px-3 py-2 text-sm font-semibold text-accion hover:bg-orange-100"
                      >
                        <Pencil className="h-4 w-4" />
                        Editar
                      </button>
                    </div>

                    {cliente.telefono && (
                      <p className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                        <Phone className="h-4 w-4" />
                        {cliente.telefono}
                      </p>
                    )}

                    {cliente.email && (
                      <p className="mt-2 flex items-center gap-2 break-all text-sm text-slate-600">
                        <Mail className="h-4 w-4 shrink-0" />
                        {cliente.email}
                      </p>
                    )}

                    {cliente.direccion && (
                      <p className="mt-2 flex items-start gap-2 text-sm text-slate-600">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                        {cliente.direccion}
                      </p>
                    )}

                    {cliente.notas && (
                      <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                        {cliente.notas}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            )}
          </>
        )}

        <p className="mt-8 text-center text-xs text-slate-400">
          Cotizafácil · Tus clientes, siempre organizados.
        </p>
      </div>
    </main>
  );
}

export default Clientes;
