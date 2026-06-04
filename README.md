# 🧠 Quiz IA

Plataforma open-source de generación de quizzes impulsada por inteligencia artificial local. Crea evaluaciones personalizadas, resuélvelas y obtén feedback instantáneo con explicaciones detalladas.

Sin registro. Sin contraseñas. Sin configuración compleja.

---

## ✨ Características

- **Generación de Quiz** — Teórico, práctico o mixto con IA local (Ollama)
- **Soporte de archivos** — Sube PDF, DOCX o MD y genera quizzes desde tu contenido
- **Exámenes cronometrados** — Simulacros con límite de tiempo configurable
- **Corrección automática** — Feedback instantáneo con explicaciones matemáticas (KaTeX)
- **Historial local** — Guarda tu progreso directamente en la base de datos
- **Leaderboard** — Ranking global de resultados

## 🚀 Inicio Rápido

### Requisitos previos

- [Node.js 18+](https://nodejs.org/) con [pnpm](https://pnpm.io/)
- [Python 3.12+](https://python.org/)
- [Ollama](https://ollama.com/) corriendo localmente con un modelo

### 1. Clonar el repositorio

```bash
git clone https://github.com/Makofig/quiz-ai.git
cd quiz-ai
```

### 2. Configurar Ollama (requerido)

Instala Ollama desde [ollama.com](https://ollama.com) y descarga un modelo de ejemplo:

```bash
ollama pull mistral:7b
```

Otros modelos compatibles:
| Modelo | Comando |
|---------|---------|
| Mistral 7B | `ollama pull mistral:7b` |
| Gemma | `ollama pull gemma4:e4b` |
| Qwen 35B | `ollama pull qwen3.6:35b` |

### 3. Configurar Base de Datos

Se requiere PostgreSQL. Actualiza las credenciales en los archivos `.env` que están en cada carpeta:

```ini
DATABASE_URL=postgresql+asyncpg://USER:PASSWORD@HOST:5432/DB_NAME
```

### 4. Instalar dependencias

```bash
# Frontend
cd frontend
pnpm install
cd ..

# Backend
cd backend
pip install -r requirements.txt
cd ..
```

### 5. Iniciar

```bash
# Opción A: Desde el frontend con concurrently
cd frontend
pnpm install
cd ..
pnpm dev

# Opción B: Por separado (dos terminales)
# Terminal 1 — Frontend
cd frontend
pnpm dev

# Terminal 2 — Backend
cd backend
uvicorn app.main:app --reload
```

### URLs

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000/api |
| Documentación (Swagger) | http://localhost:8000/api/docs |

---

## 📁 Estructura del Proyecto

```
quiz-ai/
├── frontend/                # Next.js 16 + React 19
│   ├── src/
│   │   ├── app/             # Rutas de la aplicación
│   │   ├── components/      # Componentes reutilizables
│   │   ├── hooks/           # Custom hooks
│   │   ├── lib/             # Utilidades y config
│   │   ├── services/        # Servicios de UI
│   │   ├── store/           # Estado global (Zustand)
│   │   └── types/           # Tipos TypeScript
│   ├── package.json
│   └── .env.example
├── backend/                 # FastAPI
│   ├── app/
│   │   ├── api/routes/      # Endpoints REST
│   │   ├── core/            # Config y DB
│   │   ├── models/          # Modelos SQLAlchemy
│   │   ├── schemas/         # Pydantic schemas
│   │   └── services/        # Servicios (Ollama, file parser)
│   ├── pyproject.toml
│   ├── requirements.txt
│   └── .env.example
├── .env.example             # Variables de entorno del root
└── README.md
```

---

## ⚙️ Configuración

### Variables de Entorno

#### Backend (backend/.env)

```ini
DATABASE_URL=postgresql+asyncpg://USER:PASS@HOST:5432/quiz_db
DEBUG=False
OLLAMA_BASE_URL=http://localhost:11434
CORS_ORIGINS=http://localhost:3000
```

#### Frontend (frontend/.env.local)

```ini
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

---

## 🧪 Scripts

### Frontend

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Inicia desarrollo (Next.js Turbopack) |
| `pnpm build` | Build de producción |
| `pnpm start` | Inicia servidor de producción |
| `pnpm lint` | ESLint check |

### Backend

| Comanda | Descripción |
|---------|-------------|
| `uvicorn app.main:app --reload` | Inicia FastAPI con hot-reload |
| `alembic upgrade head` | Aplica migraciones DB |

### Root

| Comanda | Descripción |
|---------|-------------|
| `pnpm dev` | Inicia frontend y backend simultáneamente |

---

## 🏗️ Arquitectura

### Frontend (Next.js App Router)

- **Generación** — `/` — Formulario para crear quizzes con IA
- **Resolución** — `/quiz/[id]` — Interfaz para responder preguntas
- **Resultados** — `/quiz/results` — Estadísticas y feedback
- **Historial** — `/quiz/history` — Resultados previos
- **Exámenes** — `/exams/create` y `/exams/[id]` — Exámenes cronometrados
- **Leaderboard** — `/leaderboard` — Ranking global

### Backend (FastAPI)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/quiz/generate` | POST | Genera quiz con IA |
| `/api/quiz/models` | GET | Lista modelos disponibles |
| `/api/results/grade` | POST | Califica respuestas |
| `/api/results/history` | GET | Historial de resultados |
| `/api/exams/create` | POST | Crea examen cronometrado |
| `/api/exams/[id]/submit` | POST | Envía y califica examen |
| `/api/files/upload` | POST | Sube archivos (PDF, DOCX) |
| `/leaderboard` | GET | Ranking de usuarios |

---

## 🔧 Tecnologías

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 16, React 19, TypeScript, TailwindCSS 4 |
| Backend | FastAPI, Python 3.12+, SQLAlchemy async |
| Base de datos | PostgreSQL (asyncpg) |
| IA | Ollama (Mistral, Gemma, Qwen) |
| Estado | Zustand (Zustand store) |
| Reactividad | TanStack Query |
| Renderizado | KaTeX (matemáticas) |
| Build | pnpm, Turbopack |

---

## 📝 Licencia

MIT. Libre para uso personal, educativo y comercial.

---

## 🤝 Contribuir

Las contribuciones son bienvenidas. Para reportar issues o sugerir mejoras, abre un [Issue en GitHub](https://github.com/Makofig/quiz-ai/issues).

---

## 💡 Nota

Esta plataforma funciona completamente en entornos locales. No se envía ningún dato a servicios externos. La única conexión es con tu instancia local de Ollama para generar los quizzes.
