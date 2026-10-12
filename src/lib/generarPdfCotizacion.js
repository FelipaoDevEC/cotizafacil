
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

function limpiarTexto(valor) {
  return String(valor ?? "").trim();
}

function textoPdf(valor) {
  return limpiarTexto(valor)
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2022/g, "-")
    .replace(/\u00A0/g, " ");
}

function fechaLegible(fecha) {
  if (!fecha) return "-";

  const partes = fecha.split("-");

  if (partes.length !== 3) return fecha;

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function colorRgb(hexadecimal) {
  const color = /^#[0-9a-fA-F]{6}$/.test(hexadecimal ?? "")
    ? hexadecimal
    : "#17324D";

  return [
    parseInt(color.slice(1, 3), 16),
    parseInt(color.slice(3, 5), 16),
    parseInt(color.slice(5, 7), 16),
  ];
}

function moneda(valor, codigo = "USD") {
  const numero = Number(valor) || 0;

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: codigo,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numero);
  } catch {
    return `${codigo} ${numero.toFixed(2)}`;
  }
}

function escribirBloque(documento, titulo, contenido, x, y, ancho) {
  if (!limpiarTexto(contenido)) return y;

  documento.setFont("helvetica", "bold");
  documento.setFontSize(9);
  documento.setTextColor(90, 100, 115);
  documento.text(textoPdf(titulo), x, y);

  documento.setFont("helvetica", "normal");
  documento.setFontSize(10);
  documento.setTextColor(35, 45, 60);

  const lineas = documento.splitTextToSize(
    textoPdf(contenido),
    ancho
  );

  documento.text(lineas, x, y + 6);

  return y + 6 + lineas.length * 5 + 5;
}

function cargarImagen(url) {
  return new Promise((resolve, reject) => {
    const imagen = new Image();
    imagen.crossOrigin = "anonymous";

    imagen.onload = () => resolve(imagen);

    imagen.onerror = () => {
      reject(
        new Error("No se pudo cargar el logotipo.")
      );
    };

    imagen.src = url;
  });
}

