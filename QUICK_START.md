# 🚀 GUÍA DE INICIO RÁPIDO - MUNDIAL STREAMER 2026

## ⚡ Primeros Pasos (5 minutos)

### 1. Clonar y instalar
```bash
git clone https://github.com/tuusuario/mundial-streamer.git
cd mundial-streamer
npm install
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env.local
```

Editar `.env.local`:
```env
# APIs
FOOTBALL_DATA_API_KEY=tu_api_key_aqui
API_FOOTBALL_KEY=tu_api_key_aqui

# Autenticación
JWT_SECRET=generar_una_cadena_larga_y_aleatoria_aqui

# URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
TWITCH_EMBED_ID=tu_twitch_channel_id
YOUTUBE_CHANNEL_ID=tu_youtube_channel_id

# Discord
DISCORD_INVITE_URL=https://discord.gg/tuinvite

# Redes sociales
TWITTER_URL=https://twitter.com/tutwitter
INSTAGRAM_URL=https://instagram.com/tuinstagram
```

### 3. Ejecutar en desarrollo
```bash
npm run dev
```

Abrir en navegador: `http://localhost:3000`

---

## 📡 APIs Necesarias (Obtener Gratis)

### Football-Data.org
1. Ir a https://www.football-data.org/client/register
2. Registrarse con email
3. Copiar API Key desde el dashboard
4. Pegar en `.env.local`

**Límites gratis:**
- 10 requests/minuto
- 50,000 requests/mes

### (Opcional) API-Football
1. Ir a https://rapidapi.com/api-sports/api/api-football
2. Hacer clic en "Subscribe Free"
3. Copiar API Key
4. Usar en solicitudes

---

## 🏗️ Estructura de Carpetas Creadas

```
proyecto/
├── app/                          # Next.js app router
│   ├── page.tsx                  # Página principal
│   ├── layout.tsx                # Layout global
│   └── api/                      # API routes
│       └── sports/
│           ├── standings/
│           ├── matches/
│           └── groups/
├── components/                   # Componentes React
│   ├── main-components.tsx       # Navbar, Hero, Footer
│   └── mundial-components.tsx    # Tablas, resultados, llaves
├── hooks/                        # Custom hooks
│   ├── useGroupStandings.ts
│   ├── useMatches.ts
│   └── useTimezone.ts
├── lib/                          # Funciones compartidas
│   ├── api/                      # Clientes de API
│   ├── security/                 # Seguridad
│   └── timezone-utils.ts         # Conversión de horarios
├── types/                        # TypeScript types
├── styles/                       # CSS global
├── .env.local                    # Variables de entorno
├── next.config.js                # Config de Next.js
├── tailwind.config.js            # Config de Tailwind
└── package.json                  # Dependencias
```

---

## 🎨 Personalización

### Cambiar Colores Principales

Editar `tailwind.config.js`:

```javascript
colors: {
  electric: '#00d4ff',      // Azul eléctrico primario
  purple: '#8b5cf6',        // Morado secundario
  gold: '#fbbf24',          // Dorado acento
  dark: {
    950: '#0f1419',         // Fondo principal
  },
}
```

### Cambiar Tipografía

Editar `app/layout.tsx`:

```typescript
import { Poppins, Inter, Manrope } from 'next/font/google';

const poppins = Poppins({ subsets: ['latin'], variable: '--font-poppins' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
```

### Cambiar Logo y Favicon

Reemplazar archivos en `public/`:
- `public/favicon.ico` - Favicon
- `public/logo.png` - Logo en navbar

---

## 🎯 Próximas Características a Implementar

### Phase 1 ✅ (Completado)
- [x] Estructura base
- [x] Componentes principales
- [x] Sistema de tipos
- [x] Utilidades de seguridad
- [x] Conversión de horarios

### Phase 2 (1-2 semanas)
- [ ] Integración con Football-Data API
- [ ] Chat en tiempo real con WebSockets
- [ ] Autenticación de usuarios (JWT)
- [ ] Base de datos (PostgreSQL)
- [ ] Caché inteligente

