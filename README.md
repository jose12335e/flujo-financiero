# Flujo Personal

Aplicacion web profesional de control de gastos personales construida con `React + TypeScript + Vite + Tailwind CSS`.

## Que incluye

- Dashboard con balance, ingresos, gastos, presupuesto mensual y ultimos movimientos.
- Registro y edicion de ingresos y gastos con validacion usando `react-hook-form` y `zod`.
- Historial con busqueda, filtros por tipo, categoria y fechas.
- Reportes con graficos de gastos por categoria e ingresos vs gastos.
- Configuracion de moneda, presupuesto mensual, alertas y modo oscuro.
- Login y registro con correo y contrasena usando Supabase Auth.
- Persistencia remota por usuario con Supabase y cache local con `localStorage`.

## Estructura

```text
src/
  app/          router, layout principal y providers
  components/   UI reutilizable y navegacion
  data/         categorias y monedas predeterminadas
  features/     modulos por dominio: dashboard, reportes, settings, auth, transactions
  hooks/        hooks de estado y persistencia
  lib/          cliente y bootstrap de Supabase
  styles/       tema global y tokens visuales
  types/        contratos de datos de la app y la base
  utils/        calculos financieros, storage y sincronizacion
  test/         setup de pruebas
supabase/       schema SQL para la base remota
```

## Scripts

- `npm run dev`: entorno local
- `npm run dev:server`: backend IA local con Gemini
- `npm run build`: build de produccion
- `npm run lint`: revision estatica
- `npm run test:run`: suite de pruebas

## Configurar Supabase

1. Copia `.env.example` a `.env`.
2. Completa `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY`.
3. Si vas a usar los modulos IA localmente, agrega tambien:
   - `AI_GEMINI_API_KEY`
   - `AI_GEMINI_MODEL=gemini-2.5-flash`
4. Ejecuta el SQL de `supabase/schema.sql` en el SQL Editor de tu proyecto.
5. En `Authentication > Providers`, deja activo `Email`.
6. En `Authentication > URL Configuration`, agrega `http://127.0.0.1:5173` como `Site URL`.
7. Para trabajar con IA en local, usa dos terminales:
   - `npm run dev:server`
   - `npm run dev`

## Lanzarla para otras personas

La forma mas simple para esta app es desplegarla en `Vercel`.

### 1. Subir el proyecto a GitHub

1. Crea un repositorio nuevo en GitHub.
2. Sube este proyecto completo.
3. Verifica que no se suba `.env`.

### 2. Crear el despliegue en Vercel

1. Entra a Vercel y pulsa `Add New > Project`.
2. Importa tu repositorio.
3. Vercel detectara Vite automaticamente.
4. Usa estos valores si te los pide:
   - Build Command: `npm run build`
   - Output Directory: `dist`

### 3. Variables de entorno en Vercel

Agrega estas variables en el proyecto de Vercel:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `AI_GEMINI_API_KEY`
- `AI_GEMINI_MODEL`

Usa los mismos valores que ya probaste localmente.

### 3.1 Backend IA en Vercel

- Los endpoints IA viven bajo `/api/...`.
- La configuracion actual ya deja pasar `/api` antes del fallback SPA.
- Ejemplos que deben responder en produccion:
  - `/api/health`
  - `/api/ai/chat/message`
  - `/api/ai/documents/analyze`
  - `/api/ai/recommendations/generate`
  - `/api/ai/insights/generate`
  - `/api/ai/forecasting/generate`
  - `/api/ai/transactions/classify`
  - `/api/ai/transactions/organize`

### 4. Ajustar Supabase para produccion

En tu proyecto de Supabase:

1. Ve a `Authentication > URL Configuration`.
2. Pon tu dominio de Vercel como `Site URL`.
3. Agrega tambien tu dominio de Vercel en `Redirect URLs`.

Ejemplo:

- `https://tu-app.vercel.app`

### 5. Revisar correo de autenticacion

Si otras personas van a crear cuentas reales, conviene configurar SMTP propio en Supabase antes de abrirla al publico para evitar limites del proveedor por defecto.

### 6. Desplegar

Cada push a la rama principal generara una nueva version publica.

## Notas

- Cada usuario solo puede leer y modificar sus propios datos gracias a Supabase Auth + RLS.
- La app intenta cargar primero desde Supabase cuando esta configurado.
- Si Supabase no esta disponible, la aplicacion sigue funcionando con la copia local hasta recuperar la conexion.