async function prepararLogotipo(url) {
  if (!url) return null;

  try {
    const imagen = await cargarImagen(url);

    const canvas = document.createElement("canvas");
    const contexto = canvas.getContext("2d");

    if (!contexto) {
      throw new Error("No se pudo procesar el logotipo.");
    }

    // Limitamos la resolución para mantener
    // un tamaño razonable del PDF.
    const maximo = 600;

    const escala = Math.min(
      maximo / imagen.naturalWidth,
      maximo / imagen.naturalHeight,
      1
    );

    canvas.width = Math.max(
      1,
      Math.round(imagen.naturalWidth * escala)
    );

    canvas.height = Math.max(
      1,
      Math.round(imagen.naturalHeight * escala)
    );

    contexto.drawImage(
      imagen,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return {
      datos: canvas.toDataURL("image/png"),
      ancho: canvas.width,
      alto: canvas.height,
    };
  } catch (error) {
    console.warn(
      "No se pudo incorporar el logotipo al PDF:",
      error
    );

    // Si el logotipo falla, el PDF
    // se genera normalmente sin él.
    return null;
  }
}

export async function construirPdfCotizacion({
  negocio,
  cliente,
  cotizacion,
  conceptos,
}) {
  if (!negocio || !cotizacion || !Array.isArray(conceptos)) {
    throw new Error("Faltan datos para generar el PDF.");
  }

  const documento = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const anchoPagina = documento.internal.pageSize.getWidth();
  const altoPagina = documento.internal.pageSize.getHeight();

  const margen = 16;
  const anchoContenido = anchoPagina - margen * 2;

  const principal = colorRgb(negocio.color_pdf);
  const oscuro = [30, 41, 59];
  const gris = [100, 116, 139];

  const codigoMoneda = negocio.moneda || "USD";

  const logotipo = await prepararLogotipo(
    negocio.logo_url
  );

  // Encabezado corporativo
  documento.setFillColor(...principal);
  documento.rect(0, 0, anchoPagina, 43, "F");

  let xNombre = margen;
  let anchoNombre = anchoContenido;

  if (logotipo) {
    // Caja blanca para que el logotipo
    // destaque sobre cualquier color.
    const cajaX = margen;
    const cajaY = 7;
    const cajaAncho = 34;
    const cajaAlto = 29;

    documento.setFillColor(255, 255, 255);

    documento.roundedRect(
      cajaX,
      cajaY,
      cajaAncho,
      cajaAlto,
      2,
      2,
      "F"
    );

    const espacio = 3;

    const maxAncho = cajaAncho - espacio * 2;
    const maxAlto = cajaAlto - espacio * 2;

    const proporcion = Math.min(
      maxAncho / logotipo.ancho,
      maxAlto / logotipo.alto
    );

    const anchoImagen = logotipo.ancho * proporcion;
    const altoImagen = logotipo.alto * proporcion;

    const xImagen =
      cajaX + (cajaAncho - anchoImagen) / 2;

    const yImagen =
      cajaY + (cajaAlto - altoImagen) / 2;

    documento.addImage(
      logotipo.datos,
      "PNG",
      xImagen,
      yImagen,
      anchoImagen,
      altoImagen
    );

    xNombre = margen + 42;
    anchoNombre = anchoContenido - 42;
  }

  documento.setFont("helvetica", "bold");
  documento.setFontSize(17);
  documento.setTextColor(255, 255, 255);

  const nombreNegocio = textoPdf(
    negocio.nombre || "Mi negocio"
  );

  const lineasNombre = documento.splitTextToSize(
    nombreNegocio,
    anchoNombre
  );

  documento.text(
    lineasNombre.slice(0, 2),
    xNombre,
    17
  );

  documento.setFontSize(9);
  documento.setFont("helvetica", "normal");

  documento.text(
    "COTIZACION PROFESIONAL",
    xNombre,
    37
  );

  // Datos generales
  let y = 53;

  documento.setFont("helvetica", "bold");
  documento.setFontSize(14);
  documento.setTextColor(...oscuro);

  documento.text(
    textoPdf(`Cotizacion ${cotizacion.numero}`),
    margen,
    y
  );

  y += 10;

  documento.setFontSize(9);
  documento.setFont("helvetica", "normal");
  documento.setTextColor(...gris);

  documento.text(
    `Emision: ${fechaLegible(cotizacion.fecha_emision)}`,
    margen,
    y
  );

  documento.text(
    `Vencimiento: ${fechaLegible(cotizacion.fecha_vencimiento)}`,
    margen + 85,
    y
  );

  y += 13;

  // Información del negocio y cliente
  const anchoColumna = (anchoContenido - 12) / 2;
  const xCliente = margen + anchoColumna + 12;

  const datosNegocio = [
    negocio.telefono,
    negocio.email,
    negocio.direccion,
  ]
    .filter(Boolean)
    .map(textoPdf)
    .join("\n");

  const datosCliente = [
    cliente?.nombre || "Cliente",
    cliente?.identificacion
      ? `Identificacion: ${cliente.identificacion}`
      : "",
    cliente?.telefono
      ? `Telefono: ${cliente.telefono}`
      : "",
    cliente?.email || "",
    cliente?.direccion || "",
  ]
    .filter(Boolean)
    .map(textoPdf)
    .join("\n");

  const yNegocio = escribirBloque(
    documento,
    "EMITIDO POR",
    datosNegocio || negocio.nombre,
    margen,
    y,
    anchoColumna
  );

  const yCliente = escribirBloque(
    documento,
    "PREPARADO PARA",
    datosCliente,
    xCliente,
    y,
    anchoColumna
  );

  y = Math.max(yNegocio, yCliente) + 7;

  // Tabla de conceptos
  const filas = conceptos.map((concepto) => [
    textoPdf(concepto.descripcion),
    concepto.tipo === "mano_obra"
      ? "Mano de obra"
      : "Material",
    `${Number(concepto.cantidad)} ${textoPdf(concepto.unidad)}`,
    moneda(concepto.precio_unitario, codigoMoneda),
    moneda(concepto.subtotal, codigoMoneda),
  ]);

  autoTable(documento, {
    startY: y,
    head: [[
      "Descripcion",
      "Tipo",
      "Cantidad",
      "P. unitario",
      "Subtotal",
    ]],
    body: filas,
    theme: "striped",
    margin: {
      left: margen,
      right: margen,
      top: 18,
      bottom: 22,
    },
    headStyles: {
      fillColor: principal,
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: 3,
      overflow: "linebreak",
    },
    columnStyles: {
      0: { cellWidth: 59 },
      1: { cellWidth: 27 },
      2: { cellWidth: 27 },
      3: { cellWidth: 32, halign: "right" },
      4: { cellWidth: 33, halign: "right" },
    },
  });

  y = (documento.lastAutoTable?.finalY ?? y) + 12;

  function asegurarEspacio(altura) {
    if (y + altura > altoPagina - 22) {
      documento.addPage();
      y = 22;
    }
  }

  function filaTotal(etiqueta, valor, destacado = false) {
    asegurarEspacio(destacado ? 15 : 9);

    if (destacado) {
      documento.setFillColor(...principal);

      documento.roundedRect(
        margen,
        y - 5,
        anchoContenido,
        13,
        2,
        2,
        "F"
      );

      documento.setTextColor(255, 255, 255);
      documento.setFont("helvetica", "bold");
      documento.setFontSize(12);
    } else {
      documento.setTextColor(...oscuro);
      documento.setFont("helvetica", "normal");
      documento.setFontSize(10);
    }

    documento.text(etiqueta, margen + 4, y + 3);

    documento.text(
      moneda(valor, codigoMoneda),
      anchoPagina - margen - 4,
      y + 3,
      { align: "right" }
    );

    y += destacado ? 19 : 10;
  }

  filaTotal("Subtotal", cotizacion.subtotal);

  filaTotal(
    "Descuento",
    -Number(cotizacion.descuento || 0)
  );

  const etiquetaIva = cotizacion.aplicar_iva
    ? `IVA (${Number(cotizacion.iva_porcentaje)}%)`
    : "IVA (no aplicado)";

  filaTotal(etiquetaIva, cotizacion.iva_valor);
  filaTotal("TOTAL", cotizacion.total, true);

  function agregarParrafo(titulo, contenido) {
    if (!limpiarTexto(contenido)) return;

    documento.setFont("helvetica", "normal");
    documento.setFontSize(9);

    const lineas = documento.splitTextToSize(
      textoPdf(contenido),
      anchoContenido
    );

    asegurarEspacio(13);

    documento.setFont("helvetica", "bold");
    documento.setTextColor(...principal);
    documento.text(titulo, margen, y);

    y += 7;

    documento.setFont("helvetica", "normal");
    documento.setTextColor(...oscuro);

    for (const linea of lineas) {
      asegurarEspacio(5);
      documento.text(linea, margen, y);
      y += 5;
    }

    y += 7;
  }

  agregarParrafo("NOTAS", cotizacion.notas);

  agregarParrafo(
    "TERMINOS Y CONDICIONES",
    cotizacion.terminos
  );

  // Pie de página
  const cantidadPaginas =
    documento.internal.getNumberOfPages();

  for (
    let pagina = 1;
    pagina <= cantidadPaginas;
    pagina++
  ) {
    documento.setPage(pagina);

    documento.setDrawColor(225, 230, 235);

    documento.line(
      margen,
      altoPagina - 17,
      anchoPagina - margen,
      altoPagina - 17
    );

    documento.setFont("helvetica", "normal");
    documento.setFontSize(8);
    documento.setTextColor(...gris);

    documento.text(
      "Generado con Cotizafacil",
      margen,
      altoPagina - 11
    );

    documento.text(
      `Pagina ${pagina} de ${cantidadPaginas}`,
      anchoPagina - margen,
      altoPagina - 11,
      { align: "right" }
    );
  }

  return documento;
}

export function nombreArchivoCotizacion(cotizacion) {
  const numeroSeguro = limpiarTexto(cotizacion?.numero)
    .replace(/[^a-zA-Z0-9_-]/g, "_");

  return `Cotizacion_${numeroSeguro || "documento"}.pdf`;
}

export async function generarPdfCotizacion(datos) {
  const documento = await construirPdfCotizacion(datos);

  documento.save(
    nombreArchivoCotizacion(datos.cotizacion)
  );
}

export async function crearArchivoPdfCotizacion(datos) {
  const documento = await construirPdfCotizacion(datos);
  const blob = documento.output("blob");

  return new File(
    [blob],
    nombreArchivoCotizacion(datos.cotizacion),
    { type: "application/pdf" }
  );
}
