import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Search,
  Eye,
  X,
  Loader2,
  AlertCircle,
  CalendarDays,
  UserRound,
  Plus,
  Package,
  Hammer,
  Download,
  Share2,
  MessageCircle,
  Trash2,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import {
  generarPdfCotizacion,
  crearArchivoPdfCotizacion,
} from "../lib/generarPdfCotizacion";
const ESTADOS = {
  borrador: {
    nombre: "Borrador",
    clases: "bg-slate-100 text-slate-700",
  },
  enviada: {
    nombre: "Enviada",
    clases: "bg-blue-50 text-blue-700",
  },
  aceptada: {
    nombre: "Aceptada",
    clases: "bg-green-50 text-green-700",
  },
  rechazada: {
    nombre: "Rechazada",
    clases: "bg-red-50 text-red-700",
  },
};
function HistorialCotizaciones() {
  const { usuario } = useAuth();
  const [negocio, setNegocio] = useState(null);
  const [cotizaciones, setCotizaciones] = useState([]);
  const [clientes, setClientes] = useState({});
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [cotizacionSeleccionada, setCotizacionSeleccionada] =
    useState(null);
  const [detalles, setDetalles] = useState([]);
  const [cargandoDetalles, setCargandoDetalles] = useState(false);
  const [errorDetalles, setErrorDetalles] = useState("");
  const [procesandoPdf, setProcesandoPdf] = useState(false);
  const [guardandoEstado, setGuardandoEstado] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [confirmarEliminacion, setConfirmarEliminacion] = useState(false);
  const [errorEliminacion, setErrorEliminacion] = useState("");
  const [avisoHistorial, setAvisoHistorial] = useState("");
  const [errorEstado, setErrorEstado] = useState("");
  const [exitoEstado, setExitoEstado] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  useEffect(() => {
    if (!usuario?.id) return;
    let activo = true;
    async function cargarHistorial() {
      setCargando(true);
      setError("");
      const { data: datosNegocio, error: errorNegocio } =
        await supabase
          .from("negocios")
          .select(
            "id, nombre, telefono, email, direccion, moneda, color_pdf, logo_url"
          )
          .eq("usuario_id", usuario.id)
          .maybeSingle();
      if (!activo) return;
      if (errorNegocio) {
        setError(errorNegocio.message);
        setCargando(false);
        return;
      }
      if (!datosNegocio) {
        setError("Primero debes configurar tu negocio.");
        setCargando(false);
        return;
      }
      const [resultadoCotizaciones, resultadoClientes] =
        await Promise.all([
          supabase
            .from("cotizaciones")
            .select(
              "id, numero, cliente_id, fecha_emision, fecha_vencimiento, estado, subtotal, descuento, aplicar_iva, iva_porcentaje, iva_valor, total, notas, terminos, creado_en"
            )
            .eq("negocio_id", datosNegocio.id)
            .order("creado_en", { ascending: false }),
          supabase
            .from("clientes")
            .select(
              "id, nombre, identificacion, telefono, email, direccion"
            )
            .eq("negocio_id", datosNegocio.id),
        ]);
      if (!activo) return;
      if (
        resultadoCotizaciones.error ||
        resultadoClientes.error
      ) {
        setError(
          resultadoCotizaciones.error?.message ||
          resultadoClientes.error?.message
        );
        setCargando(false);
        return;
      }
      const mapaClientes = {};
      for (const cliente of resultadoClientes.data ?? []) {
        mapaClientes[cliente.id] = cliente;
      }
      setNegocio(datosNegocio);
      setCotizaciones(resultadoCotizaciones.data ?? []);
      setClientes(mapaClientes);
      setCargando(false);
    }
    cargarHistorial();
    return () => {
      activo = false;
    };
  }, [usuario?.id]);
  function formatearMoneda(valor) {
    const moneda = negocio?.moneda ?? "USD";
    try {
      return new Intl.NumberFormat("es-EC", {
        style: "currency",
        currency: moneda,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(Number(valor) || 0);
    } catch {
      return `${moneda} ${Number(valor || 0).toFixed(2)}`;
    }
  }
  function formatearFecha(fechaTexto) {
    if (!fechaTexto) return "Sin fecha";
    const [anio, mes, dia] = fechaTexto.split("-");
    if (!anio || !mes || !dia) return fechaTexto;
    return `${dia}/${mes}/${anio}`;
  }
  async function abrirDetalle(cotizacion) {
    setCotizacionSeleccionada(cotizacion);
    setErrorEstado("");
    setExitoEstado("");
    setConfirmarEliminacion(false);
    setErrorEliminacion("");
    setDetalles([]);
    setErrorDetalles("");
    setAviso("");
    setCargandoDetalles(true);
    const { data, error: errorConsulta } = await supabase
      .from("cotizacion_items")
      .select(
        "id, descripcion, tipo, unidad, cantidad, precio_unitario, subtotal, orden"
      )
      .eq("cotizacion_id", cotizacion.id)
      .eq("negocio_id", negocio.id)
      .order("orden", { ascending: true });
    if (errorConsulta) {
      setErrorDetalles(errorConsulta.message);
    } else {
      setDetalles(data ?? []);
    }
    setCargandoDetalles(false);
  }
  function cerrarDetalle() {
    if (procesandoPdf || guardandoEstado || eliminando) return;
    setCotizacionSeleccionada(null);
    setConfirmarEliminacion(false);
    setErrorEliminacion("");
    setErrorEstado("");
    setExitoEstado("");
    setDetalles([]);
    setErrorDetalles("");
    setAviso("");
  }
  async function cambiarEstado(nuevoEstado) {
    if (!cotizacionSeleccionada || !negocio || !usuario?.id || guardandoEstado || procesandoPdf) return;
    if (!Object.prototype.hasOwnProperty.call(ESTADOS, nuevoEstado)) return;
    if (nuevoEstado === cotizacionSeleccionada.estado) return;

    setGuardandoEstado(true);
    setErrorEstado("");
    setExitoEstado("");

    try {
      const { data, error: errorActualizacion } = await supabase
        .from("cotizaciones")
        .update({ estado: nuevoEstado })
        .eq("id", cotizacionSeleccionada.id)
        .eq("negocio_id", negocio.id)
        .eq("usuario_id", usuario.id)
        .select("id, estado")
        .single();

      if (errorActualizacion) throw errorActualizacion;
      if (!data) throw new Error("No se pudo confirmar el cambio de estado.");

      setCotizaciones((anteriores) =>
        anteriores.map((cotizacion) =>
          cotizacion.id === data.id
            ? { ...cotizacion, estado: data.estado }
            : cotizacion
        )
      );
      setCotizacionSeleccionada((anterior) =>
        anterior?.id === data.id
          ? { ...anterior, estado: data.estado }
          : anterior
      );
      setExitoEstado(`Estado actualizado a ${ESTADOS[data.estado]?.nombre ?? data.estado}.`);
    } catch (errorActualizacion) {
      console.error("Error al actualizar el estado:", errorActualizacion);
      setErrorEstado(errorActualizacion.message || "No fue posible actualizar el estado.");
    } finally {
      setGuardandoEstado(false);
    }
  }
  async function eliminarCotizacion() {
    if (!confirmarEliminacion || !cotizacionSeleccionada || !negocio?.id || !usuario?.id) return;
    if (eliminando || procesandoPdf || guardandoEstado || cargandoDetalles) return;

    const id = cotizacionSeleccionada.id;
    const numero = cotizacionSeleccionada.numero;
    setEliminando(true);
    setErrorEliminacion("");
    setAvisoHistorial("");

    try {
      // Borramos primero la cabecera. Si la FK restringe el borrado,
      // Supabase lo rechazará sin eliminar los conceptos.
      // Si la FK tiene ON DELETE CASCADE, eliminará también los conceptos.
      const { data, error: errorBorrado } = await supabase
        .from("cotizaciones")
        .delete()
        .eq("id", id)
        .eq("negocio_id", negocio.id)
        .eq("usuario_id", usuario.id)
        .select("id");

      if (errorBorrado) throw errorBorrado;
      if (!data?.some((fila) => fila.id === id)) {
        throw new Error("No se confirmó la eliminación. Comprueba los permisos de Supabase.");
      }

      // Comprobación posterior: detecta si la base de datos no aplicó CASCADE.
      const { data: conceptosRestantes, error: errorRevision } = await supabase
        .from("cotizacion_items")
        .select("id")
        .eq("cotizacion_id", id)
        .eq("negocio_id", negocio.id)
        .limit(1);

      setCotizaciones((anteriores) => anteriores.filter((fila) => fila.id !== id));
      setCotizacionSeleccionada(null);
      setConfirmarEliminacion(false);
      setDetalles([]);

      if (errorRevision) {
        setAvisoHistorial(`Cotización ${numero} eliminada. No se pudo verificar la eliminación de sus conceptos: ${errorRevision.message}`);
      } else if (conceptosRestantes?.length) {
        setAvisoHistorial(`Cotización ${numero} eliminada, pero quedaron conceptos asociados. Revisa la relación de borrado en Supabase antes de continuar.`);
      } else {
        setAvisoHistorial(`Cotización ${numero} eliminada correctamente, junto con sus conceptos.`);
      }
    } catch (errorBorrado) {
      console.error("Error al eliminar cotización:", errorBorrado);
      setErrorEliminacion(
        errorBorrado.message || "No se pudo eliminar la cotización. No se modificó el historial."
      );
    } finally {
      setEliminando(false);
    }
  }

  function obtenerDatosPdf() {
    return {
      negocio,
      cliente: clientes[cotizacionSeleccionada.cliente_id],
      cotizacion: cotizacionSeleccionada,
      conceptos: detalles,
    };
  }
  function validarPdf() {
    if (
      !negocio ||
      !cotizacionSeleccionada ||
      cargandoDetalles ||
      detalles.length === 0
    ) {
      setErrorDetalles(
        "Los conceptos deben cargarse antes de generar el PDF."
      );
      return false;
    }
    return true;
  }
  async function descargarPdf() {
    if (!validarPdf()) return;
    setProcesandoPdf(true);
    setErrorDetalles("");
    setAviso("");
    try {
      await generarPdfCotizacion(obtenerDatosPdf());
    } catch (errorPdf) {
      console.error("Error al descargar PDF:", errorPdf);
      setErrorDetalles(
        errorPdf.message || "No fue posible descargar el PDF."
      );
    } finally {
      setProcesandoPdf(false);
    }
  }
  async function compartirPdf() {
    if (!validarPdf()) return;
    setProcesandoPdf(true);
    setErrorDetalles("");
    setAviso("");
    try {
      const archivo = await crearArchivoPdfCotizacion(
        obtenerDatosPdf()
      );
      const datosCompartir = {
        files: [archivo],
      };
      if (
        !navigator.share ||
        !navigator.canShare ||
        !navigator.canShare(datosCompartir)
      ) {
        setAviso(
          "Tu navegador no permite compartir archivos directamente. " +
          "Descarga el PDF y adjúntalo manualmente en WhatsApp."
        );
        return;
      }
      await navigator.share(datosCompartir);
    } catch (errorCompartir) {
      if (errorCompartir.name !== "AbortError") {
        console.error("Error al compartir PDF:", errorCompartir);
        setErrorDetalles(
          errorCompartir.message ||
            "No fue posible compartir el PDF."
        );
      }
    } finally {
      setProcesandoPdf(false);
    }
  }
  function normalizarTelefono(telefono) {
    let numero = String(telefono ?? "").replace(/\D/g, "");
    // Formato ecuatoriano:
    // 0991234567 -> 593991234567
    // 991234567 -> 593991234567
    if (numero.startsWith("0") && numero.length === 10) {
      numero = `593${numero.slice(1)}`;
    } else if (numero.length === 9) {
      numero = `593${numero}`;
    } else if (
      numero.startsWith("00") &&
      numero.length > 11
    ) {
      numero = numero.slice(2);
    }
    return numero;
  }
  function abrirWhatsApp() {
    if (!cotizacionSeleccionada) return;
    const cliente =
      clientes[cotizacionSeleccionada.cliente_id];
    const nombreCliente = cliente?.nombre || "cliente";
    const numeroTelefono = normalizarTelefono(
      cliente?.telefono
    );
    const mensaje =
      `Hola ${nombreCliente}, te comparto la cotización ` +
      `${cotizacionSeleccionada.numero} de ${negocio.nombre}.\n\n` +
      `Total: ${formatearMoneda(cotizacionSeleccionada.total)}\n` +
      `Válida hasta: ${formatearFecha(cotizacionSeleccionada.fecha_vencimiento)}.\n\n` +
      `Quedo atento a tus comentarios.`;
    const destino = numeroTelefono
      ? `https://wa.me/${numeroTelefono}?text=${encodeURIComponent(mensaje)}`
      : `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
    window.open(destino, "_blank", "noopener,noreferrer");
  }
  const cotizacionesFiltradas = useMemo(() => {
    const termino = busqueda.trim().toLocaleLowerCase("es");
    return cotizaciones.filter((cotizacion) => {
      if (
        filtroEstado !== "todos" &&
        cotizacion.estado !== filtroEstado
      ) {
        return false;
      }
      const cliente = clientes[cotizacion.cliente_id];
      const texto = [
        cotizacion.numero,
        cliente?.nombre,
        cliente?.identificacion,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("es");
      return texto.includes(termino);
    });
  }, [cotizaciones, clientes, busqueda, filtroEstado]);
  if (cargando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-fondo">
        <Loader2 className="mr-3 h-9 w-9 animate-spin text-accion" />
        <p className="text-principal">
          Cargando cotizaciones...
        </p>
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
              <FileText className="h-7 w-7 text-accion" />
              <h1 className="text-2xl font-bold text-principal">
                Historial de cotizaciones
              </h1>
            </div>
            <p className="text-sm text-slate-500">
              Consulta, descarga y comparte tus cotizaciones.
            </p>
          </div>
          <Link
            to="/cotizaciones/nueva"
            className="flex items-center gap-2 rounded-xl bg-accion px-4 py-3 font-semibold text-white hover:bg-orange-600"
          >
            <Plus className="h-5 w-5" />
            Nueva cotización
          </Link>
        </header>
        {error && (
          <div
            role="alert"
            className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-700"
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
            {!negocio && (
              <Link
                to="/configurar-negocio"
                className="mt-3 inline-block font-semibold underline"
              >
                Configurar mi negocio
              </Link>
            )}
          </div>
        )}
        {avisoHistorial && (
          <div role="status" className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            {avisoHistorial}
          </div>
        )}
        {negocio && (
          <>
            <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
              <div className="relative">
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="search"
                  value={busqueda}
                  onChange={(evento) =>
                    setBusqueda(evento.target.value)
                  }
                  placeholder="Buscar por número o cliente..."
                  className="w-full rounded-xl border border-slate-300 py-3 pl-12 pr-4 outline-none focus:border-accion"
                />
              </div>
              <div className="mt-3">
                <label className="mb-2 block text-sm font-semibold text-texto">
                  Filtrar por estado
                </label>
                <select
                  value={filtroEstado}
                  onChange={(evento) =>
                    setFiltroEstado(evento.target.value)
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-accion"
                >
                  <option value="todos">Todos los estados</option>
                  <option value="borrador">Borrador</option>
                  <option value="enviada">Enviada</option>
                  <option value="aceptada">Aceptada</option>
                  <option value="rechazada">Rechazada</option>
                </select>
              </div>
            </div>
            <p className="mb-4 text-sm text-slate-500">
              {cotizacionesFiltradas.length} cotización(es)
            </p>
            {cotizacionesFiltradas.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center">
                <FileText className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                <h2 className="text-lg font-bold text-principal">
                  {cotizaciones.length === 0
                    ? "Todavía no tienes cotizaciones"
                    : "No encontramos resultados"}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  {cotizaciones.length === 0
                    ? "Crea tu primera cotización para verla aquí."
                    : "Prueba con otra búsqueda o estado."}
                </p>
                {cotizaciones.length === 0 && (
                  <Link
                    to="/cotizaciones/nueva"
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-accion px-5 py-3 font-semibold text-white"
                  >
                    <Plus className="h-5 w-5" />
                    Crear cotización
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {cotizacionesFiltradas.map((cotizacion) => {
                  const cliente = clientes[cotizacion.cliente_id];
                  const estado =
                    ESTADOS[cotizacion.estado] ??
                    ESTADOS.borrador;
                  return (
                    <article
                      key={cotizacion.id}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h2 className="break-all text-lg font-bold text-principal">
                            {cotizacion.numero}
                          </h2>
                          <p className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                            <UserRound className="h-4 w-4 shrink-0" />
                            {cliente?.nombre ?? "Cliente no disponible"}
                          </p>
                          <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                            <CalendarDays className="h-4 w-4" />
                            {formatearFecha(cotizacion.fecha_emision)}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${estado.clases}`}
                        >
                          {estado.nombre}
                        </span>
                      </div>
                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                        <div>
                          <p className="text-xs text-slate-500">
                            Total
                          </p>
                          <p className="text-xl font-bold text-principal">
                            {formatearMoneda(cotizacion.total)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => abrirDetalle(cotizacion)}
                          className="flex items-center gap-2 rounded-xl bg-orange-50 px-4 py-3 text-sm font-semibold text-accion hover:bg-orange-100"
                        >
                          <Eye className="h-4 w-4" />
                          Ver detalle
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}
        {cotizacionSeleccionada && (
          <div
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/60 p-3 py-6 sm:p-6"
            role="presentation"
            onMouseDown={(evento) => {
              if (evento.target === evento.currentTarget) {
                cerrarDetalle();
              }
            }}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="titulo-detalle"
              className="w-full max-w-2xl rounded-2xl bg-white p-5 shadow-xl sm:p-7"
            >
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase text-accion">
                    Detalle de cotización
                  </p>
                  <h2
                    id="titulo-detalle"
                    className="mt-1 break-all text-xl font-bold text-principal"
                  >
                    {cotizacionSeleccionada.numero}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={cerrarDetalle}
                  aria-label="Cerrar detalle"
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="mb-5 grid gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-xs text-slate-500">
                    Cliente
                  </p>
                  <p className="font-semibold text-principal">
                    {clientes[cotizacionSeleccionada.cliente_id]
                      ?.nombre ?? "Cliente no disponible"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">
                    Estado
                  </p>
                  <p className="font-semibold text-principal">
                    {ESTADOS[cotizacionSeleccionada.estado]
                      ?.nombre ?? cotizacionSeleccionada.estado}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">
                    Fecha de emisión
                  </p>
                  <p className="font-semibold text-principal">
                    {formatearFecha(
                      cotizacionSeleccionada.fecha_emision
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">
                    Válida hasta
                  </p>
                  <p className="font-semibold text-principal">
                    {formatearFecha(
                      cotizacionSeleccionada.fecha_vencimiento
                    )}
                  </p>
                </div>
              </div>
              <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4">
                <label htmlFor="estado-cotizacion" className="mb-2 block text-sm font-bold text-principal">
                  Cambiar estado de la cotización
                </label>
                <div className="flex items-center gap-3">
                  <select
                    id="estado-cotizacion"
                    value={cotizacionSeleccionada.estado}
                    onChange={(evento) => cambiarEstado(evento.target.value)}
                    disabled={guardandoEstado || procesandoPdf}
                    className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-principal outline-none focus:border-accion disabled:opacity-50"
                  >
                    {Object.entries(ESTADOS).map(([clave, estado]) => (
                      <option key={clave} value={clave}>{estado.nombre}</option>
                    ))}
                  </select>
                  {guardandoEstado && <Loader2 className="h-5 w-5 animate-spin text-accion" aria-label="Guardando estado" />}
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  El cambio se guarda automáticamente y se reflejará en el dashboard.
                </p>
                {errorEstado && (
                  <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{errorEstado}</p>
                )}
                {exitoEstado && (
                  <p role="status" className="mt-3 rounded-lg bg-green-50 p-3 text-sm text-green-700">{exitoEstado}</p>
                )}
              </div>
              <h3 className="mb-3 font-bold text-principal">
                Materiales y mano de obra
              </h3>
              {cargandoDetalles ? (
                <div className="flex items-center justify-center gap-3 py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-accion" />
                  <p className="text-sm text-slate-500">
                    Cargando conceptos...
                  </p>
                </div>
              ) : errorDetalles ? (
                <div
                  role="alert"
                  className="rounded-xl bg-red-50 p-4 text-sm text-red-700"
                >
                  {errorDetalles}
                </div>
              ) : detalles.length === 0 ? (
                <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                  No se encontraron conceptos para esta cotización.
                </div>
              ) : (
                <div className="space-y-3">
                  {detalles.map((item) => {
                    const Icono =
                      item.tipo === "mano_obra" ? Hammer : Package;
                    return (
                      <div
                        key={item.id}
                        className="rounded-xl border border-slate-200 p-4"
                      >
                        <div className="flex items-start gap-3">
                          <Icono className="mt-1 h-5 w-5 shrink-0 text-accion" />
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-principal">
                              {item.descripcion}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {item.tipo === "mano_obra"
                                ? "Mano de obra"
                                : "Material"}
                            </p>
                            <p className="mt-2 text-sm text-slate-600">
                              {Number(item.cantidad)} {item.unidad}
                              {" × "}
                              {formatearMoneda(item.precio_unitario)}
                            </p>
                            <p className="mt-2 font-bold text-principal">
                              {formatearMoneda(item.subtotal)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="mt-5 space-y-3 rounded-xl bg-slate-50 p-4 text-sm">
                <div className="flex justify-between gap-3">
                  <span>Subtotal</span>
                  <strong>
                    {formatearMoneda(
                      cotizacionSeleccionada.subtotal
                    )}
                  </strong>
                </div>
                <div className="flex justify-between gap-3">
                  <span>Descuento</span>
                  <strong>
                    - {formatearMoneda(
                      cotizacionSeleccionada.descuento
                    )}
                  </strong>
                </div>
                <div className="flex justify-between gap-3">
                  <span>
                    IVA (
                    {cotizacionSeleccionada.aplicar_iva
                      ? `${cotizacionSeleccionada.iva_porcentaje} %`
                      : "No aplicado"}
                    )
                  </span>
                  <strong>
                    {formatearMoneda(
                      cotizacionSeleccionada.iva_valor
                    )}
                  </strong>
                </div>
                <div className="flex justify-between gap-3 border-t border-slate-200 pt-3 text-lg font-bold text-principal">
                  <span>Total</span>
                  <span>
                    {formatearMoneda(
                      cotizacionSeleccionada.total
                    )}
                  </span>
                </div>
              </div>
              {cotizacionSeleccionada.notas && (
                <div className="mt-5">
                  <h3 className="mb-2 font-bold text-principal">
                    Notas
                  </h3>
                  <p className="whitespace-pre-wrap text-sm text-slate-600">
                    {cotizacionSeleccionada.notas}
                  </p>
                </div>
              )}
              {cotizacionSeleccionada.terminos && (
                <div className="mt-5">
                  <h3 className="mb-2 font-bold text-principal">
                    Términos y condiciones
                  </h3>
                  <p className="whitespace-pre-wrap text-sm text-slate-600">
                    {cotizacionSeleccionada.terminos}
                  </p>
                </div>
              )}
              {aviso && (
                <div
                  role="status"
                  className="mt-5 rounded-xl bg-blue-50 p-4 text-sm text-blue-800"
                >
                  {aviso}
                </div>
              )}
              <div className="mt-6 space-y-3">
                <Link
                  to={`/cotizaciones/${cotizacionSeleccionada.id}/editar`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-accion px-5 py-3.5 font-semibold text-accion hover:bg-orange-50"
                >
                  Editar cotización
                </Link>
                <Link
                  to={`/cotizaciones/nueva?duplicar=${cotizacionSeleccionada.id}`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-principal px-5 py-3.5 font-semibold text-principal hover:bg-slate-50"
                >
                  <Plus className="h-5 w-5" />
                  Duplicar cotización
                </Link>
                <button
                  type="button"
                  onClick={descargarPdf}
                  disabled={
                    cargandoDetalles ||
                    procesandoPdf ||
                    detalles.length === 0
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-accion px-5 py-3.5 font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
                >
                  <Download className="h-5 w-5" />
                  Descargar PDF
                </button>
                <button
                  type="button"
                  onClick={compartirPdf}
                  disabled={
                    cargandoDetalles ||
                    procesandoPdf ||
                    detalles.length === 0
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-principal px-5 py-3.5 font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {procesandoPdf ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Share2 className="h-5 w-5" />
                  )}
                  Compartir PDF
                </button>
                <button
                  type="button"
                  onClick={abrirWhatsApp}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3.5 font-semibold text-white hover:bg-green-700"
                >
                  <MessageCircle className="h-5 w-5" />
                  Enviar mensaje por WhatsApp
                </button>
                {!confirmarEliminacion ? (
                  <button
                    type="button"
                    onClick={() => { setErrorEliminacion(""); setConfirmarEliminacion(true); }}
                    disabled={procesandoPdf || guardandoEstado || cargandoDetalles || eliminando}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-300 px-5 py-3 font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                  >
                    <Trash2 className="h-5 w-5" />
                    Eliminar cotización
                  </button>
                ) : (
                  <div className="rounded-xl border-2 border-red-300 bg-red-50 p-4">
                    <p className="font-bold text-red-800">¿Eliminar definitivamente {cotizacionSeleccionada.numero}?</p>
                    <p className="mt-2 text-sm text-red-700">
                      Esta acción no se puede deshacer. La cotización y sus conceptos se eliminarán si la base de datos permite el borrado en cascada.
                    </p>
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => { setConfirmarEliminacion(false); setErrorEliminacion(""); }}
                        disabled={eliminando}
                        className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-principal disabled:opacity-50"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={eliminarCotizacion}
                        disabled={eliminando || procesandoPdf || guardandoEstado || cargandoDetalles}
                        className="flex items-center justify-center gap-2 rounded-xl bg-red-700 px-4 py-3 font-semibold text-white hover:bg-red-800 disabled:opacity-50"
                      >
                        {eliminando ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
                        {eliminando ? "Eliminando..." : "Sí, eliminar definitivamente"}
                      </button>
                    </div>
                  </div>
                )}
                {errorEliminacion && (
                  <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{errorEliminacion}</p>
                )}
                <button
                  type="button"
                  onClick={cerrarDetalle}
                  className="w-full rounded-xl border border-slate-300 px-5 py-3 font-semibold text-principal hover:bg-slate-50"
                >
                  Cerrar detalle
                </button>
              </div>
            </section>
          </div>
        )}
        <p className="mt-8 text-center text-xs text-slate-400">
          Cotizafácil · Todas tus cotizaciones organizadas.
        </p>
      </div>
    </main>
  );
}
export default HistorialCotizaciones;
