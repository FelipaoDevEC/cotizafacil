
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  Plus,
  Search,
  Pencil,
  Save,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Wrench,
  Hammer,
  Power,
  PowerOff,
} from "lucide-react";

import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

const formularioInicial = {
  nombre: "",
  descripcion: "",
  tipo: "material",
  unidad: "unidad",
  precio_unitario: "",
};

const estiloInput =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-texto outline-none focus:border-accion focus:ring-2 focus:ring-orange-100";

function CatalogoPrecios() {
  const { usuario } = useAuth();

  const [negocio, setNegocio] = useState(null);
  const [items, setItems] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("activos");

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [procesandoId, setProcesandoId] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [itemEditando, setItemEditando] = useState(null);

  const [formulario, setFormulario] = useState(formularioInicial);
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
          .select("id, moneda")
          .eq("usuario_id", usuario.id)
          .maybeSingle();

      if (!activo) return;

      if (errorNegocio) {
        setError(errorNegocio.message);
        setCargando(false);
        return;
      }

      if (!datosNegocio) {
        setError(
          "Primero debes configurar tu negocio para registrar precios."
        );
        setCargando(false);
        return;
      }

      setNegocio(datosNegocio);

      const { data, error: errorItems } = await supabase
        .from("items_frecuentes")
        .select(
          "id, nombre, descripcion, tipo, unidad, precio_unitario, activo"
        )
        .eq("negocio_id", datosNegocio.id)
        .order("nombre", { ascending: true });

      if (!activo) return;

      if (errorItems) {
        setError(errorItems.message);
      } else {
        setItems(data ?? []);
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

  function abrirNuevo() {
    setItemEditando(null);
    setFormulario({ ...formularioInicial });
    setMostrarFormulario(true);
    setError("");
    setMensaje("");
  }

  function abrirEdicion(item) {
    setItemEditando(item.id);

    setFormulario({
      nombre: item.nombre ?? "",
      descripcion: item.descripcion ?? "",
      tipo: item.tipo ?? "material",
      unidad: item.unidad ?? "unidad",
      precio_unitario: String(item.precio_unitario ?? ""),
    });

    setMostrarFormulario(true);
    setError("");
    setMensaje("");
  }

  function cerrarFormulario() {
    setMostrarFormulario(false);
    setItemEditando(null);
    setFormulario({ ...formularioInicial });
    setError("");
  }

  function ordenarItems(lista) {
    return [...lista].sort((a, b) =>
      a.nombre.localeCompare(b.nombre, "es")
    );
  }

  function formatearPrecio(valor) {
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

  async function guardarItem(evento) {
    evento.preventDefault();
    setError("");
    setMensaje("");

    if (!negocio?.id || !usuario?.id) {
      setError("Primero configura tu negocio.");
      return;
    }

    const nombre = formulario.nombre.trim();
    const unidad = formulario.unidad.trim();
    const textoPrecio = formulario.precio_unitario.trim();
    const precio = Number(textoPrecio);

    if (!nombre) {
      setError("El nombre del artículo es obligatorio.");
      return;
    }

    if (!unidad) {
      setError("Debes indicar la unidad de medida.");
      return;
    }

    if (
      textoPrecio === "" ||
      !Number.isFinite(precio) ||
      precio < 0 ||
      !/^\d+(\.\d{1,2})?$/.test(textoPrecio)
    ) {
      setError(
        "Ingresa un precio válido, con máximo 2 decimales."
      );
      return;
    }

    setGuardando(true);

    try {
      const datos = {
        negocio_id: negocio.id,
        usuario_id: usuario.id,
        nombre,
        descripcion: formulario.descripcion.trim() || null,
        tipo: formulario.tipo,
        unidad,
        precio_unitario: precio,
      };

      let resultado;

      if (itemEditando) {
        resultado = await supabase
          .from("items_frecuentes")
          .update(datos)
          .eq("id", itemEditando)
          .eq("negocio_id", negocio.id)
          .select(
            "id, nombre, descripcion, tipo, unidad, precio_unitario, activo"
          )
          .single();
      } else {
        resultado = await supabase
          .from("items_frecuentes")
          .insert({ ...datos, activo: true })
          .select(
            "id, nombre, descripcion, tipo, unidad, precio_unitario, activo"
          )
          .single();
      }

      if (resultado.error) {
        throw resultado.error;
      }

      const itemGuardado = resultado.data;

      setItems((anteriores) => {
        const actualizados = itemEditando
          ? anteriores.map((item) =>
              item.id === itemEditando ? itemGuardado : item
            )
          : [...anteriores, itemGuardado];

        return ordenarItems(actualizados);
      });

      setMostrarFormulario(false);
      setItemEditando(null);
      setFormulario({ ...formularioInicial });

      setMensaje(
        itemEditando
          ? "Precio actualizado correctamente."
          : "Artículo agregado al catálogo."
      );
    } catch (errorGuardado) {
      setError(
        errorGuardado.message ||
          "No fue posible guardar el artículo."
      );
    } finally {
      setGuardando(false);
    }
  }

  async function cambiarEstado(item) {
    if (!negocio?.id) return;

    setError("");
    setMensaje("");
    setProcesandoId(item.id);

    try {
      const { data, error: errorActualizacion } =
        await supabase
          .from("items_frecuentes")
          .update({ activo: !item.activo })
          .eq("id", item.id)
          .eq("negocio_id", negocio.id)
          .select(
            "id, nombre, descripcion, tipo, unidad, precio_unitario, activo"
          )
          .single();

      if (errorActualizacion) {
        throw errorActualizacion;
      }

      setItems((anteriores) =>
        anteriores.map((actual) =>
          actual.id === item.id ? data : actual
        )
      );

      setMensaje(
        data.activo
          ? "Artículo activado correctamente."
          : "Artículo desactivado correctamente."
      );
    } catch (errorEstado) {
      setError(
        errorEstado.message ||
          "No fue posible cambiar el estado."
      );
    } finally {
      setProcesandoId(null);
    }
  }

  const itemsFiltrados = items.filter((item) => {
    if (filtro === "activos" && !item.activo) return false;
    if (filtro === "inactivos" && item.activo) return false;

    const texto = [
      item.nombre,
      item.descripcion,
      item.tipo,
      item.unidad,
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
            Cargando catálogo...
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
              <Package className="h-7 w-7 text-accion" />

              <h1 className="text-2xl font-bold text-principal">
                Catálogo de precios
              </h1>
            </div>

            <p className="text-sm text-slate-500">
              Materiales y mano de obra para tus cotizaciones.
            </p>
          </div>

          {negocio && (
            <button
              type="button"
              onClick={abrirNuevo}
              className="flex items-center gap-2 rounded-xl bg-accion px-4 py-3 font-semibold text-white hover:bg-orange-600"
            >
              <Plus className="h-5 w-5" />
              Nuevo artículo
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

        {mostrarFormulario && (
          <form
            onSubmit={guardarItem}
            className="mb-6 rounded-2xl border border-orange-200 bg-white p-5 shadow-sm sm:p-6"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-principal">
                {itemEditando
                  ? "Editar artículo"
                  : "Nuevo artículo"}
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
                  Nombre del artículo *
                </label>

                <input
                  name="nombre"
                  type="text"
                  required
                  maxLength={150}
                  value={formulario.nombre}
                  onChange={cambiarCampo}
                  placeholder="Ej. Instalación de tomacorriente"
                  className={estiloInput}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-texto">
                  Tipo *
                </label>

                <select
                  name="tipo"
                  value={formulario.tipo}
                  onChange={cambiarCampo}
                  className={estiloInput}
                >
                  <option value="material">Material</option>
                  <option value="mano_obra">Mano de obra</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-texto">
                  Unidad *
                </label>

                <select
                  name="unidad"
                  value={formulario.unidad}
                  onChange={cambiarCampo}
                  className={estiloInput}
                >
                  <option value="unidad">Unidad</option>
                  <option value="hora">Hora</option>
                  <option value="dia">Día</option>
                  <option value="metro">Metro</option>
                  <option value="m2">Metro cuadrado (m²)</option>
                  <option value="kg">Kilogramo</option>
                  <option value="servicio">Servicio</option>
                  <option value="jornada">Jornada</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-texto">
                  Precio unitario *
                </label>

                <input
                  name="precio_unitario"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={formulario.precio_unitario}
                  onChange={cambiarCampo}
                  placeholder="Ej. 25.00"
                  className={estiloInput}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-texto">
                  Descripción
                </label>

                <input
                  name="descripcion"
                  type="text"
                  maxLength={500}
                  value={formulario.descripcion}
                  onChange={cambiarCampo}
                  placeholder="Detalle opcional"
                  className={estiloInput}
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
                  : "Guardar artículo"}
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

        {negocio && (
          <>
            <div className="relative mb-4">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />

              <input
                type="search"
                value={busqueda}
                onChange={(evento) =>
                  setBusqueda(evento.target.value)
                }
                placeholder="Buscar materiales o servicios..."
                className={`${estiloInput} pl-12`}
              />
            </div>

            <div className="mb-5 flex flex-wrap gap-2">
              {[
                ["activos", "Activos"],
                ["todos", "Todos"],
                ["inactivos", "Inactivos"],
              ].map(([valor, etiqueta]) => (
                <button
                  key={valor}
                  type="button"
                  onClick={() => setFiltro(valor)}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                    filtro === valor
                      ? "bg-principal text-white"
                      : "border border-slate-200 bg-white text-slate-600"
                  }`}
                >
                  {etiqueta}
                </button>
              ))}
            </div>

            <p className="mb-4 text-sm text-slate-500">
              {itemsFiltrados.length} artículo(s)
            </p>

            {itemsFiltrados.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center">
                <Package className="mx-auto mb-4 h-12 w-12 text-slate-300" />

                <h2 className="text-lg font-bold text-principal">
                  {items.length === 0
                    ? "Tu catálogo está vacío"
                    : "No encontramos resultados"}
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  {items.length === 0
                    ? "Agrega tu primer material o servicio."
                    : "Prueba otro término o filtro."}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {itemsFiltrados.map((item) => {
                  const Icono =
                    item.tipo === "mano_obra" ? Hammer : Wrench;

                  return (
                    <article
                      key={item.id}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="rounded-xl bg-orange-50 p-3">
                            <Icono className="h-5 w-5 text-accion" />
                          </div>

                          <div>
                            <h2 className="break-words font-bold text-principal">
                              {item.nombre}
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                              {item.tipo === "mano_obra"
                                ? "Mano de obra"
                                : "Material"}{" "}
                              · {item.unidad}
                            </p>

                            {item.descripcion && (
                              <p className="mt-2 text-sm text-slate-600">
                                {item.descripcion}
                              </p>
                            )}
                          </div>
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            item.activo
                              ? "bg-green-50 text-green-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {item.activo ? "Activo" : "Inactivo"}
                        </span>
                      </div>

                      <p className="mt-4 text-xl font-bold text-principal">
                        {formatearPrecio(item.precio_unitario)}
                        <span className="ml-1 text-xs font-normal text-slate-500">
                          / {item.unidad}
                        </span>
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                        <button
                          type="button"
                          onClick={() => abrirEdicion(item)}
                          className="flex items-center gap-2 rounded-lg bg-orange-50 px-4 py-2 text-sm font-semibold text-accion hover:bg-orange-100"
                        >
                          <Pencil className="h-4 w-4" />
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() => cambiarEstado(item)}
                          disabled={procesandoId === item.id}
                          className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                        >
                          {procesandoId === item.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : item.activo ? (
                            <PowerOff className="h-4 w-4" />
                          ) : (
                            <Power className="h-4 w-4" />
                          )}

                          {item.activo ? "Desactivar" : "Activar"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}

        <p className="mt-8 text-center text-xs text-slate-400">
          Cotizafácil · Precios organizados para cotizar más rápido.
        </p>
      </div>
    </main>
  );
}

export default CatalogoPrecios;
