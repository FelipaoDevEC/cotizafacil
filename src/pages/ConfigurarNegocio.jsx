
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Store,
  Phone,
  Mail,
  MapPin,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Coins,
  Percent,
  CalendarDays,
  FileText,
  ImagePlus,
  Palette,
  Upload,
  Trash2,
} from "lucide-react";

import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

const BUCKET_LOGOS = "logos-negocios";
const TAMANO_MAXIMO_LOGO = 2 * 1024 * 1024;

const TIPOS_PERMITIDOS = [
  "image/png",
  "image/jpeg",
  "image/webp",
];

const FORMULARIO_INICIAL = {
  nombre: "",
  telefono: "",
  email: "",
  direccion: "",
  moneda: "USD",
  aplicar_iva: true,
  iva_porcentaje: "15",
  vigencia_dias: "15",
  terminos: "",
  color_pdf: "#17324D",
};

const COLORES_SUGERIDOS = [
  "#17324D",
  "#F97316",
  "#2563EB",
  "#16A34A",
  "#7C3AED",
  "#DC2626",
];

const claseInput =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-texto outline-none transition focus:border-accion focus:ring-2 focus:ring-orange-100";

function Campo({ etiqueta, icono: Icono, children }) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-texto">
        <Icono className="h-4 w-4 text-accion" />
        {etiqueta}
      </label>
      {children}
    </div>
  );
}

