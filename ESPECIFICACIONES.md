# Cotizafácil — Especificaciones del MVP v1.0

**Fecha de corte:** 12 de octubre de 2026  
**Estado:** alcance funcional cerrado; verificación final del despliegue y acceso directo móvil pendiente.

## 1. Problema y destinatarios

Cotizafácil simplifica la preparación de cotizaciones para trabajadores independientes, técnicos y pequeños negocios que necesitan calcular precios, presentar una cotización y enviarla al cliente desde el celular. Objetivo de experiencia: completar una cotización habitual en menos de dos minutos (meta, no resultado medido).

## 2. Alcance aprobado e implementado

| Área | Requisito | Evidencia de la conversación |
|---|---|---|
| Acceso | Registro/login/cierre de sesión | Incluido y declarado terminado en MVP |
| Negocio | Datos, logo, moneda, IVA y color del PDF | Incluido y declarado terminado |
| Clientes | Crear y gestionar clientes | Incluido y declarado terminado |
| Catálogo | Materiales y mano de obra reutilizables | Incluido y declarado terminado |
| Cotizaciones | Crear con cliente, fechas, conceptos, descuentos, IVA, notas y términos | Probado; G.6.4 confirmada |
| Historial | Consultar y gestionar cotizaciones | Incluido y declarado terminado |
| Estados | `borrador`, `enviada`, `aceptada`, `rechazada` | G.2 confirmada |
| Edición | Modificar cabecera y conceptos | G.3 y G.6.3 confirmadas |
| Duplicación | Nueva cotización independiente | G.4 y G.6.4 confirmadas |
| Eliminación | Confirmación; eliminación en cascada de conceptos | G.5 y G.6.1 confirmadas |
| PDF / WhatsApp | Generar PDF y compartir | Incluido y declarado terminado |
| Dashboard | Indicadores y recientes | G.1 confirmada |
| Instalación | Acceso directo Android/iPhone y favicon | Configurada en instrucciones; falta confirmar resultado final en dispositivos |

## 3. Reglas de negocio relevantes

1. Cada cotización pertenece a un usuario y negocio y referencia a un cliente.
2. Los conceptos son materiales o mano de obra, con descripción, unidad, cantidad y precio.
3. Subtotal, descuento, IVA y total se calculan en el proceso de guardado.
4. Al duplicar se genera otro número de cotización y se crea en estado `borrador`.
5. La edición mantiene la identidad y estado de la cotización, y sustituye sus filas internas de conceptos como operación atómica.
6. Si falla cualquier paso del guardado atómico, la transacción completa se revierte.
7. Los conceptos manuales pueden tener `item_frecuente_id = NULL`; es un valor válido.

## 4. Datos y relaciones

Tablas identificadas durante el desarrollo:

```text
negocios
  ├── clientes
  ├── items_frecuentes
  └── cotizaciones
        └── cotizacion_items
```

**Tablas:**

- `negocios`: `id`, `usuario_id`, nombre, contacto, dirección, logo, personalización PDF, moneda e IVA, vigencia y términos.
- `clientes`: `id`, `negocio_id`, `usuario_id`, nombre e información de contacto.
- `items_frecuentes`: `id`, `negocio_id`, `usuario_id`, nombre, descripción, tipo, unidad, precio y activo.
- `cotizaciones`: `id`, `negocio_id`, `usuario_id`, `cliente_id`, número, fechas, estado, importes, notas y términos.
- `cotizacion_items`: `id`, `cotizacion_id`, `negocio_id`, `usuario_id`, referencia opcional al catálogo, descripción, tipo, unidad, cantidad, precio, subtotal y orden.

**Integridad confirmada:** FK de `cotizacion_items → cotizaciones` con `ON DELETE CASCADE`; FK de `cotizaciones → clientes` con `NO ACTION`; FK de `cotizacion_items → items_frecuentes` con `NO ACTION`. No se requirieron modificaciones en esas relaciones durante G.6.1.

## 5. Autorización y transacciones

- Supabase Auth identifica al usuario.
- Se verificaron ocho políticas RLS de SELECT/INSERT/UPDATE/DELETE para `cotizaciones` y `cotizacion_items` (G.6.2). No equivale a una auditoría integral de todas las tablas.
- G.6.3: RPC `public.editar_cotizacion_segura(...)`, ejecutada como `SECURITY INVOKER`.
- G.6.4: RPC `public.crear_cotizacion_segura(...)`, también `SECURITY INVOKER`; se utiliza para creación y duplicación.
- Las dos funciones fueron probadas funcionalmente por el usuario; sus scripts SQL originales deben conservarse como referencia de migración fuera de estos documentos.

## 6. Arquitectura

```text
Navegador / acceso directo móvil
  → React + Vite + Tailwind + React Router
    → Supabase Auth / PostgreSQL-RLS / Storage / RPC
  → PDF generado en navegador / compartir por WhatsApp

GitHub → Vercel (frontend publicado)
```

No hay evidencia de un servidor propio separado para la aplicación.

## 7. Rutas observadas en el código disponible

```text
/login
/dashboard
/configurar-negocio
/clientes
/catalogo
/cotizaciones
/cotizaciones/nueva
/cotizaciones/:id/editar
```

Estas rutas provienen de una versión compartida de `src/App.jsx`; confirmar en el repositorio final si hubo cambios posteriores.

## 8. Criterios de aceptación del MVP

- [x] Flujo principal de cotización funcional según pruebas del usuario.
- [x] Editar, duplicar, eliminar y cambiar estados.
- [x] Generación PDF y envío WhatsApp declarados operativos.
- [x] Funciones SQL de edición y creación segura confirmadas (`G.6.3` y `G.6.4`).
- [x] `npm run build` finalizó correctamente.
- [ ] Verificar que `/login` se abre directamente tras el rewrite de Vercel.
- [ ] Verificar el ícono final y apertura del acceso directo en Android.
- [ ] Verificar el ícono final y apertura desde Safari en iPhone.
- [ ] Confirmar documentación versionada y último `git push`.

## 9. Exclusiones y cambios futuros

El MVP v1.0 queda **congelado**; cualquier función nueva debe convertirse en una propuesta separada para después de la publicación y de una decisión explícita sobre prioridad. No agregar mejoras solo porque sean técnicamente posibles.
