# Cotizafácil — Registro de decisiones y aprendizajes

**Corte:** 12 de octubre de 2026  
Este documento separa decisiones efectivas del proyecto y reglas de trabajo adoptadas tras la retrospectiva.

## A. Decisiones técnicas del proyecto

| Código | Decisión | Motivo / alcance |
|---|---|---|
| D-01 | React + Vite + Tailwind CSS | Miniapp sencilla, mobile-first y desarrollable por etapas |
| D-02 | Supabase Auth + PostgreSQL + RLS + Storage | Evitar backend propio; aislar datos por usuario/negocio |
| D-03 | React Router con `BrowserRouter` | Rutas navegables para cada módulo |
| D-04 | GitHub → Vercel | Control de versiones y despliegue del frontend |
| D-05 | PDF generado en navegador + compartir por WhatsApp | Resolver la acción principal del producto |
| D-06 | Cuatro estados: borrador, enviada, aceptada, rechazada | Flujo simple y suficiente para la v1 |
| D-07 | Edición atómica vía `editar_cotizacion_segura` (G.6.3) | Evitar guardados parcialmente aplicados |
| D-08 | Creación y duplicación atómicas vía `crear_cotizacion_segura` (G.6.4) | Evitar cotizaciones incompletas |
| D-09 | Funciones RPC con `SECURITY INVOKER` | Mantener los controles existentes de RLS |
| D-10 | Rewrite de rutas SPA en `vercel.json` | Resolver `404_NOT_FOUND` en acceso directo a `/login` |
| D-11 | Identidad visual naranja, favicon y manifest | Evitar ícono de Vite y facilitar acceso móvil |
| D-12 | `apple-touch-icon.png` para Safari iPhone | Configurar acceso directo desde iPhone |
| D-13 | Congelar funcionalidades en MVP v1.0 | Desplegar y documentar antes de ampliar alcance |
| D-14 | UI móvil blanca, barra inferior de cinco accesos y botón de nueva cotización | Reducir desplazamiento y navegación; usuario aprobó el resultado |

**Nota:** D-10 a D-12 describen configuraciones indicadas; su validación definitiva en producción/dispositivos sigue pendiente en el checkpoint.

## B. Decisiones sobre la metodología de miniapps

### Lo que funcionó

- Desarrollar en pasos pequeños y confirmar funcionamiento antes de continuar.
- Entregar archivos completos con ruta exacta para copiar en VS Code.
- Corregir problemas técnicos reales antes de dar por terminado un módulo.

### Problemas observados

1. Exceso de comprobaciones repetidas en Supabase; generaron fatiga y retrasos.
2. Se ampliaron funcionalidades más allá de lo estrictamente necesario para el MVP.
3. Se pospuso el despliegue y no existió una señal clara de «producto listo».
4. No se actualizó a tiempo README, especificaciones, decisiones ni checkpoint.
5. El último push a GitHub se recordó tarde.
6. Algunas instrucciones no incluían todas las rutas, archivos completos o plataformas de instalación (Android/iPhone), provocando vueltas innecesarias.

### Reglas operativas para futuras miniapps

1. **MVP congelado al inicio:** objetivo, usuarios, acción principal, módulos imprescindibles y exclusiones.
2. **Ruta crítica visible:** desarrollo esencial → build → despliegue temprano → validación mínima → documentación y cierre.
3. **Una prueba breve por cambio:** consultas SQL adicionales solo ante error concreto, riesgo demostrado o cambio estructural.
4. **Archivos listos para usar:** nombre, ruta exacta, contenido completo y comandos Windows/PowerShell.
5. **Sin funcionalidades extras por iniciativa del asistente:** backlog aparte; el usuario decide si entran.
6. **Checkpoint al terminar cada bloque:** hecho, pendiente, bloqueante, último cambio y siguiente paso.
7. **Git incluido en el cierre:** revisar `.gitignore`, `git status`, README, especificaciones y decisiones; pedir/realizar push al final del bloque acordado.
8. **Unificar cambios relacionados:** configuración de PWA desde el principio para Android, iPhone y navegador, en vez de crear varios ciclos separados.
9. **No repetir información ni archivos ya entregados:** reutilizar el contexto y solicitar únicamente aquello que realmente falte.
10. **Detenerse al terminar el MVP:** priorizar aplicación publicada y utilizable sobre perfeccionamiento indefinido.

## C. Decisiones abiertas (no inferir)

- URL definitiva del repositorio GitHub y rama principal.
- Resultado final de la corrección del 404 en `/login`.
- Confirmación real de íconos/accesos directos en Android e iPhone.
- Si las variables utilizadas por el proyecto se llaman exactamente `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` (verificar contra `src/lib/supabase.js`).
- Si el repositorio ya contiene los scripts SQL históricos como migraciones; mantenerlos documentados/reproducibles si se planea recrear el proyecto.
