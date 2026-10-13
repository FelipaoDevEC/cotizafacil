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
    <main className="min-h-screen bg-white px-4 pb-32 pt-5 sm:py-9">
      <div className="mx-auto max-w-5xl">
        <header className="mb-5 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm text-slate-500">Hola,</p>
            <h1 className="truncate text-2xl font-bold text-slate-900">{negocio?.nombre || "Cotizafácil"}</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-principal"><FileText className="h-6 w-6 text-white" /></div>
            <button type="button" onClick={manejarCerrarSesion} disabled={cerrando} className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 disabled:opacity-60 md:inline-flex">
              {cerrando ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />} {cerrando ? "Saliendo..." : "Cerrar sesión"}
            </button>
          </div>
        </header>

        {error && (
          <div role="alert" className="mb-5 flex items-start gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div className="flex-1">{error}</div>
            <button type="button" onClick={() => setRecargando((n) => n + 1)} className="font-semibold underline">Reintentar</button>
          </div>
        )}

        {!cargando && !negocio && !error && (
          <div className="mb-5 rounded-xl border border-orange-200 bg-orange-50 p-4">
            <p className="font-semibold text-slate-900">Primero configura tu negocio.</p>
            <Link to="/configurar-negocio" className="mt-2 inline-flex items-center gap-1 font-semibold text-accion">Configurar negocio <ArrowRight className="h-4 w-4" /></Link>
          </div>
        )}

        <section className="mb-4 rounded-3xl bg-accion p-6 text-white sm:p-8">
          <div className="flex items-center gap-2 text-sm font-semibold"><Wallet className="h-5 w-5" /> Total cotizado</div>
          <div className="mt-3 break-words text-4xl font-bold sm:text-5xl">
            {cargando ? "Cargando..." : formatearMoneda(resumen.totalCotizado)}
          </div>
          <p className="mt-2 text-sm text-white/90">{cargando ? "Consultando cotizaciones" : `${resumen.cantidadCotizaciones} cotizaciones registradas`}</p>
        </section>

        <section className="mb-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <p className="mt-3 text-sm text-slate-500">Aceptadas</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{cargando ? "—" : resumen.aceptadas}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <Users className="h-5 w-5 text-accion" />
            <p className="mt-3 text-sm text-slate-500">Clientes</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{cargando ? "—" : resumen.cantidadClientes}</p>
          </div>
        </section>

        <section className="mb-7 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-bold text-slate-900">Cotizaciones recientes</h2>
            <Link to="/cotizaciones" className="shrink-0 text-sm font-semibold text-accion">Ver todas →</Link>
          </div>
          {cargando ? (
            <p className="flex items-center gap-2 py-5 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Cargando...</p>
          ) : cotizaciones.length === 0 ? (
            <p className="py-5 text-sm text-slate-500">Aún no hay cotizaciones. Crea la primera.</p>
          ) : (
            <div className="divide-y divide-slate-200">
              {cotizaciones.slice(0, 5).map((cotizacion) => {
                const estado = ESTADOS[cotizacion.estado] ?? ESTADOS.borrador;
                return (
                  <div key={cotizacion.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-slate-900">{nombresClientes[cotizacion.cliente_id] || "Cliente no disponible"}</p>
                      <p className="mt-1 break-all text-xs text-slate-500">{cotizacion.numero}</p>
                      <p className="mt-1 text-xs text-slate-500">{fechaLegible(cotizacion.fecha_emision)} · {estado.texto}</p>
                    </div>
                    <p className="shrink-0 font-bold text-slate-900">{formatearMoneda(cotizacion.total)}</p>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <div className="mb-5 flex items-center justify-between">
          <button type="button" onClick={() => setRecargando((n) => n + 1)} disabled={cargando} className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 disabled:opacity-50">
            <RefreshCw className={`h-4 w-4 ${cargando ? "animate-spin" : ""}`} /> Actualizar resumen
          </button>
          <button type="button" onClick={manejarCerrarSesion} disabled={cerrando} className="inline-flex items-center gap-1 text-sm text-slate-500 disabled:opacity-50 md:hidden">
            <LogOut className="h-4 w-4" /> {cerrando ? "Saliendo..." : "Salir"}
          </button>
        </div>

        <section className="mb-7 hidden md:block">
          <h2 className="mb-3 text-lg font-bold text-slate-900">Accesos rápidos</h2>
          <div className="grid grid-cols-2 gap-3">
            {ACCESOS.map((acceso) => {
              const Icono = acceso.icono;
              return <Link key={acceso.ruta} to={acceso.ruta} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 font-semibold text-slate-900"><Icono className="h-5 w-5 text-accion" />{acceso.titulo}</Link>;
            })}
          </div>
        </section>

        <Link to="/cotizaciones/nueva" className="fixed bottom-[calc(88px+env(safe-area-inset-bottom))] right-4 z-30 inline-flex items-center gap-2 rounded-full bg-accion px-5 py-4 font-bold text-white shadow-xl transition hover:bg-orange-600 md:static md:rounded-xl md:shadow-none">
          <FilePlus2 className="h-5 w-5" /> Nueva cotización
        </Link>
      </div>
    </main>
  );
}

export default Bienvenida;
