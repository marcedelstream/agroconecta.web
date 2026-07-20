# Guía de deploy — Agroconecta Web

## 1. Crear el repositorio en GitHub

```bash
# Desde la raíz del proyecto
git init
git add .
git commit -m "chore: proyecto inicial"
git remote add origin https://github.com/TU_USUARIO/agroconecta.git
git push -u origin main
```

> IMPORTANTE: No subas `.env.local` — ya está en `.gitignore`.

---

## 2. Cómo se despliega hoy (Vercel — desde 2026-07-05)

> **La web se migró de Hostinger a Vercel el 2026-07-05.** El workflow de GitHub Actions a Hostinger
> (`.github/workflows/deploy-web.yml`) quedó **desactivado** (solo corre a mano vía `workflow_dispatch` si
> alguna vez hiciera falta volver atrás) — no lo uses como referencia para deploys nuevos. La sección 8 de
> abajo deja el método viejo documentado por si hace falta consultarlo, pero **no es el método actual.**

El repo es un **monorepo** (app móvil + web + supabase). Vercel solo necesita saber que el proyecto real
vive en la subcarpeta `web/`:

1. En [vercel.com](https://vercel.com) → **Add New → Project** → importar este repo de GitHub.
2. En la pantalla de configuración del proyecto, **Root Directory → `web`** (esto es lo único no-default que
   hay que tocar; Vercel detecta Next.js solo una vez que le decís dónde está).
3. Cargar las variables de entorno (Project Settings → Environment Variables, mismas que antes):

   | Variable | Valor |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://ukodavvtmrrqnfgyvqql.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key de Supabase → Settings → API |
   | `SUPABASE_SERVICE_ROLE_KEY` | Service role key de Supabase → Settings → API (¡nunca en un `.env` versionado!) |
   | `NEXT_PUBLIC_SITE_URL` | `https://agroconecta.com.py` |
   | `RESEND_API_KEY` | API key de resend.com (opcional — sin esto `/api/service-lead` responde 503 sin romper el resto) |
   | `SERVICE_LEAD_EMAIL_TO` | Correo interno donde llegan las consultas de servicio (opcional, va con la de arriba) |

4. Deploy. Cualquier push a `main` que toque `web/` redeploya solo — no hace falta ningún workflow de
   GitHub Actions, Vercel ya escucha el repo directo.
5. Dominio propio: Project Settings → Domains → agregar `agroconecta.com.py`, y apuntar el DNS del dominio
   a los registros que indique Vercel ahí mismo.

**Nota de config ya resuelta:** `next.config.ts` **no** tiene `output: 'standalone'` — se sacó a propósito
porque rompía el build en Vercel (ver commit `fix: sacar output standalone de next.config, rompia el deploy
en Vercel`). Esa opción era necesaria para el modo Hostinger/Passenger viejo, no para Vercel — si en algún
momento alguien la vuelve a agregar "para optimizar", el deploy en Vercel se rompe.

---

## 3. Acceder al panel admin

- **URL:** `https://agroconecta.com.py/admin`
- El login redirige a `/admin/login`
- Ingresar con email y contraseña de Supabase Auth
- Para crear el primer usuario admin, ir a **Supabase → Authentication → Users → Add User**

---

## 4. Acceder al admin localmente (admin-web anterior)

El panel viejo en `admin-web/` sigue funcionando para pruebas locales:

```bash
cd admin-web
npm install
npm run dev
# Abre: http://localhost:3001
```

La nueva versión integrada está en `web/` y corre en:

```bash
cd web
npm install
npm run dev
# Abre: http://localhost:3000/admin
```

---

## 8. Método anterior (Hostinger + GitHub Actions) — desactivado, solo referencia

> **No usar esto para deploys nuevos.** Queda documentado por si algún día hace falta volver a Hostinger o
> entender un deploy viejo. El método actual es la sección 2 (Vercel).

El workflow (`.github/workflows/deploy-web.yml`, hoy con `on: workflow_dispatch` únicamente) compilaba
`web/` en el runner de GitHub Actions (con `next build` + `output: 'standalone'`, que ya no está en
`next.config.ts`), armaba un `.tar.gz` con `server.js` + `.next/standalone` + `public/` + `.next/static`, lo
subía por SSH a `~/domains/agroconecta.com.py/nodejs`, y tocaba `tmp/restart.txt` para que Passenger
reiniciara la app.

Configuración que tenía en hPanel (**Websites → Node.js**):

| Campo | Valor |
|---|---|
| Application root | `domains/agroconecta.com.py/nodejs` |
| Application startup file | `server.js` |
| Application URL | `agroconecta.com.py` |
| Node.js version | 20.x |

GitHub Secrets que usaba (además de los 4 de Supabase/sitio y los 2 de Resend de la sección 2):
`HOSTINGER_HOST`, `HOSTINGER_USER`, `HOSTINGER_SSH_KEY`, `HOSTINGER_PORT`.

**Importante si algún día se retoma:** la pantalla "Importar repositorio Git" del propio panel de Hostinger
(distinta del flujo de arriba) **no sirve para este repo** — es un monorepo y Next.js vive en `web/`, no en
la raíz, así que el auto-detector de framework de Hostinger va a fallar con "el marco no es compatible o la
estructura de proyecto no es válida" apenas se intente. El método de arriba nunca pasó por esa pantalla:
crea la app Node.js a mano en hPanel y sube el build ya compilado por SSH.
