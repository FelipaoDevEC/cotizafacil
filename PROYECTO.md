# Cotizafácil — Documentación del proyecto

**Versión:** 0.1.0  
**Última actualización:** 2026-10-11  
**Estado:** En desarrollo — Bloque 0  
**Metodología:** Desarrollo guiado por bloques  
**Repositorio GitHub:** Pendiente  
**URL de producción:** Pendiente

---

## 1. Descripción del proyecto

Cotizafácil es una aplicación web mobile-first para crear cotizaciones y proformas profesionales en PDF.

Está dirigida a técnicos, electricistas, plomeros, carpinteros, pintores y trabajadores independientes de Latinoamérica.

### Problema

Muchos trabajadores elaboran cotizaciones utilizando papel, notas del celular o mensajes de WhatsApp, sin un formato profesional ni un historial organizado.

### Solución

Permitir que un trabajador cree, descargue y comparta una cotización profesional en menos de dos minutos.

### Acción principal

**Crear una cotización y compartirla con el cliente.**

### Objetivos

- Interfaz sencilla y completamente en español.
- Diseño optimizado para teléfonos celulares.
- Generación de cotizaciones en PDF.
- Compartir cotizaciones mediante WhatsApp.
- Guardar clientes y precios frecuentes.
- Mantener los datos privados de cada usuario.

### Fuera del alcance inicial

- Facturación electrónica oficial.
- Procesamiento de pagos.
- Inventario avanzado.
- Contabilidad completa.

---

## 2. Arquitectura

Frontend: React + Vite + Tailwind CSS.

Backend: Supabase.

Base de datos: PostgreSQL.

Autenticación: Supabase Auth.

Seguridad: Row Level Security (RLS).

Almacenamiento: Supabase Storage.

Generación de PDF: Librería de generación en el navegador, pendiente de selección definitiva.

Hosting: Vercel.

Control de versiones: Git + GitHub.

---

## 3. Stack tecnológico

| Tecnología | Uso | Estado |
|---|---|---|
| React | Interfaz de usuario | Instalado |
| Vite | Entorno de desarrollo | Instalado |
| Tailwind CSS 3 | Estilos | Configurado |
| React Router | Navegación | Instalado |
| Lucide React | Iconografía | Instalado |
| Supabase JS | Cliente del backend | Instalado |
| PostgreSQL | Base de datos | Pendiente |
| GitHub | Control de versiones remoto | Pendiente |
| Vercel | Publicación | Pendiente |
| PWA | Instalación móvil | Pendiente |

Las versiones exactas de las dependencias se mantienen en `package.json`.

---

## 4. Modelo de datos previsto

El modelo inicial contiene cinco tablas:

1. `negocios`: configuración del negocio y propietario.
2. `clientes`: información de los clientes.
3. `items_frecuentes`: materiales y servicios reutilizables.
4. `cotizaciones`: encabezado, importes y estado.
5. `cotizacion_items`: líneas de cada cotización.

### Seguridad

Cada usuario podrá consultar y modificar únicamente la información de su negocio.

Se implementarán políticas RLS en todas las tablas.

Los límites comerciales y las operaciones sensibles deberán validarse en el backend.

**Estado:** Modelo propuesto, todavía no implementado.

---

## 5. Estructura de carpetas

```text
cotizafacil/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── contexts/
│   ├── hooks/
│   ├── lib/
│   ├── pages/
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
└── PROYECTO.md
```

---

## 6. Reglas de desarrollo

1. Trabajar mediante bloques pequeños.
2. Explicar cada paso antes de implementarlo.
3. No avanzar sin verificar el funcionamiento del paso anterior.
4. Mantener comentarios útiles en español.
5. Separar interfaz, lógica y acceso a datos.
6. Diseñar primero para dispositivos móviles.
7. Priorizar la simplicidad para usuarios no técnicos.
8. Documentar errores y decisiones importantes.
9. Proteger la información de los usuarios.
10. Realizar commits al completar bloques funcionales.

---

## 7. Roadmap

### Bloque 0 — Preparación

- [x] 0.1 Verificar Node.js, npm y Git.
- [x] 0.2 Crear proyecto React + Vite.
- [x] 0.3 Configurar Tailwind CSS.
- [x] 0.4 Instalar librerías principales.
- [x] 0.5 Crear estructura de carpetas.
- [ ] 0.6 Crear y verificar PROYECTO.md.
- [ ] Configurar Git y GitHub.
- [ ] Crear proyecto Supabase.

### Bloque A — Autenticación

- [ ] Registro de usuarios.
- [ ] Inicio de sesión.
- [ ] Cierre de sesión.
- [ ] Persistencia de sesión.
- [ ] Protección de rutas.

### Bloque B — Base de datos

- [ ] Crear tablas.
- [ ] Crear relaciones e índices.
- [ ] Configurar RLS.
- [ ] Configurar almacenamiento de logos.

### Bloque C — Onboarding

- [ ] Datos del negocio.
- [ ] Logo y color.
- [ ] Moneda, IVA y condiciones.

### Bloque D — Cotizaciones

- [ ] Seleccionar o crear cliente.
- [ ] Agregar materiales y mano de obra.
- [ ] Calcular totales.
- [ ] Guardar borrador.

### Bloque E — PDF y WhatsApp

- [ ] Generar PDF A4.
- [ ] Mostrar vista previa.
- [ ] Descargar PDF.
- [ ] Compartir por WhatsApp.

### Bloques posteriores

- [ ] Historial.
- [ ] Gestión de clientes.
- [ ] Precios frecuentes.
- [ ] Planes Gratis y Pro.
- [ ] Estadísticas.
- [ ] PWA y despliegue.

---

## 8. Ejecución local

Abrir PowerShell dentro de la carpeta del proyecto.

Ejecutar:

```powershell
npm install
npm run dev
```

Abrir la dirección local indicada por Vite, normalmente:

http://localhost:5173/

---

## 9. Registro de errores

Sin errores pendientes reportados hasta el paso 0.5.

Registrar aquí los errores encontrados, su causa y la solución aplicada.

---

## 10. Registro de decisiones

**D001:** Utilizar React, Vite y Tailwind CSS 3.

**D002:** Utilizar Supabase como backend.

**D003:** Desarrollar primero la funcionalidad principal de cotización y PDF.

**D004:** Mantener el desarrollo guiado con validación por pasos.

**D005:** Permitir cinco tablas en Cotizafácil porque el modelo requiere más entidades que una mini app básica.

**D006:** Priorizar una interfaz mobile-first con azul oscuro y naranja.

---

## 11. Próximo paso

Completar y verificar la documentación inicial.

Después, continuar con la configuración de Git y GitHub.
