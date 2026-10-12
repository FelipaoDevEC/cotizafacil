import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  LogOut,
  Store,
  ArrowRight,
  Users,
  Package,
  FilePlus2,
  History,
  Wallet,
  CheckCircle2,
  Loader2,
  AlertCircle,
  CalendarDays,
  RefreshCw,
} from "lucide-react";

import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

const ESTADOS = {
  borrador: { texto: "Borrador", clase: "bg-slate-100 text-slate-700" },
  enviada: { texto: "Enviada", clase: "bg-blue-50 text-blue-700" },
  aceptada: { texto: "Aceptada", clase: "bg-green-50 text-green-700" },
  rechazada: { texto: "Rechazada", clase: "bg-red-50 text-red-700" },
};

const ACCESOS = [
  { titulo: "Mis clientes", descripcion: "Registra y administra tus clientes.", ruta: "/clientes", icono: Users },
  { titulo: "Catálogo de precios", descripcion: "Materiales y mano de obra.", ruta: "/catalogo", icono: Package },
  { titulo: "Historial", descripcion: "Consulta, descarga y comparte PDF.", ruta: "/cotizaciones", icono: History },
  { titulo: "Mi negocio", descripcion: "Datos, logotipo y preferencias.", ruta: "/configurar-negocio", icono: Store },
];

function fechaLegible(fecha) {
  if (!fecha) return "Sin fecha";
  const [anio, mes, dia] = fecha.split("-");
  return anio && mes && dia ? `${dia}/${mes}/${anio}` : fecha;
}

