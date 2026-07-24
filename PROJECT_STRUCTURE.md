# 🌍 MUNDIAL STREAMER - Arquitectura del Proyecto

## 📁 Estructura Completa del Proyecto

```
mundo-streamer/
├── app/
│   ├── page.tsx                 # Página principal (Hero)
│   ├── layout.tsx               # Layout raíz
│   ├── globals.css              # Estilos globales
│   └── api/
│       ├── sports/
│       │   ├── groups/          # GET /api/sports/groups
│       │   ├── matches/         # GET /api/sports/matches
│       │   ├── standings/       # GET /api/sports/standings
│       │   └── brackets/        # GET /api/sports/brackets
│       ├── chat/
│       │   ├── messages/        # WebSocket de chat
│       │   └── auth/            # Validación de tokens
│       ├── auth/
│       │   ├── login/           # Autenticación JWT
│       │   └── validate/        # Validar tokens
│       └── middleware.ts        # CORS, Rate Limiting, etc.
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx           # Navbar fijo
│   │   ├── Footer.tsx           # Footer completo
│   │   └── FloatingButton.tsx   # Botón flotante "Volver arriba"
│   │
│   ├── sections/
│   │   ├── HeroSection.tsx      # Hero impresionante
│   │   ├── RootsSection.tsx     # Redes sociales
│   │   ├── StreamSection.tsx    # Stream en vivo + Chat
│   │   ├── MundialSection.tsx   # Tabla de grupos + Resultados
│   │   ├── MatchCard.tsx        # Card de partido individual
│   │   ├── BracketsSection.tsx  # Llaves eliminatorias
│   │   └── DiscordSection.tsx   # Sección de Discord
│   │
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Spinner.tsx
│   │   └── Toast.tsx
│   │
│   └── 3d/
│       ├── AnimatedBg.tsx       # Fondo animado con partículas
│       └── ParticlesFootball.tsx # Partículas de fútbol
│
├── hooks/
│   ├── useMatches.ts            # Hook para obtener partidos
│   ├── useGroupStandings.ts     # Hook para tabla de grupos
│   ├── useChat.ts               # Hook para chat en tiempo real
│   ├── useTimezone.ts           # Hook para zona horaria del usuario
│   └── useApi.ts                # Hook personalizado para fetch
│
├── lib/
│   ├── api/
│   │   ├── football-data.ts     # Cliente de Football-Data API
│   │   ├── api-football.ts      # Cliente de API-Football
│   │   └── cache.ts             # Sistema de caché
│   │
│   ├── security/
│   │   ├── jwt.ts               # Generación y validación de JWT
│   │   ├── validators.ts        # Validación de inputs
│   │   ├── sanitizer.ts         # Sanitización de datos
│   │   └── helmet.ts            # Configuración de Helmet
│   │
│   ├── utils/
│   │   ├── timezone.ts          # Conversión de horarios
│   │   ├── formatters.ts        # Formateo de datos
│   │   └── constants.ts         # Constantes del proyecto
│   │
│   └── db/
│       ├── connection.ts        # Conexión a BD
│       └── migrations/          # Migraciones SQL
│
├── types/
│   ├── api.ts                   # Tipos de API
│   ├── entities.ts              # Tipos de entidades
│   └── events.ts                # Tipos de eventos de chat
│
├── public/
│   ├── logos/                   # Logos de equipos (flag cdn)
│   ├── icons/                   # Iconos SVG
│   └── assets/                  # Assets estáticos
│
├── styles/
│   ├── globals.css              # Estilos globales
│   ├── animations.css           # Animaciones
│   └── themes.css               # Temas oscuro/claro
│
├── .env.example                 # Variables de entorno (ejemplo)
├── .env.local                   # Variables de entorno (no subir a git)
├── next.config.js               # Configuración de Next.js
├── tailwind.config.js           # Configuración de Tailwind
├── tsconfig.json                # Configuración de TypeScript
├── package.json                 # Dependencias
└── docker-compose.yml           # Docker para BD

```

---

## 🔑 Variables de Entorno (.env.local)

```env
# API Keys (NUNCA exponer al cliente)
FOOTBALL_DATA_API_KEY=tu_api_key_aqui
API_FOOTBALL_KEY=tu_api_key_aqui
SPORTMONKS_API_KEY=tu_api_key_aqui

# Base de datos
DATABASE_URL=postgresql://user:password@localhost:5432/mundial_streamer
REDIS_URL=redis://localhost:6379

# Autenticación
JWT_SECRET=tu_jwt_secret_super_seguro_y_largo
JWT_EXPIRATION=7d

# URLs
NEXT_PUBLIC_APP_URL=https://tudominio.com
TWITCH_EMBED_ID=tu_twitch_channel_id
KICK_EMBED_ID=tu_kick_channel_id
YOUTUBE_CHANNEL_ID=tu_youtube_channel_id

# Discord
DISCORD_SERVER_ID=tu_discord_server_id
DISCORD_INVITE_URL=https://discord.gg/tuinvite

# Redes sociales
TWITTER_URL=https://twitter.com/tutwitter
INSTAGRAM_URL=https://instagram.com/tuinstagram
YOUTUBE_URL=https://youtube.com/tuchannel
TWITCH_URL=https://twitch.tv/tutwitch

# Seguridad
NEXT_PUBLIC_RECAPTCHA_KEY=tu_recaptcha_key
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 📦 Dependencias Principales

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.3.0",
    "framer-motion": "^10.16.0",
    "next-themes": "^0.2.1",
    "@radix-ui/react-dialog": "^1.1.1",
    "socket.io-client": "^4.7.0",
    "axios": "^1.5.0",
    "zod": "^3.22.0",
    "jwt-decode": "^3.1.2",
    "date-fns": "^2.30.0",
    "react-icons": "^4.12.0",
    "react-hot-toast": "^2.4.1",
    "zustand": "^4.4.0",
    "tsparticles": "^2.12.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0"
  }
}
```

