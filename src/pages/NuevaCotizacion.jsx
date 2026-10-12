import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  FilePlus2,
  Plus,
  Trash2,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  CalendarDays,
  UserRound,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
const estiloInput =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-texto outline-none focus:border-accion focus:ring-2 focus:ring-orange-100";
const hoyLocal = () => {
  const fecha = new Date();
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
};
function sumarDias(fechaTexto, dias) {
  const [anio, mes, dia] = fechaTexto.split("-").map(Number);
  const fecha = new Date(anio, mes - 1, dia);
  fecha.setDate(fecha.getDate() + dias);
  const a = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, "0");
  const d = String(fecha.getDate()).padStart(2, "0");
  return `${a}-${m}-${d}`;
}
function nuevoConcepto() {
  return {
    clave: crypto.randomUUID(),
    item_frecuente_id: null,
    descripcion: "",
    tipo: "material",
    unidad: "unidad",
    cantidad: "1",
    precio_unitario: "0",
  };
}
function redondear(valor) {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}
function NuevaCotizacion() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const { id: cotizacionId } = useParams();
  const [parametros] = useSearchParams();
  const duplicarId = cotizacionId ? null : parametros.get("duplicar");
  const duplicando = Boolean(duplicarId);
  const editando = Boolean(cotizacionId);
  const [numeroExistente, setNumeroExistente] = useState("");
  const [estadoExistente, setEstadoExistente] = useState("borrador");
  const [ivaPorcentaje, setIvaPorcentaje] = useState(15);
  const [negocio, setNegocio] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [catalogo, setCatalogo] = useState([]);
  const [clienteId, setClienteId] = useState("");
  const [fechaEmision, setFechaEmision] = useState(hoyLocal());
  const [fechaVencimiento, setFechaVencimiento] = useState(hoyLocal());
  const [conceptos, setConceptos] = useState([nuevoConcepto()]);
  const [descuento, setDescuento] = useState("0");
  const [aplicarIva, setAplicarIva] = useState(true);
  const [notas, setNotas] = useState("");
  const [terminos, setTerminos] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  useEffect(() => {
    if (!usuario?.id) return;
    let activo = true;
    async function cargarDatos() {
      setCargando(true);
      setError("");
      const { data: datosNegocio, error: errorNegocio } =
        await supabase
          .from("negocios")
          .select(
            "id, nombre, moneda, aplicar_iva, iva_porcentaje, vigencia_dias, terminos"
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
      const [resultadoClientes, resultadoCatalogo] =
        await Promise.all([
          supabase
            .from("clientes")
            .select("id, nombre, identificacion")
            .eq("negocio_id", datosNegocio.id)
            .order("nombre"),
          supabase
            .from("items_frecuentes")
            .select(
              "id, nombre, descripcion, tipo, unidad, precio_unitario"
            )
            .eq("negocio_id", datosNegocio.id)
            .eq("activo", true)
            .order("nombre"),
        ]);
      if (!activo) return;
      if (resultadoClientes.error || resultadoCatalogo.error) {
        setError(
          resultadoClientes.error?.message ||
          resultadoCatalogo.error?.message
        );
        setCargando(false);
        return;
      }
      setNegocio(datosNegocio);
      setClientes(resultadoClientes.data ?? []);
      setCatalogo(resultadoCatalogo.data ?? []);
      setIvaPorcentaje(Number(datosNegocio.iva_porcentaje ?? 15));
      if (editando) {
        const { data: cotizacion, error: errorCotizacion } = await supabase
          .from("cotizaciones")
          .select("id, numero, cliente_id, fecha_emision, fecha_vencimiento, estado, descuento, aplicar_iva, iva_porcentaje, notas, terminos")
          .eq("id", cotizacionId)
          .eq("negocio_id", datosNegocio.id)
          .eq("usuario_id", usuario.id)
          .maybeSingle();
        if (!activo) return;
        if (errorCotizacion || !cotizacion) {
          setError(errorCotizacion?.message || "No se encontró la cotización.");
          setCargando(false);
          return;
        }
        const { data: items, error: errorItems } = await supabase
          .from("cotizacion_items")
          .select("id, item_frecuente_id, descripcion, tipo, unidad, cantidad, precio_unitario")
          .eq("cotizacion_id", cotizacionId)
          .eq("negocio_id", datosNegocio.id)
          .order("orden", { ascending: true });
        if (!activo) return;
        if (errorItems || !items?.length) {
          setError(errorItems?.message || "La cotización no tiene conceptos para editar.");
          setCargando(false);
          return;
        }
        setNumeroExistente(cotizacion.numero);
        setEstadoExistente(cotizacion.estado);
        setClienteId(cotizacion.cliente_id);
        setFechaEmision(cotizacion.fecha_emision);
        setFechaVencimiento(cotizacion.fecha_vencimiento);
        setDescuento(String(cotizacion.descuento ?? 0));
        setAplicarIva(Boolean(cotizacion.aplicar_iva));
        setIvaPorcentaje(Number(cotizacion.iva_porcentaje ?? 15));
        setNotas(cotizacion.notas ?? "");
        setTerminos(cotizacion.terminos ?? "");
        setConceptos(items.map((item) => ({
          clave: crypto.randomUUID(),
          id: item.id,
          item_frecuente_id: item.item_frecuente_id,
          descripcion: item.descripcion,
          tipo: item.tipo,
          unidad: item.unidad,
          cantidad: String(item.cantidad),
          precio_unitario: String(item.precio_unitario),
        })));
      } else if (duplicando) {
        const { data: original, error: errorOriginal } = await supabase
          .from("cotizaciones")
          .select("id, numero, cliente_id, descuento, aplicar_iva, iva_porcentaje, notas, terminos")
          .eq("id", duplicarId)
          .eq("negocio_id", datosNegocio.id)
          .eq("usuario_id", usuario.id)
          .maybeSingle();
        if (!activo) return;
        if (errorOriginal || !original) {
          setError(errorOriginal?.message || "No se encontró la cotización original.");
          setCargando(false);
          return;
        }
        const { data: items, error: errorItems } = await supabase
          .from("cotizacion_items")
          .select("item_frecuente_id, descripcion, tipo, unidad, cantidad, precio_unitario")
          .eq("cotizacion_id", duplicarId)
          .eq("negocio_id", datosNegocio.id)
          .eq("usuario_id", usuario.id)
          .order("orden", { ascending: true });
        if (!activo) return;
        if (errorItems || !items?.length) {
          setError(errorItems?.message || "La cotización original no tiene conceptos.");
          setCargando(false);
          return;
        }
        setNumeroExistente(original.numero);
        setClienteId(original.cliente_id);
        setDescuento(String(original.descuento ?? 0));
        setAplicarIva(Boolean(original.aplicar_iva));
        setIvaPorcentaje(Number(original.iva_porcentaje ?? 15));
        setNotas(original.notas ?? "");
        setTerminos(original.terminos ?? "");
        setConceptos(items.map((item) => ({
          clave: crypto.randomUUID(),
          item_frecuente_id: item.item_frecuente_id,
          descripcion: item.descripcion,
          tipo: item.tipo,
          unidad: item.unidad,
          cantidad: String(item.cantidad),
          precio_unitario: String(item.precio_unitario),
        })));
        const fecha = hoyLocal();
        setFechaEmision(fecha);
        setFechaVencimiento(sumarDias(fecha, datosNegocio.vigencia_dias ?? 15));
      } else {
        setAplicarIva(datosNegocio.aplicar_iva ?? true);
        setTerminos(datosNegocio.terminos ?? "");
        const fecha = hoyLocal();
        setFechaEmision(fecha);
        setFechaVencimiento(sumarDias(fecha, datosNegocio.vigencia_dias ?? 15));
      }
      setCargando(false);
    }
    cargarDatos();
    return () => {
      activo = false;
    };
  }, [usuario?.id, cotizacionId, editando, duplicarId, duplicando]);
  function cambiarConcepto(clave, campo, valor) {
    setConceptos((anteriores) =>
      anteriores.map((concepto) => {
        if (concepto.clave !== clave) return concepto;
        const actualizado = {
          ...concepto,
          [campo]: valor,
        };
        if (
          campo === "descripcion" ||
          campo === "tipo" ||
          campo === "unidad" ||
          campo === "precio_unitario"
        ) {
          actualizado.item_frecuente_id = null;
        }
        return actualizado;
      })
    );
    setError("");
  }
  function seleccionarCatalogo(clave, itemId) {
    const item = catalogo.find((actual) => actual.id === itemId);
    if (!item) return;
    setConceptos((anteriores) =>
      anteriores.map((concepto) =>
        concepto.clave === clave
          ? {
              ...concepto,
              item_frecuente_id: item.id,
              descripcion: item.nombre,
              tipo: item.tipo,
              unidad: item.unidad,
              cantidad: concepto.cantidad,
              precio_unitario: String(item.precio_unitario),
            }
          : concepto
      )
    );
  }
  function agregarConcepto() {
    setConceptos((anteriores) => [
      ...anteriores,
      nuevoConcepto(),
    ]);
  }
  function eliminarConcepto(clave) {
    setConceptos((anteriores) =>
      anteriores.length > 1
        ? anteriores.filter((concepto) => concepto.clave !== clave)
        : anteriores
    );
  }
  const calculos = useMemo(() => {
    const subtotal = redondear(
      conceptos.reduce((acumulado, concepto) => {
        const cantidad = Number(concepto.cantidad) || 0;
        const precio = Number(concepto.precio_unitario) || 0;
        return acumulado + redondear(cantidad * precio);
      }, 0)
    );
    const descuentoValor = Number(descuento) || 0;
    const base = Math.max(0, redondear(subtotal - descuentoValor));
    const porcentaje = ivaPorcentaje;
    const ivaValor = aplicarIva
      ? redondear(base * porcentaje / 100)
      : 0;
    const total = redondear(base + ivaValor);
    return {
      subtotal,
      descuento: descuentoValor,
      ivaValor,
      total,
    };
  }, [conceptos, descuento, aplicarIva, ivaPorcentaje]);
  function formatearMoneda(valor) {
    const moneda = negocio?.moneda ?? "USD";
    try {
      return new Intl.NumberFormat("es-EC", {
        style: "currency",
        currency: moneda,
      }).format(valor);
    } catch {
      return `${moneda} ${valor.toFixed(2)}`;
    }
  }
  async function guardarCotizacion(evento) {
    evento.preventDefault();
    setError("");
    setMensaje("");
    if (!negocio?.id || !usuario?.id) {
      setError("No se encontró tu negocio.");
      return;
    }
    if (!clienteId) {
      setError("Selecciona un cliente.");
      return;
    }
    if (!fechaEmision || !fechaVencimiento) {
      setError("Completa las fechas.");
      return;
    }
    if (fechaVencimiento < fechaEmision) {
      setError(
        "El vencimiento no puede ser anterior a la emisión."
      );
      return;
    }
    if (
      conceptos.some(
        (concepto) =>
          !concepto.descripcion.trim() ||
          concepto.cantidad.trim() === "" ||
          !Number.isFinite(Number(concepto.cantidad)) ||
          Number(concepto.cantidad) <= 0 ||
          concepto.precio_unitario.trim() === "" ||
          !Number.isFinite(Number(concepto.precio_unitario)) ||
          Number(concepto.precio_unitario) < 0 ||
          !/^\d+(\.\d{1,3})?$/.test(concepto.cantidad) ||
          !/^\d+(\.\d{1,2})?$/.test(concepto.precio_unitario)
      )
    ) {
      setError(
        "Revisa los conceptos: descripción, cantidad positiva y precio válido."
      );
      return;
    }
    if (
      descuento.trim() === "" ||
      !Number.isFinite(Number(descuento)) ||
      !/^\d+(\.\d{1,2})?$/.test(descuento) ||
      calculos.descuento < 0 ||
      calculos.descuento > calculos.subtotal
    ) {
      setError(
        "El descuento debe estar entre 0 y el subtotal."
      );
      return;
    }
    setGuardando(true);
    if (editando) {
      try {
        const { error: errorEdicion } = await supabase.rpc(
          "editar_cotizacion_segura",
          {
            p_cotizacion_id: cotizacionId,
            p_negocio_id: negocio.id,
            p_cliente_id: clienteId,
            p_fecha_emision: fechaEmision,
            p_fecha_vencimiento: fechaVencimiento,
            p_descuento: calculos.descuento,
            p_aplicar_iva: aplicarIva,
            p_iva_porcentaje: ivaPorcentaje,
            p_notas: notas.trim() || null,
            p_terminos: terminos.trim() || null,
            p_conceptos: conceptos.map((concepto) => ({
              item_frecuente_id: concepto.item_frecuente_id,
              descripcion: concepto.descripcion.trim(),
              tipo: concepto.tipo,
              unidad: concepto.unidad.trim(),
              cantidad: Number(concepto.cantidad),
              precio_unitario: Number(concepto.precio_unitario),
            })),
          }
        );
        if (errorEdicion) throw errorEdicion;
        setMensaje(`Cotización ${numeroExistente} actualizada correctamente.`);
        setTimeout(() => navigate("/cotizaciones"), 1200);
      } catch (errorEdicion) {
        setError(errorEdicion.message || "No fue posible actualizar la cotización.");
      } finally {
        setGuardando(false);
      }
      return;
    }
    try {
      const { data: numeroNuevo, error: errorCreacion } = await supabase.rpc(
        "crear_cotizacion_segura",
        {
          p_negocio_id: negocio.id,
          p_cliente_id: clienteId,
          p_fecha_emision: fechaEmision,
          p_fecha_vencimiento: fechaVencimiento,
          p_descuento: calculos.descuento,
          p_aplicar_iva: aplicarIva,
          p_iva_porcentaje: ivaPorcentaje,
          p_notas: notas.trim() || null,
          p_terminos: terminos.trim() || null,
          p_conceptos: conceptos.map((concepto) => ({
            item_frecuente_id: concepto.item_frecuente_id,
            descripcion: concepto.descripcion.trim(),
            tipo: concepto.tipo,
            unidad: concepto.unidad.trim(),
            cantidad: Number(concepto.cantidad),
            precio_unitario: Number(concepto.precio_unitario),
          })),
        }
      );
      if (errorCreacion) throw errorCreacion;
      setMensaje(`Cotización ${numeroNuevo} guardada correctamente.`);
      setTimeout(() => navigate("/dashboard"), 1400);
    } catch (errorGuardado) {
      setError(
        errorGuardado.message || "No fue posible guardar la cotización."
      );
    } finally {
      setGuardando(false);
    }
  }
  if (cargando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-fondo">
        <Loader2 className="h-9 w-9 animate-spin text-accion" />
        <p className="ml-3 text-principal">
          Preparando tu cotización...
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
        <header className="mb-6">
          <div className="flex items-center gap-3">
            <FilePlus2 className="h-8 w-8 text-accion" />
            <h1 className="text-2xl font-bold text-principal">
              {editando ? "Editar cotización" : duplicando ? "Duplicar cotización" : "Nueva cotización"}
            </h1>
          </div>
          {duplicando && negocio && (
            <p className="mt-2 rounded-xl bg-orange-50 p-3 text-sm text-orange-800">
              Copia de {numeroExistente}. Se creará una cotización nueva, con número
              diferente, fechas actualizadas y estado Borrador. La original no cambiará.
            </p>
          )}
          <p className="mt-2 text-sm text-slate-500">
            Selecciona un cliente y agrega los trabajos
            o materiales que vas a cotizar.
          </p>
        </header>
        {error && (
          <div
            role="alert"
            className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-700"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
            {!negocio && (
              <Link
                to="/configurar-negocio"
                className="mt-3 inline-block font-semibold underline"
              >
                Configurar negocio
              </Link>
            )}
          </div>
        )}
        {mensaje && (
          <div
            role="status"
            className="mb-5 flex items-center gap-2 rounded-xl bg-green-50 p-4 text-sm text-green-700"
          >
            <CheckCircle2 className="h-5 w-5" />
            {mensaje}
          </div>
        )}
        {negocio && (
          <form onSubmit={guardarCotizacion} className="space-y-5">
            <section className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="mb-4 font-bold text-principal">
                1. Cliente y fechas
              </h2>
              <label className="mb-2 block text-sm font-semibold">
                Cliente *
              </label>
              <select
                value={clienteId}
                onChange={(evento) =>
                  setClienteId(evento.target.value)
                }
                required
                className={estiloInput}
              >
                <option value="">Selecciona un cliente</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nombre}
                  </option>
                ))}
              </select>
              {clientes.length === 0 && (
                <Link
                  to="/clientes"
                  className="mt-3 inline-block text-sm font-semibold text-accion underline"
                >
                  Registrar mi primer cliente
                </Link>
              )}
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-semibold">
                    <CalendarDays className="h-4 w-4 text-accion" />
                    Fecha de emisión
                  </label>
                  <input
                    type="date"
                    value={fechaEmision}
                    onChange={(evento) => {
                      const fecha = evento.target.value;
                      setFechaEmision(fecha);
                      if (fecha) {
                        setFechaVencimiento(
                          sumarDias(
                            fecha,
                            negocio.vigencia_dias ?? 15
                          )
                        );
                      }
                    }}
                    required
                    className={estiloInput}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Fecha de vencimiento
                  </label>
                  <input
                    type="date"
                    value={fechaVencimiento}
                    min={fechaEmision}
                    onChange={(evento) =>
                      setFechaVencimiento(evento.target.value)
                    }
                    required
                    className={estiloInput}
                  />
                </div>
              </div>
            </section>
            <section className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="font-bold text-principal">
                  2. Materiales y mano de obra
                </h2>
                <button
                  type="button"
                  onClick={agregarConcepto}
                  className="flex items-center gap-1 rounded-lg bg-orange-50 px-3 py-2 text-sm font-semibold text-accion"
                >
                  <Plus className="h-4 w-4" />
                  Agregar
                </button>
              </div>
              <div className="space-y-4">
                {conceptos.map((concepto, indice) => (
                  <div
                    key={concepto.clave}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="font-semibold text-principal">
                        Concepto {indice + 1}
                      </h3>
                      <button
                        type="button"
                        onClick={() =>
                          eliminarConcepto(concepto.clave)
                        }
                        disabled={conceptos.length === 1}
                        className="text-red-500 disabled:opacity-30"
                        aria-label="Eliminar concepto"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                    <label className="mb-2 block text-sm font-semibold">
                      Usar artículo del catálogo
                    </label>
                    <select
                      value={concepto.item_frecuente_id ?? ""}
                      onChange={(evento) =>
                        seleccionarCatalogo(
                          concepto.clave,
                          evento.target.value
                        )
                      }
                      className={estiloInput}
                    >
                      <option value="">
                        Concepto personalizado
                      </option>
                      {catalogo.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.nombre}
                        </option>
                      ))}
                    </select>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label className="mb-1 block text-sm font-semibold">
                          Descripción *
                        </label>
                        <input
                          value={concepto.descripcion}
                          onChange={(evento) =>
                            cambiarConcepto(
                              concepto.clave,
                              "descripcion",
                              evento.target.value
                            )
                          }
                          required
                          maxLength={500}
                          placeholder="Ej. Instalación eléctrica"
                          className={estiloInput}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-semibold">
                          Tipo
                        </label>
                        <select
                          value={concepto.tipo}
                          onChange={(evento) =>
                            cambiarConcepto(
                              concepto.clave,
                              "tipo",
                              evento.target.value
                            )
                          }
                          className={estiloInput}
                        >
                          <option value="material">Material</option>
                          <option value="mano_obra">
                            Mano de obra
                          </option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-semibold">
                          Unidad
                        </label>
                        <input
                          value={concepto.unidad}
                          onChange={(evento) =>
                            cambiarConcepto(
                              concepto.clave,
                              "unidad",
                              evento.target.value
                            )
                          }
                          required
                          maxLength={50}
                          className={estiloInput}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-semibold">
                          Cantidad *
                        </label>
                        <input
                          type="number"
                          min="0.001"
                          step="0.001"
                          value={concepto.cantidad}
                          onChange={(evento) =>
                            cambiarConcepto(
                              concepto.clave,
                              "cantidad",
                              evento.target.value
                            )
                          }
                          required
                          className={estiloInput}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-semibold">
                          Precio unitario *
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={concepto.precio_unitario}
                          onChange={(evento) =>
                            cambiarConcepto(
                              concepto.clave,
                              "precio_unitario",
                              evento.target.value
                            )
                          }
                          required
                          className={estiloInput}
                        />
                      </div>
                    </div>
                    <p className="mt-3 text-right font-bold text-principal">
                      Subtotal:{" "}
                      {formatearMoneda(
                        redondear(
                          (Number(concepto.cantidad) || 0) *
                          (Number(concepto.precio_unitario) || 0)
                        )
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </section>
            <section className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="mb-4 font-bold text-principal">
                3. Totales y condiciones
              </h2>
              <label className="mb-2 block text-sm font-semibold">
                Descuento (valor fijo)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={descuento}
                onChange={(evento) =>
                  setDescuento(evento.target.value)
                }
                className={estiloInput}
              />
              <label className="mt-4 flex items-center gap-3 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={aplicarIva}
                  onChange={(evento) =>
                    setAplicarIva(evento.target.checked)
                  }
                  className="h-5 w-5 accent-orange-500"
                />
                Aplicar IVA ({ivaPorcentaje} %)
              </label>
              <div className="mt-5 space-y-3 rounded-xl bg-slate-50 p-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <strong>
                    {formatearMoneda(calculos.subtotal)}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Descuento</span>
                  <strong>
                    - {formatearMoneda(calculos.descuento)}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>IVA</span>
                  <strong>
                    {formatearMoneda(calculos.ivaValor)}
                  </strong>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-3 text-xl font-bold text-principal">
                  <span>Total</span>
                  <span>
                    {formatearMoneda(calculos.total)}
                  </span>
                </div>
              </div>
              <label className="mb-2 mt-5 block text-sm font-semibold">
                Notas adicionales
              </label>
              <textarea
                value={notas}
                onChange={(evento) => setNotas(evento.target.value)}
                rows={2}
                maxLength={2000}
                className={`${estiloInput} resize-y`}
              />
              <label className="mb-2 mt-4 block text-sm font-semibold">
                Términos y condiciones
              </label>
              <textarea
                value={terminos}
                onChange={(evento) =>
                  setTerminos(evento.target.value)
                }
                rows={3}
                maxLength={2000}
                className={`${estiloInput} resize-y`}
              />
            </section>
            <button
              type="submit"
              disabled={guardando || clientes.length === 0}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-accion px-5 py-4 font-bold text-white hover:bg-orange-600 disabled:opacity-60"
            >
              {guardando ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Save className="h-5 w-5" />
              )}
              {guardando
                ? "Guardando cotización..."
                : editando ? "Guardar cambios" : duplicando ? "Guardar como nueva cotización" : "Guardar cotización"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
export default NuevaCotizacion;
