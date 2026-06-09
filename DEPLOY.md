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

## 2. Deploy inicial en Hostinger (una sola vez)

Conectarte por SSH al servidor de Hostinger:

```bash
ssh u[USUARIO]@agroconecta.com.py
```

Clonar el repo y configurar la app:

```bash
cd ~/domains/agroconecta.com.py/public_html
git clone https://github.com/TU_USUARIO/agroconecta.git .
cd web

# Crear las variables de entorno en el servidor
nano .env.production
```

Contenido de `.env.production` en el servidor:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ukodavvtmrrqnfgyvqql.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=TU_SERVICE_ROLE_KEY
```

Obtener el Service Role Key desde: **Supabase → Settings → API → service_role**

Luego instalar dependencias, buildear y levantar con PM2:

```bash
npm install
npm run build
pm2 start ecosystem.config.js
pm2 save
pm2 startup   # Para que PM2 arranque automáticamente al reiniciar el servidor
```

---

## 3. Configurar nginx en Hostinger (hPanel)

En hPanel → **Websites → Manage → Advanced → .htaccess / Proxy**, agregar:

```nginx
location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
}
```

Alternativamente, en hPanel ir a **Websites → Node.js** y activar el proceso apuntando al directorio `/web`.

---

## 4. Configurar GitHub Secrets para CI/CD automático

En GitHub → **Settings → Secrets and variables → Actions**, agregar:

| Secret | Valor |
|---|---|
| `HOSTINGER_HOST` | `agroconecta.com.py` |
| `HOSTINGER_USER` | Tu usuario SSH de Hostinger (empieza con `u...`) |
| `HOSTINGER_SSH_KEY` | Tu clave SSH privada (ver abajo) |

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