---

## 🔐 Seguridad Implementada

- ✅ **Helmet.js** - Protección de headers HTTP
- ✅ **CORS configurado** - Solo dominios autorizados
- ✅ **Rate Limiting** - Protección contra ataques de fuerza bruta
- ✅ **CSRF Protection** - Tokens CSRF en formularios
- ✅ **XSS Protection** - Sanitización de inputs
- ✅ **SQL Injection Prevention** - Queries parametrizadas (Prisma)
- ✅ **JWT Seguros** - HttpOnly Cookies
- ✅ **Content Security Policy** - Restricción de recursos
- ✅ **Validación de entrada** - Zod schemas
- ✅ **Nunca exponer API Keys** - Todo en servidor

---

## 🚀 Fases de Desarrollo

### Fase 1: Estructura Base ✅
- Setup de Next.js + TypeScript
- Configuración de TailwindCSS + Framer Motion
- Sistema de autenticación JWT
- Componentes base (Navbar, Footer)

### Fase 2: Integración de APIs ✅
- Integración con Football-Data API
- Sistema de caché inteligente
- Hooks para obtener datos en tiempo real

### Fase 3: Componentes Principales ✅
- Hero Section
- Sección de Redes Sociales
- Stream en vivo (Twitch/Kick/YouTube)
- Tabla de grupos del Mundial 2026

### Fase 4: Chat en Tiempo Real ✅
- WebSocket con Socket.io
- Chat integrado en sección de stream
- Mensajes persistentes en BD

### Fase 5: Llaves Eliminatorias ✅
- Visualización tipo "araña" profesional
- Actualización automática de resultados
- Animaciones de líneas conectoras

### Fase 6: Optimización y Deployment 🔄
- Lazy loading y code splitting
- Optimización de imágenes
- PWA
- Deployment en Vercel/Cloudflare

---

## 📊 APIs Utilizadas

| API | Uso | Alternativa |
|-----|-----|-----------|
| **Football-Data.org** | Datos de partidos, grupos, resultados | API-Football |
| **API-Football** | Estadísticas en vivo | Sportmonks |
| **Sportmonks** | Eventos en tiempo real | TheSportsDB |
| **TheSportsDB** | Logos y escudos de equipos | Flag CDN |

---

## 🌍 Datos del Mundial 2026

### Equipos por Grupo (Confirmado)

**Grupo A:** Argentina, Perú, Canadá, Chile  
**Grupo B:** Brasil, Uruguay, Paraguay, Colombia  
**Grupo C:** México, Guatemala, El Salvador, Honduras  
**Grupo D:** Francia, Alemania, Escocia, Finlandia  
**Grupo E:** España, Italia, Holanda, Croacia  
**Grupo F:** Bélgica, Portugal, Hungría, Serbia  
**Grupo G:** Inglaterra, Polonia, Czechia, Dinamarca  
**Grupo H:** Austria, Japón, Corea del Sur, Australia  

*Los grupos exactos se definirán en diciembre 2024 en el sorteo oficial*

---

## 📱 Responsive Design

- **Mobile:** < 768px
- **Tablet:** 768px - 1024px
- **Desktop:** > 1024px

Todos los componentes son 100% responsive con Tailwind CSS.

---

## ⚡ Rendimiento Target

- **Carga inicial:** < 2 segundos
- **Interaction to Paint:** < 100ms
- **Largest Contentful Paint:** < 2.5s
- **Core Web Vitals:** Todos GREEN

---

## 🎨 Diseño Visual

**Paleta de Colores:**
- Fondo: #0f1419 (Negro profundo)
- Primario: #00d4ff (Azul eléctrico)
- Secundario: #8b5cf6 (Morado)
- Acento: #fbbf24 (Dorado)
- Texto: #ffffff

**Tipografía:**
- Display: Poppins (Bold)
- Body: Inter (Regular)
- Mono: Manrope (Code)

**Efectos:**
- Glassmorphism (fondo con blur)
- Gradientes fluidos
- Sombras elegantes
- Animaciones suaves
- Scroll parallax
- Microinteracciones

---

## 📡 WebSockets (Socket.io)

**Eventos del Chat:**
```
- user:join → Usuario entra al chat
- message:send → Nuevo mensaje
- message:edit → Editar mensaje
- message:delete → Eliminar mensaje
- typing:start → Usuario escribiendo
- typing:stop → Usuario dejó de escribir
- user:leave → Usuario sale del chat
```

---

## 🔄 Actualización de Datos

- **Grupos/Tablas:** Cada 5 minutos
- **Partidos en vivo:** Cada 30 segundos
- **Chat:** Tiempo real (WebSocket)
- **Redes sociales:** Cada hora (cache)

---

Este proyecto está diseñado para ser:
✅ Profesional y escalable
✅ Seguro a nivel empresarial
✅ Performante y optimizado
✅ Moderno y visualmente impactante
✅ Listo para producción inmediata
