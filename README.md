# Cotizafácil

**Versión:** 1.0 — MVP funcional  
**Estado:** MVP funcional y diseño móvil aprobados; documentación preparada para publicación, instalación en dispositivos pendiente de confirmación final  
**Aplicación:** https://cotizafacil-phi.vercel.app  
**Repositorio:** GitHub (URL no registrada en esta documentación)

Cotizafácil es una miniapp web **mobile-first**, en español, para profesionales y pequeños negocios que necesitan **crear cotizaciones rápidamente, generar un PDF y compartirlo por WhatsApp**. Busca que la cotización habitual tome menos de dos minutos; este tiempo es un objetivo de diseño, no una medición validada.

## Funciones incluidas en el MVP

- Autenticación mediante Supabase Auth.
- Configuración del negocio: datos, logotipo, moneda, porcentaje de IVA y color del PDF.
- Gestión de clientes.
- Catálogo de materiales y mano de obra.
- Cotizaciones con conceptos, cantidades, precios, descuentos, IVA, notas y términos.
- Historial; estados `borrador`, `enviada`, `aceptada` y `rechazada`.
- Edición, duplicación y eliminación de cotizaciones.
- PDF personalizado y opción de compartir por WhatsApp.
- Dashboard con estadísticas y cotizaciones recientes; interfaz móvil blanca con barra inferior de cinco accesos y acción de nueva cotización.
- Guardado atómico en PostgreSQL: edición (G.6.3) y creación/duplicación (G.6.4).

**Fuera del alcance v1.0:** facturación electrónica, pasarela de pagos, multiusuario por negocio, módulos adicionales o funcionamiento sin conexión garantizado.

## Tecnologías

React · Vite · Tailwind CSS · React Router · Lucide React · Supabase (Auth, PostgreSQL, RLS y Storage) · GitHub · Vercel. Generación de PDF en el navegador.

> Consultar `package.json` para versiones exactas de dependencias. No se incluyen versiones inferidas.

## Ejecución local (Windows / PowerShell)

Desde la raíz del repositorio, donde se encuentra `package.json`:

```powershell
npm install
npm run dev
```

Para comprobar la compilación de producción:

```powershell
npm run build
```

La compilación de producción se ejecutó con éxito el 12 de octubre de 2026 (`vite v8.3.4`). Hubo un aviso no bloqueante de tamaño de bundle >500 kB.

## Variables de entorno

En la raíz del proyecto, crear `.env.local` con las variables públicas que **realmente utiliza** `src/lib/supabase.js` (verificar los identificadores en ese archivo):

```dotenv
VITE_SUPABASE_URL=https://TU_PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=TU_CLAVE_PUBLICA
```

No subir `.env`, `.env.local`, credenciales de base de datos ni `service_role` a GitHub. Las variables `VITE_` son visibles en el navegador; solo se deben usar claves públicas. Configurar en Vercel los **mismos nombres** que existan en el código.

## Despliegue en Vercel

1. Confirmar que el repositorio GitHub está actualizado y que las variables sensibles no estén versionadas.
2. Importar el repositorio en Vercel con framework **Vite**.
3. Compilación: `npm run build` · salida: `dist` · raíz: donde está `package.json`.
4. Configurar las variables públicas de Supabase.
5. Para React Router con `BrowserRouter`, incluir en la raíz `vercel.json`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

6. Verificar en Supabase Auth las URLs/redirecciones que use el flujo de autenticación.
7. Tras el despliegue, probar la URL pública y una ruta abierta directamente, como `/login`.

La ruta `/login` mostró anteriormente `404 NOT_FOUND` al abrirse directamente; la regla de reescritura fue propuesta como corrección. **No consta aquí confirmación posterior de la prueba definitiva de esa ruta.**

## Iconos y acceso directo móvil

Archivos esperados en `public/`:

```text
public/
  favicon.png
  icon-192.png
  icon-512.png
  apple-touch-icon.png
  manifest.webmanifest
```

`index.html` debe enlazar favicon, manifest, `apple-touch-icon` y definir `<html lang="es">` y `<title>Cotizafácil</title>`. El manifiesto define nombre `Cotizafácil`, `display: standalone` y color naranja `#ff6b00`.

- **Android:** abrir la URL en Chrome y usar "Instalar" o "Agregar a pantalla de inicio".
- **iPhone:** abrir en Safari → Compartir → Agregar a pantalla de inicio.
- Si persiste un icono viejo, borrar el acceso directo y crearlo de nuevo después de desplegar la versión actualizada.

Esto **no implica** soporte offline ni notificaciones push.

## Documentación del proyecto

- [`ESPECIFICACIONES.md`](./ESPECIFICACIONES.md): alcance, módulos, datos, arquitectura y aceptación.
- [`DECISIONES.md`](./DECISIONES.md): decisiones técnicas, límites y lecciones aprendidas.
- [`CHECKPOINT.md`](./CHECKPOINT.md): estado al cierre, evidencia, pendientes y próximo paso.

## Mantenimiento y seguridad

- La separación de datos depende de las políticas RLS y de `usuario_id`/`negocio_id`.
- Las funciones `public.editar_cotizacion_segura` y `public.crear_cotizacion_segura` utilizan `SECURITY INVOKER` y respetan el acceso del usuario autenticado.
- Para desplegar nuevas versiones: hacer un cambio delimitado, una comprobación esencial, actualizar documentación, ejecutar `git status` y recién entonces confirmar/pushear los cambios.

**Última actualización documental:** 12 de octubre de 2026.