function ConfigurarNegocio() {
  const { usuario } = useAuth();

  const [formulario, setFormulario] = useState(
    FORMULARIO_INICIAL
  );

  const [negocioId, setNegocioId] = useState(null);

  const [logoUrl, setLogoUrl] = useState(null);
  const [archivoLogo, setArchivoLogo] = useState(null);
  const [vistaPreviaLogo, setVistaPreviaLogo] = useState(null);
  const [eliminarLogo, setEliminarLogo] = useState(false);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const inputLogoRef = useRef(null);

  useEffect(() => {
    if (!usuario?.id) return;

    let activo = true;

    async function cargarNegocio() {
      setCargando(true);
      setError("");

      const { data, error: errorConsulta } = await supabase
        .from("negocios")
        .select(
          "id, nombre, telefono, email, direccion, moneda, aplicar_iva, iva_porcentaje, vigencia_dias, terminos, logo_url, color_pdf"
        )
        .eq("usuario_id", usuario.id)
        .maybeSingle();

      if (!activo) return;

      if (errorConsulta) {
        setError(errorConsulta.message);
      } else if (data) {
        setNegocioId(data.id);

        setFormulario({
          nombre: data.nombre ?? "",
          telefono: data.telefono ?? "",
          email: data.email ?? "",
          direccion: data.direccion ?? "",
          moneda: data.moneda ?? "USD",
          aplicar_iva: data.aplicar_iva ?? true,
          iva_porcentaje: String(
            data.iva_porcentaje ?? 15
          ),
          vigencia_dias: String(
            data.vigencia_dias ?? 15
          ),
          terminos: data.terminos ?? "",
          color_pdf: data.color_pdf ?? "#17324D",
        });

        setLogoUrl(data.logo_url ?? null);
      }

      setCargando(false);
    }

    cargarNegocio();

    return () => {
      activo = false;
    };
  }, [usuario?.id]);

  useEffect(() => {
    if (!archivoLogo) {
      setVistaPreviaLogo(null);
      return;
    }

    const urlTemporal = URL.createObjectURL(archivoLogo);
    setVistaPreviaLogo(urlTemporal);

    return () => {
      URL.revokeObjectURL(urlTemporal);
    };
  }, [archivoLogo]);

  function cambiarCampo(evento) {
    const { name, value, type, checked } = evento.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: type === "checkbox" ? checked : value,
    }));

    setMensaje("");
    setError("");
  }

  function seleccionarLogo(evento) {
    const archivo = evento.target.files?.[0];

    if (!archivo) return;

    setMensaje("");
    setError("");

    if (!TIPOS_PERMITIDOS.includes(archivo.type)) {
      setError(
        "El logotipo debe ser una imagen PNG, JPG o WEBP."
      );
      evento.target.value = "";
      return;
    }

    if (archivo.size > TAMANO_MAXIMO_LOGO) {
      setError(
        "El logotipo no puede superar los 2 MB."
      );
      evento.target.value = "";
      return;
    }

    setArchivoLogo(archivo);
    setEliminarLogo(false);
  }

  function quitarLogo() {
    setArchivoLogo(null);
    setEliminarLogo(true);
    setMensaje("");
    setError("");

    if (inputLogoRef.current) {
      inputLogoRef.current.value = "";
    }
  }

  function obtenerExtension(archivo) {
    if (archivo.type === "image/png") return "png";
    if (archivo.type === "image/jpeg") return "jpg";
    if (archivo.type === "image/webp") return "webp";

    throw new Error("Formato de imagen no permitido.");
  }

  function obtenerRutaLogoAnterior(url) {
    if (!url || !usuario?.id) return null;

    try {
      const urlCompleta = new URL(url);
      const indicador =
        `/storage/v1/object/public/${BUCKET_LOGOS}/`;

      const posicion = urlCompleta.pathname.indexOf(
        indicador
      );

      if (posicion === -1) return null;

      const ruta = decodeURIComponent(
        urlCompleta.pathname.slice(
          posicion + indicador.length
        )
      );

      if (!ruta.startsWith(`${usuario.id}/`)) {
        return null;
      }

      return ruta;
    } catch {
      return null;
    }
  }

  async function guardarNegocio(evento) {
    evento.preventDefault();

    setMensaje("");
    setError("");

    if (!usuario?.id) {
      setError("No se encontró una sesión activa.");
      return;
    }

    const nombre = formulario.nombre.trim();
    const iva = Number(formulario.iva_porcentaje);
    const vigencia = Number(formulario.vigencia_dias);

    if (!nombre) {
      setError("Ingresa el nombre de tu negocio.");
      return;
    }

    if (
      formulario.iva_porcentaje.trim() === "" ||
      !Number.isFinite(iva) ||
      iva < 0 ||
      iva > 100
    ) {
      setError("El IVA debe estar entre 0 y 100 %.");
      return;
    }

    if (
      formulario.vigencia_dias.trim() === "" ||
      !Number.isInteger(vigencia) ||
      vigencia < 1 ||
      vigencia > 365
    ) {
      setError(
        "La vigencia debe estar entre 1 y 365 días."
      );
      return;
    }

    if (
      !/^#[0-9A-Fa-f]{6}$/.test(
        formulario.color_pdf
      )
    ) {
      setError(
        "Selecciona un color corporativo válido."
      );
      return;
    }

    setGuardando(true);

    let nuevaRutaSubida = null;

    try {
      let nuevaUrlLogo = eliminarLogo
        ? null
        : logoUrl;

      const rutaLogoAnterior =
        obtenerRutaLogoAnterior(logoUrl);

      if (archivoLogo) {
        const extension = obtenerExtension(
          archivoLogo
        );

        const nombreArchivo =
          `${crypto.randomUUID()}.${extension}`;

        nuevaRutaSubida =
          `${usuario.id}/${nombreArchivo}`;

        const { error: errorSubida } =
          await supabase.storage
            .from(BUCKET_LOGOS)
            .upload(
              nuevaRutaSubida,
              archivoLogo,
              {
                cacheControl: "3600",
                upsert: false,
                contentType: archivoLogo.type,
              }
            );

        if (errorSubida) {
          throw new Error(
            `No se pudo subir el logotipo: ${errorSubida.message}`
          );
        }

        const { data: datosUrl } =
          supabase.storage
            .from(BUCKET_LOGOS)
            .getPublicUrl(nuevaRutaSubida);

        nuevaUrlLogo = datosUrl.publicUrl;
      }

      const datos = {
        usuario_id: usuario.id,
        nombre,
        telefono:
          formulario.telefono.trim() || null,
        email:
          formulario.email.trim() || null,
        direccion:
          formulario.direccion.trim() || null,
        moneda: formulario.moneda,
        aplicar_iva: formulario.aplicar_iva,
        iva_porcentaje: iva,
        vigencia_dias: vigencia,
        terminos:
          formulario.terminos.trim() || null,
        color_pdf: formulario.color_pdf,
        logo_url: nuevaUrlLogo,
      };

      let resultado;

      if (negocioId) {
        resultado = await supabase
          .from("negocios")
          .update(datos)
          .eq("id", negocioId)
          .eq("usuario_id", usuario.id)
          .select("id")
          .single();
      } else {
        resultado = await supabase
          .from("negocios")
          .insert(datos)
          .select("id")
          .single();
      }

      if (resultado.error) {
        throw resultado.error;
      }

      setNegocioId(resultado.data.id);
      setLogoUrl(nuevaUrlLogo);
      setArchivoLogo(null);
      setEliminarLogo(false);

      if (inputLogoRef.current) {
        inputLogoRef.current.value = "";
      }

      setMensaje(
        "¡Configuración y personalización guardadas correctamente!"
      );

      // Limpiamos el archivo anterior solo después
      // de guardar la nueva URL en el negocio.
      if (
        rutaLogoAnterior &&
        rutaLogoAnterior !== nuevaRutaSubida &&
        (archivoLogo || eliminarLogo)
      ) {
        const { error: errorEliminacion } =
          await supabase.storage
            .from(BUCKET_LOGOS)
            .remove([rutaLogoAnterior]);

        if (errorEliminacion) {
          console.warn(
            "No se pudo eliminar el logo anterior:",
            errorEliminacion
          );
        }
      }
    } catch (errorGuardado) {
      // Si la actualización del negocio falla,
      // intentamos limpiar la nueva subida.
      if (nuevaRutaSubida) {
        await supabase.storage
          .from(BUCKET_LOGOS)
          .remove([nuevaRutaSubida]);
      }

      setError(
        errorGuardado.message ||
          "No fue posible guardar la configuración."
      );
    } finally {
      setGuardando(false);
    }
  }

  const logoVisible = eliminarLogo
    ? null
    : vistaPreviaLogo || logoUrl;

  if (cargando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-fondo">
        <div className="text-center">
          <Loader2 className="mx-auto mb-3 h-9 w-9 animate-spin text-accion" />
          <p className="text-principal">
            Cargando tu negocio...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-fondo px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <Link
          to="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-principal hover:text-accion"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>

        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-principal">
            <Store className="h-8 w-8 text-white" />
          </div>

          <h1 className="text-2xl font-bold text-principal">
            Configura tu negocio
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Personaliza los datos de tus cotizaciones.
          </p>
        </div>

        <form
          onSubmit={guardarNegocio}
          className="space-y-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
        >
          <section className="space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-principal">
                1. Datos del negocio
              </h2>
              <p className="text-sm text-slate-500">
                Información que identifica tu negocio.
              </p>
            </div>

            <Campo
              etiqueta="Nombre del negocio *"
              icono={Store}
            >
              <input
                name="nombre"
                type="text"
                required
                maxLength={120}
                value={formulario.nombre}
                onChange={cambiarCampo}
                placeholder="Ej. Servicios Eléctricos López"
                className={claseInput}
              />
            </Campo>

            <Campo etiqueta="Teléfono" icono={Phone}>
              <input
                name="telefono"
                type="tel"
                maxLength={30}
                value={formulario.telefono}
                onChange={cambiarCampo}
                placeholder="Ej. 0991234567"
                className={claseInput}
              />
            </Campo>

            <Campo
              etiqueta="Correo electrónico"
              icono={Mail}
            >
              <input
                name="email"
                type="email"
                maxLength={254}
                value={formulario.email}
                onChange={cambiarCampo}
                placeholder="negocio@ejemplo.com"
                className={claseInput}
              />
            </Campo>

            <Campo etiqueta="Dirección" icono={MapPin}>
              <textarea
                name="direccion"
                rows={2}
                maxLength={500}
                value={formulario.direccion}
                onChange={cambiarCampo}
                placeholder="Ej. Guayaquil, Ecuador"
                className={`${claseInput} resize-none`}
              />
            </Campo>
          </section>

          <section className="space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-principal">
                2. Identidad visual
              </h2>
              <p className="text-sm text-slate-500">
                Configura el logotipo y color de tus PDF.
              </p>
            </div>

            <Campo
              etiqueta="Logotipo del negocio"
              icono={ImagePlus}
            >
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
                {logoVisible ? (
                  <div className="mb-4 flex justify-center">
                    <div className="flex h-36 w-48 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-3">
                      <img
                        src={logoVisible}
                        alt="Logotipo del negocio"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 flex flex-col items-center justify-center py-4 text-slate-400">
                    <ImagePlus className="h-12 w-12" />
                    <p className="mt-2 text-sm">
                      Todavía no tienes logotipo
                    </p>
                  </div>
                )}

                <input
                  ref={inputLogoRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={seleccionarLogo}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() =>
                    inputLogoRef.current?.click()
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-principal px-4 py-3 font-semibold text-white hover:bg-slate-800"
                >
                  <Upload className="h-5 w-5" />
                  {logoVisible
                    ? "Cambiar logotipo"
                    : "Seleccionar logotipo"}
                </button>

                {logoVisible && (
                  <button
                    type="button"
                    onClick={quitarLogo}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 font-semibold text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-5 w-5" />
                    Quitar logotipo
                  </button>
                )}

                <p className="mt-3 text-center text-xs text-slate-500">
                  PNG, JPG o WEBP. Máximo 2 MB.
                </p>
              </div>
            </Campo>

            <Campo
              etiqueta="Color corporativo del PDF"
              icono={Palette}
            >
              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="mb-4 flex items-center gap-4">
                  <input
                    type="color"
                    name="color_pdf"
                    value={formulario.color_pdf}
                    onChange={cambiarCampo}
                    aria-label="Seleccionar color corporativo"
                    className="h-14 w-16 cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
                  />

                  <div>
                    <p className="font-semibold text-principal">
                      {formulario.color_pdf.toUpperCase()}
                    </p>
                    <p className="text-xs text-slate-500">
                      Color principal de tus cotizaciones.
                    </p>
                  </div>
                </div>

                <p className="mb-3 text-xs font-semibold text-slate-600">
                  Colores sugeridos
                </p>

                <div className="flex flex-wrap gap-3">
                  {COLORES_SUGERIDOS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => {
                        setFormulario((anterior) => ({
                          ...anterior,
                          color_pdf: color,
                        }));

                        setMensaje("");
                        setError("");
                      }}
                      aria-label={`Seleccionar color ${color}`}
                      aria-pressed={
                        formulario.color_pdf.toLowerCase() ===
                        color.toLowerCase()
                      }
                      className={`h-10 w-10 rounded-full border-4 transition ${
                        formulario.color_pdf.toLowerCase() ===
                        color.toLowerCase()
                          ? "border-slate-800"
                          : "border-white ring-1 ring-slate-200"
                      }`}
                      style={{
                        backgroundColor: color,
                      }}
                    />
                  ))}
                </div>

                <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
                  <div
                    className="px-4 py-3 text-sm font-bold text-white"
                    style={{
                      backgroundColor:
                        formulario.color_pdf,
                    }}
                  >
                    Vista previa de encabezado
                  </div>

                  <div className="bg-white p-4">
                    <p className="font-semibold text-principal">
                      {formulario.nombre ||
                        "Nombre de tu negocio"}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Cotización profesional
                    </p>
                  </div>
                </div>
              </div>
            </Campo>
          </section>

          <section className="space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-principal">
                3. Preferencias de cotización
              </h2>

              <p className="text-sm text-slate-500">
                Define cómo calcularás tus cotizaciones.
              </p>
            </div>

            <Campo etiqueta="Moneda" icono={Coins}>
              <select
                name="moneda"
                value={formulario.moneda}
                onChange={cambiarCampo}
                className={claseInput}
              >
                <option value="USD">
                  USD - Dólar estadounidense
                </option>
                <option value="EUR">
                  EUR - Euro
                </option>
                <option value="COP">
                  COP - Peso colombiano
                </option>
                <option value="MXN">
                  MXN - Peso mexicano
                </option>
                <option value="PEN">
                  PEN - Sol peruano
                </option>
              </select>
            </Campo>

            <div className="rounded-xl border border-slate-200 p-4">
              <label className="flex cursor-pointer items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Percent className="h-5 w-5 text-accion" />

                  <div>
                    <p className="font-semibold text-texto">
                      Aplicar IVA
                    </p>

                    <p className="text-xs text-slate-500">
                      Incluir impuestos en las cotizaciones.
                    </p>
                  </div>
                </div>

                <input
                  name="aplicar_iva"
                  type="checkbox"
                  checked={formulario.aplicar_iva}
                  onChange={cambiarCampo}
                  className="h-5 w-5 accent-orange-500"
                />
              </label>

              {formulario.aplicar_iva && (
                <div className="mt-4">
                  <label className="mb-2 block text-sm font-semibold text-texto">
                    Porcentaje de IVA (%)
                  </label>

                  <input
                    name="iva_porcentaje"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    required
                    value={formulario.iva_porcentaje}
                    onChange={cambiarCampo}
                    className={claseInput}
                  />
                </div>
              )}
            </div>

            <Campo
              etiqueta="Vigencia de la cotización (días)"
              icono={CalendarDays}
            >
              <input
                name="vigencia_dias"
                type="number"
                min="1"
                max="365"
                step="1"
                required
                value={formulario.vigencia_dias}
                onChange={cambiarCampo}
                className={claseInput}
              />

              <p className="mt-2 text-xs text-slate-500">
                Ejemplo: 15 días significa que la
                cotización tendrá una validez de 15 días.
              </p>
            </Campo>

            <Campo
              etiqueta="Términos y condiciones"
              icono={FileText}
            >
              <textarea
                name="terminos"
                rows={4}
                maxLength={2000}
                value={formulario.terminos}
                onChange={cambiarCampo}
                placeholder="Ej. Se requiere un anticipo del 50 %. Los precios pueden variar después del vencimiento."
                className={`${claseInput} resize-y`}
              />

              <p className="mt-2 text-xs text-slate-500">
                Estos términos se utilizarán como referencia
                al crear nuevas cotizaciones.
              </p>
            </Campo>
          </section>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700"
            >
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {mensaje && (
            <div
              role="status"
              className="flex items-start gap-2 rounded-xl bg-green-50 p-3 text-sm text-green-700"
            >
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <span>{mensaje}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={guardando}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-accion px-5 py-3.5 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {guardando ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                Guardar configuración
              </>
            )}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-slate-400">
          Cotizafácil · Tu negocio, tus cotizaciones.
        </p>
      </div>
    </main>
  );
}

export default ConfigurarNegocio;
