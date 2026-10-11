
# Cotizafácil

## 1. Descripción del proyecto

Cotizafácil es una aplicación web progresiva (PWA)
orientada a trabajadores independientes y pequeños
negocios de Latinoamérica.

Su objetivo es permitir crear cotizaciones y proformas
profesionales de forma rápida, generar documentos PDF
y compartirlos con clientes mediante WhatsApp.

La aplicación debe ser fácil de utilizar desde
un teléfono móvil, incluso para personas con
poca experiencia tecnológica.

## 2. Público objetivo

- Electricistas
- Plomeros
- Técnicos de mantenimiento
- Instaladores
- Albañiles
- Carpinteros
- Pintores
- Trabajadores independientes
- Pequeños negocios de servicios

## 3. Tecnologías

Frontend:
- React
- Vite
- JavaScript
- Tailwind CSS 3
- React Router
- Lucide React

Backend y autenticación:
- Supabase
- Supabase Auth
- PostgreSQL
- Row Level Security (RLS)

Despliegue:
- GitHub
- Vercel

Objetivo adicional:
- Convertir la aplicación en PWA instalable.

## 4. Identidad visual

Color principal: #17324D
Color de acción: #F97316
Color de fondo: #F8FAFC
Color de texto: #1E293B

Diseño:
- Mobile-first
- Interfaz limpia
- Botones grandes
- Formularios sencillos
- Navegación intuitiva
- Adaptación a pantallas de 375 px

## 5. Funcionalidades previstas

### Autenticación
- Registro de usuarios
- Inicio de sesión
- Confirmación de correo
- Persistencia de sesión
- Cierre de sesión
- Protección de rutas

### Configuración del negocio
- Nombre comercial
- Información de contacto
- Dirección
- Logotipo
- Color del PDF
- Moneda
- IVA
- Vigencia de cotizaciones
- Términos y condiciones

### Clientes
- Registrar clientes
- Editar clientes
- Consultar clientes
- Seleccionar clientes en cotizaciones

### Catálogo de precios
- Registrar productos o servicios frecuentes
- Definir precios
- Reutilizar conceptos en cotizaciones

### Cotizaciones
- Crear cotizaciones
- Agregar materiales y mano de obra
- Calcular subtotales
- Aplicar descuentos
- Calcular IVA
- Generar PDF
- Compartir mediante WhatsApp
- Consultar historial
- Editar o duplicar cotizaciones

### Planes

Plan gratuito:
- Hasta 5 cotizaciones por mes
- Hasta 15 conceptos frecuentes
- PDF con marca Cotizafácil

Plan Pro:
- Cotizaciones ilimitadas
- Catálogo ampliado
- Estadísticas
- Duplicación de cotizaciones
- Personalización adicional

La integración de pagos se definirá posteriormente.

## 6. Base de datos prevista

Tablas principales:

1. negocios
2. clientes
3. items_frecuentes
4. cotizaciones
5. cotizacion_items

La estructura definitiva se implementará
en el Bloque B.

Cada usuario deberá acceder únicamente
a sus propios datos mediante políticas RLS.

## 7. Estructura del proyecto

src/
  components/
    RutaPrivada.jsx
  contexts/
    AuthContext.jsx
  hooks/
  lib/
    supabase.js
  pages/
    Auth.jsx
    Bienvenida.jsx
  App.jsx
  index.css

Archivos adicionales:
- .env.local
- .gitignore
- package.json
- tailwind.config.js
- PROYECTO.md

## 8. Avance del desarrollo

### BLOQUE 0 — Preparación

Estado: COMPLETADO

- Proyecto creado con Vite y React
- Tailwind CSS 3 configurado
- React Router instalado
- Lucide React instalado
- Supabase JS instalado
- Estructura de carpetas creada
- Repositorio Git inicializado
- Repositorio privado de GitHub conectado
- Proyecto Supabase creado
- Variables de entorno configuradas
- Conexión inicial con Supabase verificada

### BLOQUE A — Autenticación

Estado: COMPLETADO

A.1 Pantalla de autenticación
- Formulario responsive
- Diseño de Cotizafácil
- Alternancia entre registro e inicio de sesión

A.2 Registro
- Registro conectado a Supabase Auth
- Mensajes de resultado
- Manejo de errores
- Estado de carga

A.3 Inicio de sesión
- Acceso con correo y contraseña
- Validación de credenciales
- Manejo de errores

A.4 Gestión de sesión
- AuthContext
- Recuperación de sesión
- Detección de cambios de autenticación
- Pantalla temporal de bienvenida
- Cierre de sesión

A.5 Rutas privadas
- React Router configurado
- Ruta pública /login
- Ruta privada /dashboard
- Redirecciones automáticas
- Persistencia de acceso al actualizar

Pruebas realizadas:
- Registro correcto
- Inicio de sesión correcto
- Persistencia al actualizar
- Cierre de sesión correcto
- Protección de rutas correcta

### BLOQUE B — Base de datos y seguridad

Estado: PENDIENTE

Objetivos:
- Crear las tablas principales
- Establecer relaciones
- Configurar claves foráneas
- Activar Row Level Security
- Crear políticas de acceso por usuario
- Verificar aislamiento de datos

### BLOQUE C — Configuración inicial del negocio

Estado: PENDIENTE

Objetivos:
- Onboarding en 3 pasos
- Datos del negocio
- Logotipo y color
- Configuración de moneda e IVA
- Vigencia y términos

### BLOQUE D — Funcionalidades principales

Estado: PENDIENTE

Objetivos:
- Dashboard
- Clientes
- Catálogo de precios
- Creación de cotizaciones
- Historial
- Cálculos

### BLOQUE E — Documentos y WhatsApp

Estado: PENDIENTE

Objetivos:
- Generación de PDF
- Vista previa
- Descarga
- Compartir mediante WhatsApp

### BLOQUE F — Planes y publicación

Estado: PENDIENTE

Objetivos:
- Límites del plan gratuito
- Funciones Pro
- Optimización móvil
- PWA
- Despliegue en Vercel

## 9. Decisiones técnicas

- Desarrollo incremental por bloques.
- Cada paso debe probarse antes de avanzar.
- Se utilizará React con JavaScript.
- Se mantendrá Tailwind CSS 3.
- Supabase gestionará la autenticación y los datos.
- Las rutas privadas protegen la navegación.
- Las políticas RLS protegerán los datos.
- No se incluirán claves secretas en el repositorio.
- El diseño priorizará dispositivos móviles.
- Se conservará el historial del proyecto en GitHub.

## 10. Metodología de trabajo

Las instrucciones deben incluir:

1. Ruta exacta del archivo.
2. Indicación de crear o reemplazar.
3. Código completo cuando se modifique un archivo.
4. Comandos exactos para PowerShell.
5. Pruebas claras.
6. Confirmación antes del siguiente paso.

No avanzar si existen errores pendientes.

## 11. Próximo paso

Comenzar el Bloque B.

Primera actividad:
Diseñar y crear la estructura inicial de
la base de datos en Supabase.

Antes de desarrollar nuevas pantallas,
se deberán configurar las relaciones
y las políticas de seguridad RLS.
