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

## 2. Cómo se despliega hoy (build en GitHub Actions, no en el servidor)

El repo es un **monorepo** (app móvil + web). El workflow (`.github/workflows/deploy-web.yml`) solo se dispara
cuando cambia algo en `web/`, y **el build corre en el runner de GitHub, no en Hostinger**:

1. Compila `web/` con `next build` (que usa `output: 'standalone'` — genera un servidor autocontenido con su
   propio `node_modules` mínimo).
2. Arma un `.tar.gz` con `server.js` + `.next/standalone` + `public/` + `.next/static` + un `.env` con las
   variables de producción.
3. Sube ese único paquete por SSH a `~/domains/agroconecta.com.py/nodejs` y lo extrae ahí.
4. Toca `tmp/restart.txt` para que Passenger reinicie la app.

**Ni el código de la app móvil ni el resto del monorepo tocan el servidor** — solo el build final de `web/`.
No hace falta `git clone`, `npm install` ni PM2 en Hostinger; Passenger corre directo `node server.js`.

### Configuración inicial en hPanel (una sola vez)

En hPanel → **Websites → Node.js** (o "Setup Node.js App"), crear/editar la app con:

| Campo | Valor |
|---|---|
| Application root | `domains/agroconecta.com.py/nodejs` |
| Application startup file | `server.js` |
| Application URL | `agroconecta.com.py` |
| Node.js version | 20.x |

No hace falta tocar nginx a mano ni instalar dependencias — Hostinger maneja el proxy interno para las apps
Node.js registradas ahí.

> `ecosystem.config.js` (PM2) queda obsoleto con este flujo — se puede borrar cuando se confirme que el deploy
> automático funciona sin él.

---

## 3. (Reemplazado por la sección 2 — ya no aplica el proxy manual de nginx)

---

## 4. Configurar GitHub Secrets para CI/CD automático

En GitHub → **Settings → Secrets and variables → Actions**, agregar:

| Secret | Valor |
|---|---|
| `HOSTINGER_HOST` | `agroconecta.com.py` |
| `HOSTINGER_USER` | Tu usuario SSH de Hostinger (empieza con `u...`) |
| `HOSTINGER_SSH_KEY` | Tu clave SSH privada (ver abajo) |
| `HOSTINGER_PORT` | Puerto SSH de Hostinger (normalmente `65002`, revisar en hPanel) |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ukodavvtmrrqnfgyvqql.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key de Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key de Supabase → Settings → API (¡nunca subir a un `.env` versionado!) |
| `NEXT_PUBLIC_SITE_URL` | `https://agroconecta.com.py` |
| `RESEND_API_KEY` | API key de resend.com — para el envío de emails de los formularios de servicio |
| `SERVICE_LEAD_EMAIL_TO` | Correo interno de Agroconecta donde llegan las consultas de servicio |

**Importante:** los 4 secrets de Supabase/sitio son necesarios desde que se movió el build a CI — si no están
cargados en GitHub, el próximo deploy compila la web con las variables de Supabase vacías y el sitio rompe.
Los 2 de Resend son opcionales: sin ellos, el endpoint `/api/service-lead` responde 503 sin romper el resto del
sitio (el formulario de la app sigue guardando la consulta en Supabase igual, solo no se manda el email).

### Generar clave SSH para el deploy

En el servidor Hostinger:

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/deploy_key
cat ~/.ssh/deploy_key.pub >> ~/.ssh/authorized_keys
cat ~/.ssh/deploy_key   # <- Copiar este contenido como HOSTINGER_SSH_KEY en GitHub
```

---

## 5. Flujo de trabajo post-setup

Una vez configurado, cualquier push a `main` que toque archivos en `web/` dispara el deploy automáticamente:

```bash
# Hacer un cambio en web/
git add web/
git commit -m "feat: nueva página"
git push origin main
# → GitHub Action corre en ~2 minutos
# → El sitio se actualiza en agroconecta.com.py
```

---

## 6. Acceder al panel admin

- **URL:** `https://agroconecta.com.py/admin`
- El login redirige a `/admin/login`
- Ingresar con email y contraseña de Supabase Auth
- Para crear el primer usuario admin, ir a **Supabase → Authentication → Users → Add User**

---

## 7. Acceder al admin localmente (admin-web anterior)

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