### Phase 3 (2-3 semanas)
- [ ] Panel de administrador
- [ ] Sistema de notificaciones
- [ ] Predicciones de partidos
- [ ] Estadísticas avanzadas
- [ ] Transmisión integrada de Twitch/YouTube

### Phase 4 (1 mes)
- [ ] PWA (Progressive Web App)
- [ ] App móvil nativa (React Native)
- [ ] Sistema de monetización
- [ ] Análisis de datos
- [ ] Machine Learning para predicciones

---

## 🧪 Testing

### Probar en desarrollo
```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend (si aplica)
npm run dev:server
```

### Build de producción
```bash
npm run build
npm start
```

### Validar tipos
```bash
npm run type-check
```

---

## 🔒 Seguridad: Checklist Pre-Deployment

- [ ] No hay API Keys en código
- [ ] `.env.local` está en `.gitignore`
- [ ] CORS configurado correctamente
- [ ] Rate limiting activo
- [ ] Validación de entrada implementada
- [ ] HTTPS habilitado
- [ ] Headers de seguridad configurados
- [ ] JWT con fecha de expiración
- [ ] Base de datos con contraseñas fuertes
- [ ] Logs de errores sin exposición de datos sensibles

---

## 📈 Deployment Recomendado

### Opción 1: Vercel (Recomendado)
```bash
npm i -g vercel
vercel login
vercel --prod
```

**Ventajas:**
- ✅ Deploy automático desde GitHub
- ✅ HTTPS gratis
- ✅ Global CDN
- ✅ Sin configuración necesaria

### Opción 2: Cloudflare Pages
```bash
npm install -g wrangler
wrangler login
wrangler pages deploy out
```

**Ventajas:**
- ✅ Muy rápido
- ✅ DDoS protection incluido
- ✅ Workers para backend

### Opción 3: Docker + VPS
```bash
docker build -t mundial-streamer .
docker run -p 3000:3000 mundial-streamer
```

**Ventajas:**
- ✅ Control total
- ✅ Escalable
- ✅ Económico

---

## 🐛 Troubleshooting

### Error: "API Key no válida"
```
Solución: Verificar que FOOTBALL_DATA_API_KEY esté en .env.local
```

### Error: "Rate limit exceeded"
```
Solución: Implementar caché o actualizar plan en Football-Data.org
```

### Error: "CORS error"
```
Solución: Verificar origen permitido en next.config.js
```

### Error: "Timezone no detectada"
```
Solución: Usar navegador con permisos de geolocalización
```

---

## 📚 Documentación Adicional

- **API Integration:** Ver `API_INTEGRATION.md`
- **Estructura del Proyecto:** Ver `PROJECT_STRUCTURE.md`
- **Seguridad:** Ver `SECURITY.md` (en construcción)
- **Deploy:** Ver `DEPLOYMENT.md` (en construcción)

---

## 🎓 Recursos de Aprendizaje

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion/)
- [Football-Data API](https://www.football-data.org/documentation/api)
- [TypeScript](https://www.typescriptlang.org/)

---

## 💬 Soporte y Comunidad

- Discord: [Tu servidor]
- Twitter: [@tutwitter]
- Email: support@mundial-streamer.com
- GitHub Issues: [Tu repositorio]

---

## 📊 Monitoreo Post-Deployment

Configurar alertas para:

```javascript
// Errores
- Tasa de error > 1%
- Tiempo de respuesta > 2s

// Rendimiento
- Largest Contentful Paint > 2.5s
- Cumulative Layout Shift > 0.1
- First Input Delay > 100ms

// Uptime
- Disponibilidad < 99.9%
```

Usar servicios como:
- Sentry (error tracking)
- New Relic (APM)
- DataDog (monitoreo)
- UptimeRobot (uptime)

---

## ✨ Felicidades!

Completaste la instalación. Ahora:

1. ✅ Realiza cambios en componentes
2. ✅ Integra tu API de fútbol
3. ✅ Agrega tu stream de Twitch/YouTube
4. ✅ Personaliza colores y tipografía
5. ✅ Configura tu servidor de Discord
6. ✅ Haz deploy a producción

¡Que disfrutes la construcción! ⚽🎮
