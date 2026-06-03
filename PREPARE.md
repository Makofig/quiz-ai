# OPEN_SOURCE_PREPARATION.md

# Objetivo

Preparar el proyecto para ser publicado en GitHub como una plataforma gratuita de generación de quizzes impulsada por IA.

El objetivo es eliminar completamente el sistema de usuarios y autenticación para reducir complejidad y facilitar la instalación local.

---

# Estado Actual

Actualmente el proyecto contiene:

## Frontend

* Login
* Register
* Dashboard
* Historial
* Generación de Quiz
* Resolución de Quiz
* Resultados

## Backend

* JWT
* Access Tokens
* Refresh Tokens
* Usuarios
* Historial de resultados por usuario
* Rutas protegidas

---

# Objetivo Final

Mantener únicamente:

* Generación de Quiz
* Resolución de Quiz
* Corrección
* Historial local
* Explicaciones
* Matemáticas con KaTeX

Eliminar:

* Login
* Register
* JWT
* Refresh Tokens
* Usuarios
* Middleware de autenticación

---

# FASE 1 - Frontend

## Eliminar páginas

```text
app/login
app/register
```

---

## Eliminar componentes

```text
components/auth
```

---

## Eliminar hooks

```text
hooks/useAuth.ts
hooks/useUser.ts
```

---

## Eliminar contexto

```text
contexts/AuthContext.tsx
```

---

## Eliminar almacenamiento

```text
localStorage.accessToken
localStorage.refreshToken
```

---

# FASE 2 - Middleware

Eliminar:

```text
middleware.ts
```

o remover:

```ts
protectedRoutes
```

---

# FASE 3 - Ruta Principal

Actualmente:

```text
/
↓
/login
```

Cambiar por:

```text
/
↓
/quiz
```

---

## app/page.tsx

Antes:

```tsx
redirect("/login")
```

Después:

```tsx
redirect("/quiz")
```

---

# FASE 4 - Navbar

Eliminar:

* Login
* Register
* Logout
* User Menu

Dejar:

* Quiz

---

# FASE 5 - Backend

Eliminar módulo:

```text
app/api/routes/auth.py
```

---

Eliminar:

```text
app/core/security.py
```

si únicamente contiene JWT.

---

Eliminar:

```text
create_access_token
create_refresh_token
decode_token
get_current_user
```

---

Eliminar:

```text
OAuth2PasswordBearer
```

---

# FASE 6 - Rutas Protegidas

Antes:

```python
Depends(get_current_user)
```

Después:

```python
# Sin autenticación
```

---

## Ejemplo

Antes:

```python
@router.get("/history")
async def history(
    current_user=Depends(get_current_user)
):
```

Después:

```python
@router.get("/history")
async def history():
```

---

# FASE 7 - Resultados

Actualmente:

```sql
quiz_results.user_id
```

Eliminar dependencia de usuario.

---

Opciones:

## Opción A

Eliminar columna

```sql
user_id
```

---

## Opción B (Recomendada)

Mantener nullable

```sql
user_id NULL
```

para futura expansión.

---

# FASE 8 - Historial

Guardar resultados sin usuario.

---

Antes:

```json
{
  "user_id": "..."
}
```

Después:

```json
{
  "topic": "python",
  "score": 90
}
```

---

# FASE 9 - Configuración

Eliminar variables:

```env
SECRET_KEY=
ACCESS_TOKEN_EXPIRE_MINUTES=
REFRESH_TOKEN_EXPIRE_DAYS=
```

---

# FASE 10 - Landing

Nueva Home:

```text
/
```

Mostrar:

* Hero
* Crear Quiz
* Categorías
* Comenzar

Botón principal:

```text
Start Quiz
```

---

# FASE 11 - Package.json

Instalar:

```bash
pnpm add -D concurrently
```

---

## Desarrollo

```json
{
  "scripts": {
    "dev": "concurrently \"pnpm frontend:dev\" \"pnpm backend:dev\"",
    "frontend:dev": "next dev",
    "backend:dev": "cd backend && uvicorn app.main:app --reload"
  }
}
```

---

## Producción Local

```json
{
  "scripts": {
    "start": "concurrently \"pnpm frontend:start\" \"pnpm backend:start\"",
    "frontend:start": "next start",
    "backend:start": "cd backend && uvicorn app.main:app"
  }
}
```

---

# FASE 12 - README

Actualizar README.

---

## Instalación

```bash
git clone ...
```

```bash
pnpm install
```

```bash
pnpm dev
```

---

## URLs

Frontend:

```text
http://localhost:3000
```

Backend:

```text
http://localhost:8000
```

---

# Resultado Final

El proyecto quedará reducido a:

* Generador de Quiz IA
* Quiz Teórico
* Quiz Práctico
* Quiz Mixto
* Corrección automática
* Historial
* Explicaciones matemáticas
* Next.js
* FastAPI

Sin:

* Login
* Registro
* JWT
* Usuarios
* Configuración compleja

Listo para GitHub y ejecución con:

```bash
pnpm install
pnpm dev
```