function Bienvenida() {
  const { usuario, cerrarSesion } = useAuth();
  const [cerrando, setCerrando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [recargando, setRecargando] = useState(0);
  const [error, setError] = useState("");
  const [negocio, setNegocio] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [cotizaciones, setCotizaciones] = useState([]);

  useEffect(() => {
    if (!usuario?.id) return;
    let activo = true;

    async function cargarDashboard() {
      setCargando(true);
      setError("");

      try {
        const { data: datosNegocio, error: errorNegocio } = await supabase
          .from("negocios")
          .select("id, nombre, moneda")
          .eq("usuario_id", usuario.id)
          .maybeSingle();

        if (errorNegocio) throw errorNegocio;
        if (!activo) return;

        setNegocio(datosNegocio ?? null);

        if (!datosNegocio) {
          setClientes([]);
          setCotizaciones([]);
          return;
        }

        const [resultadoClientes, resultadoCotizaciones] = await Promise.all([
          supabase
            .from("clientes")
            .select("id, nombre")
            .eq("negocio_id", datosNegocio.id),
          supabase
            .from("cotizaciones")
            .select("id, numero, cliente_id, fecha_emision, estado, total, creado_en")
            .eq("negocio_id", datosNegocio.id)
            .order("creado_en", { ascending: false }),
        ]);

        if (resultadoClientes.error) throw resultadoClientes.error;
        if (resultadoCotizaciones.error) throw resultadoCotizaciones.error;
        if (!activo) return;

        setClientes(resultadoClientes.data ?? []);
        setCotizaciones(resultadoCotizaciones.data ?? []);
      } catch (errorConsulta) {
        if (activo) {
          setError(errorConsulta.message || "No se pudo cargar el resumen del negocio.");
        }
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargarDashboard();
    return () => { activo = false; };
  }, [usuario?.id, recargando]);

  const resumen = useMemo(() => ({
    cantidadCotizaciones: cotizaciones.length,
    cantidadClientes: clientes.length,
    totalCotizado: cotizaciones.reduce((acumulado, cotizacion) => acumulado + (Number(cotizacion.total) || 0), 0),
    aceptadas: cotizaciones.filter((cotizacion) => cotizacion.estado === "aceptada").length,
  }), [cotizaciones, clientes]);

  const nombresClientes = useMemo(() => {
    return Object.fromEntries(clientes.map((cliente) => [cliente.id, cliente.nombre]));
  }, [clientes]);

  function formatearMoneda(valor) {
    const codigo = negocio?.moneda || "USD";
    try {
      return new Intl.NumberFormat("es-EC", {
        style: "currency",
        currency: codigo,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(Number(valor) || 0);
    } catch {
      return `${codigo} ${Number(valor || 0).toFixed(2)}`;
    }
  }

  async function manejarCerrarSesion() {
    setError("");
    setCerrando(true);
    try {
      await cerrarSesion();
    } catch (errorSesion) {
      setError(errorSesion.message || "No se pudo cerrar la sesión.");
      setCerrando(false);
    }
  }

  const indicadores = [
    { etiqueta: "Cotizaciones", valor: resumen.cantidadCotizaciones, icono: FileText, fondo: "bg-blue-50", iconoColor: "text-blue-700" },
    { etiqueta: "Clientes", valor: resumen.cantidadClientes, icono: Users, fondo: "bg-orange-50", iconoColor: "text-accion" },
    { etiqueta: "Total cotizado", valor: formatearMoneda(resumen.totalCotizado), icono: Wallet, fondo: "bg-violet-50", iconoColor: "text-violet-700" },
    { etiqueta: "Aceptadas", valor: resumen.aceptadas, icono: CheckCircle2, fondo: "bg-green-50", iconoColor: "text-green-700" },
  ];

  return (
    <main className="min-h-screen bg-fondo px-4 py-6 sm:py-9">
      <div className="mx-auto max-w-5xl">
        <header className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-principal sm:h-14 sm:w-14">
              <FileText className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-principal">Cotizafácil</h1>
              <p className="text-sm text-slate-500">Panel de control</p>
            </div>
          </div>
          <button
            type="button"
            onClick={manejarCerrarSesion}
            disabled={cerrando}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-principal hover:bg-slate-50 disabled:opacity-60"
          >
            {cerrando ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
            {cerrando ? "Saliendo..." : "Cerrar sesión"}
          </button>
        </header>

        <section className="mb-6 rounded-3xl bg-principal p-6 text-white sm:p-8">
          <p className="text-sm font-medium text-blue-100">RESUMEN DE TU NEGOCIO</p>
          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
            {negocio?.nombre ? `¡Hola, ${negocio.nombre}!` : "¡Bienvenido a Cotizafácil!"}
          </h2>
          <p className="mt-2 text-sm text-blue-100 sm:text-base">Tus clientes y cotizaciones, organizados en un solo lugar.</p>
          <Link
            to="/cotizaciones/nueva"
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accion px-5 py-3.5 font-bold text-white transition hover:bg-orange-600 sm:w-auto"
          >
            <FilePlus2 className="h-5 w-5" /> Nueva cotización <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        {error && (
          <div role="alert" className="mb-6 flex items-start gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div className="flex-1">{error}</div>
            <button type="button" onClick={() => setRecargando((valor) => valor + 1)} className="font-semibold underline">Reintentar</button>
          </div>
        )}

        {!cargando && !negocio && !error && (
          <div className="mb-6 rounded-2xl border border-orange-200 bg-orange-50 p-5">
            <div className="flex items-start gap-3">
              <Store className="h-6 w-6 shrink-0 text-accion" />
              <div>
                <h3 className="font-bold text-principal">Primero, configura tu negocio</h3>
                <p className="mt-1 text-sm text-slate-600">Agrega los datos que aparecerán en tus cotizaciones.</p>
                <Link to="/configurar-negocio" className="mt-3 inline-flex items-center gap-2 font-semibold text-accion">Configurar negocio <ArrowRight className="h-4 w-4" /></Link>
              </div>
            </div>
          </div>
        )}

        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-lg font-bold text-principal">Tu resumen</h3>
          <button
            type="button"
            onClick={() => setRecargando((valor) => valor + 1)}
            disabled={cargando}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-accion disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${cargando ? "animate-spin" : ""}`} /> Actualizar
          </button>
        </div>

        <section className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {indicadores.map((indicador) => {
            const Icono = indicador.icono;
            return (
              <div key={indicador.etiqueta} className="min-w-0 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
                <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${indicador.fondo}`}>
                  <Icono className={`h-5 w-5 ${indicador.iconoColor}`} />
                </div>
                <p className="text-xs font-medium text-slate-500 sm:text-sm">{indicador.etiqueta}</p>
                {cargando ? (
                  <div className="mt-2 h-7 w-20 animate-pulse rounded bg-slate-100" />
                ) : (
                  <p className="mt-1 break-words text-xl font-bold text-principal sm:text-2xl">{indicador.valor}</p>
                )}
              </div>
            );
          })}
        </section>

        <section className="mb-8">
          <h3 className="mb-4 text-lg font-bold text-principal">Accesos rápidos</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {ACCESOS.map((acceso) => {
              const Icono = acceso.icono;
              return (
                <Link key={acceso.ruta} to={acceso.ruta} className="group flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:border-orange-200 hover:shadow-md">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50">
                    <Icono className="h-6 w-6 text-accion" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-principal">{acceso.titulo}</h4>
                    <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">{acceso.descripcion}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 shrink-0 text-slate-400 group-hover:text-accion" />
                </Link>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-principal">Cotizaciones recientes</h3>
              <p className="mt-1 text-sm text-slate-500">Tus últimas cinco cotizaciones registradas.</p>
            </div>
            <Link to="/cotizaciones" className="inline-flex items-center gap-1 text-sm font-semibold text-accion">Ver historial <ArrowRight className="h-4 w-4" /></Link>
          </div>

          {cargando ? (
            <div className="flex items-center gap-2 py-8 text-sm text-slate-500"><Loader2 className="h-5 w-5 animate-spin text-accion" /> Cargando cotizaciones...</div>
          ) : cotizaciones.length === 0 ? (
            <div className="rounded-xl bg-slate-50 px-4 py-8 text-center">
              <FileText className="mx-auto h-9 w-9 text-slate-300" />
              <p className="mt-3 font-semibold text-principal">Aún no hay cotizaciones</p>
              <p className="mt-1 text-sm text-slate-500">Crea una cotización y aparecerá aquí.</p>
              <Link to="/cotizaciones/nueva" className="mt-4 inline-flex items-center gap-2 font-semibold text-accion">Crear cotización <ArrowRight className="h-4 w-4" /></Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {cotizaciones.slice(0, 5).map((cotizacion) => {
                const estado = ESTADOS[cotizacion.estado] ?? ESTADOS.borrador;
                return (
                  <div key={cotizacion.id} className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0">
                    <div className="min-w-0 flex-1">
                      <p className="break-all font-bold text-principal">{cotizacion.numero}</p>
                      <p className="mt-1 text-sm text-slate-600">{nombresClientes[cotizacion.cliente_id] || "Cliente no disponible"}</p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-slate-400"><CalendarDays className="h-3.5 w-3.5" />{fechaLegible(cotizacion.fecha_emision)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-principal">{formatearMoneda(cotizacion.total)}</p>
                      <span className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${estado.clase}`}>{estado.texto}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <footer className="mt-7 text-center">
          <p className="break-all text-xs text-slate-500">Sesión: {usuario?.email}</p>
          <p className="mt-2 text-xs text-slate-400">Cotizafácil · Tu negocio, tus cotizaciones.</p>
        </footer>
      </div>
    </main>
  );
}

export default Bienvenida;
