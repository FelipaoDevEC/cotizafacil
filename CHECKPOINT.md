# Cotizafácil — Checkpoint de entrega v1.0

**Fecha de referencia:** 12 de octubre de 2026  
**Fase actual:** documentación de cierre y publicación de archivos Markdown  
**Estado global:** MVP funcional y diseño móvil blanco aprobados por el usuario; publicación y push visual reportados. Falta subir la documentación y verificar ciertos detalles de instalación por dispositivo.

## 1. Qué está terminado

| Bloque / etapa | Estado | Evidencia disponible |
|---|---|---|
| Base del proyecto, Auth, negocio, clientes y catálogo | ✅ Funcional | Confirmado durante desarrollo |
| Cotizaciones, historial, PDF, WhatsApp | ✅ Funcional | Confirmado durante desarrollo |
| G.1 — Dashboard | ✅ | Confirmado |
| G.2 — Estados | ✅ | Confirmado |
| G.3 — Edición | ✅ | Confirmado |
| G.4 — Duplicación | ✅ | Confirmado |
| G.5 — Eliminación | ✅ | Probada |
| G.6.1 — FKs y cascada | ✅ | Verificadas |
| G.6.2 — RLS cotizaciones y conceptos | ✅ | Ocho políticas verificadas |
| G.6.3 — Edición SQL atómica | ✅ | Usuario confirmó «todo OK» |
| G.6.4 — Creación/duplicación SQL atómicas | ✅ | Usuario confirmó «Todo ok» |
| H.1 — Build de producción | ✅ | `npm run build`: 2170 módulos, 8.41 s, éxito |
| H.2 — URL de Vercel | ◐ | URL observada: https://cotizafacil-phi.vercel.app; apareció 404 en `/login` |
| H.2 — Rewrite de rutas | ◐ | Se indicó `vercel.json`; falta confirmación final del resultado |
| Iconos Android/iPhone | ◐ | Archivos/etiquetas indicados; falta confirmación tras deploy |
| UX móvil (barra inferior fija, dashboard blanco) | ✅ | Usuario confirmó «ahora sí» y posteriormente «Listo» después de instrucciones de push |
| Documentación para GitHub | ✅ Preparada | Cuatro archivos `.md` listos; pendiente commit/push de documentación |

## 2. Datos técnicos relevantes

- Proyecto: `cotizafacil`.
- Entorno de desarrollo: Windows, VS Code, PowerShell.
- Frontend React/Vite/Tailwind; Auth/DB Supabase; despliegue Vercel.
- Compilación registrada: Vite 8.3.4; aviso de bundle >500 kB **no bloqueante**.
- RPCs en PostgreSQL: `public.editar_cotizacion_segura` y `public.crear_cotizacion_segura`.
- Ruta de inicio de sesión: `/login`.
- Diseño de ícono decidido: fondo naranja con texto blanco «Cotizafácil».

## 3. Incidencias y resolución prevista

**INC-01: 404 al recargar/abrir `/login`.** Apareció tras reiniciar laptop y al entrar desde acceso directo Android. Causa compatible con falta de rewrite SPA en Vercel. Cambio propuesto en `vercel.json`. Estado: **pendiente de confirmación con URL publicada**.

**INC-02: Se muestra ícono de Vite al instalar.** Se prepararon `favicon.png`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`, `manifest.webmanifest` y cambios en `index.html`. Estado: **pendiente de confirmación tras desplegar y reinstalar acceso directo**.

**INC-03: Documentación atrasada.** Se prepararon README, especificaciones, decisiones y checkpoint para su incorporación al repositorio. Estado: **pendiente de commit/push**.

## 4. Qué falta exactamente para cerrar v1.0

- [ ] Verificar en el repositorio que existe `vercel.json` con rewrite de SPA.
- [ ] Confirmar que `public/` contiene los 5 archivos de iconos/manifiesto y que `index.html` referencia favicon, manifest y `apple-touch-icon`.
- [ ] Confirmar que `/login` carga abriendo directamente `https://cotizafacil-phi.vercel.app/login`.
- [ ] Confirmar acceso directo con ícono correcto en Android.
- [ ] Confirmar acceso directo con ícono correcto en iPhone (Safari).
- [ ] Copiar `README.md`, `ESPECIFICACIONES.md`, `DECISIONES.md` y `CHECKPOINT.md` a la raíz del repositorio; el usuario confirmó el último push visual, no el de estos documentos.
- [ ] Verificar los nombres reales de variables Supabase en `src/lib/supabase.js` y completar cualquier diferencia documental.
- [ ] Ejecutar un único commit y push final, y confirmar despliegue Ready en Vercel.

## 5. Próximo paso concreto

**Sin agregar funcionalidades:** incorporar estos cuatro `.md` a la raíz del proyecto, revisar `git status`, realizar un solo commit/push solo de documentación. Después ejecutar una sola comprobación final de URL `/login`, Android y iPhone. Registrar el resultado en este checkpoint.

## 6. Registro de cierre (rellenar al confirmar)

```text
Fecha del último push:
Rama GitHub:
Commit:
URL del repositorio:
Vercel Ready: sí / no
/login directo: OK / error
Android: OK / pendiente
Safari iPhone: OK / pendiente
Versión v1.0 cerrada: sí / no
```

## 7. Regla para retomar en otra sesión

Leer primero `CHECKPOINT.md`, luego `ESPECIFICACIONES.md` y `DECISIONES.md`. No repetir RLS ni auditorías SQL sin un error concreto. No iniciar módulos nuevos antes de confirmar el despliegue final. Mantener rutas exactas, archivos completos y pruebas mínimas.
