# ⚽ MUNDIAL STREAMER 2026 - PLATAFORMA PROFESIONAL

> Plataforma moderna, segura y escalable para transmitir el Mundial de Fútbol 2026 en vivo

## 🎯 Descripción General

Este proyecto es una **solución integral lista para producción** que te permite:

✅ Transmitir partidos del Mundial en vivo  
✅ Mostrar tabla de grupos en tiempo real  
✅ Ver resultados actualizados automáticamente  
✅ Chat interactivo con la comunidad  
✅ Llaves eliminatorias animadas  
✅ Horarios adaptados a la zona horaria del usuario  
✅ Integración con múltiples plataformas (Twitch, YouTube, Kick, Facebook)  
✅ Diseño moderno con animaciones impactantes  

---

## 📦 Archivos Incluidos

### 📋 Documentación
| Archivo | Descripción |
|---------|-----------|
| `README.md` | Este archivo - Guía principal del proyecto |
| `PROJECT_STRUCTURE.md` | Arquitectura completa del proyecto |
| `QUICK_START.md` | Guía de inicio rápido (5 minutos) |
| `API_INTEGRATION.md` | Integración con APIs de fútbol |

### ⚙️ Configuración
| Archivo | Descripción |
|---------|-----------|
| `next.config.js` | Configuración de Next.js con seguridad |
| `tailwind.config.js` | Tema Tailwind con colores personalizados |
| `tsconfig.json` | Configuración de TypeScript estricta |
| `package.json` | Todas las dependencias necesarias |

### 💻 Componentes React
| Archivo | Descripción |
|---------|-----------|
| `main-components.tsx` | Navbar, Hero, Redes Sociales, Footer |
| `mundial-components.tsx` | Tablas de grupos, resultados, llaves |
| `stream-section.tsx` | Player de stream y chat integrado |
| `page-app.tsx` | Página principal ensamblada |

### 🔧 Utilidades y Librerías
| Archivo | Descripción |
|---------|-----------|
| `security-utils.ts` | Validación, sanitización, JWT |
| `timezone-utils.ts` | Conversión de horarios a zona local |
| `types-entities.ts` | Tipos TypeScript completos |

---

## 🚀 Inicio Rápido

### 1️⃣ Clonar y instalar (1 minuto)
```bash
git clone <url-del-repo>
cd mundial-streamer
npm install
```

### 2️⃣ Configurar variables de entorno (1 minuto)
```bash
cp .env.example .env.local
```

Editar `.env.local` con tus APIs:
```env
FOOTBALL_DATA_API_KEY=tu_api_key_aqui
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3️⃣ Ejecutar en desarrollo (1 minuto)
```bash
npm run dev
```

Abrir en navegador: **http://localhost:3000**

¡Listo! ✅

---

## 🎨 Diseño y Características

### Visual
- 🌙 **Modo oscuro** por defecto (respaldado por datos de diseño)
- ✨ **Glassmorphism** - Efecto vidrio moderno
- 🎬 **Animaciones fluidas** con Framer Motion
- 📱 **100% Responsive** - Móvil, tablet, desktop
- 🎨 **Paleta profesional** - Azul eléctrico, morado, dorado

### Funcionalidad
- 🔴 **Stream en vivo** - Twitch, YouTube, Kick, Facebook
- 💬 **Chat interactivo** - WebSockets en tiempo real
- 📊 **Tabla de grupos** - Datos en vivo
- ⚡ **Resultados en vivo** - Actualización cada 30 segundos
- 🏆 **Llaves eliminatorias** - Visualización profesional
- 🕐 **Horarios locales** - Detecta zona horaria del usuario

### Seguridad
- 🔐 **Helmet.js** - Protección HTTP headers
- 🛡️ **Rate Limiting** - Protección contra ataques
- ✅ **Validación Zod** - Validación de entrada
- 🚫 **Sanitización XSS** - Escapado de HTML
- 🔑 **JWT seguros** - HttpOnly cookies
- 🤐 **API Keys protegidas** - Nunca en el cliente

---

## 🛠️ Stack Tecnológico

### Frontend
```
Next.js 14          - Framework React moderno
React 18            - Librería UI
TypeScript          - Tipado estricto
TailwindCSS         - Estilos atómicos
Framer Motion       - Animaciones
Zod                 - Validación de esquemas
```

### Backend
```
Express.js          - Servidor web
PostgreSQL          - Base de datos
Redis               - Caché
Socket.io           - WebSockets
JWT                 - Autenticación
```

### APIs
```
Football-Data.org   - Datos de partidos
API-Football        - Estadísticas
Sportmonks          - Eventos en vivo
TheSportsDB         - Logos y escudos
```

---

## 📊 Estructura de Datos

### Grupo
```typescript
{
  id: "A",
  name: "Grupo A",
  teams: [
    {
      name: "Argentina",
      flag: "🇦🇷",
      points: 9,
      playedGames: 3,
      won: 3,
      ...
    },
    ...
  ]
}
```

### Partido
```typescript
{
  id: "1",
  homeTeam: { name: "Argentina", flag: "🇦🇷" },
  awayTeam: { name: "Perú", flag: "🇵🇪" },
  score: { home: 2, away: 0 },
  status: "FINISHED",
  time: "2026-06-15T15:00:00Z",
  ...
}
```

---

## 🔌 Integración de APIs

### Football-Data.org (Gratis)
```bash
# 1. Registrarse en https://www.football-data.org
# 2. Copiar API Key
# 3. Agregar a .env.local
```

**Endpoints disponibles:**
- GET `/competitions` - Listar competiciones
- GET `/standings` - Tabla de posiciones
- GET `/matches` - Partidos
- GET `/teams/{id}` - Equipos

### Uso en código
```typescript
import { getStandings } from '@/lib/api/football-data';

const standings = await getStandings('WC');
```

---

## 🕐 Sistema de Horarios

Convertir automáticamente horarios UTC a zona local:

```typescript
import { formatMatchTime, convertToLocalTimezone } from '@/timezone-utils';

// Hora del partido (UTC)
const utcTime = "2026-06-15T15:00:00Z";

// Convertir a hora local del usuario
const localTime = formatMatchTime(utcTime);
// Resultado: "Hoy a las 15:30"
```

**Características:**
- ✅ Detecta zona horaria automáticamente
- ✅ Formatos en español
- ✅ Personalizable por usuario
- ✅ Cache en localStorage

---

## 💬 Chat en Tiempo Real

### WebSocket Events
```typescript
// Cliente envía mensaje
socket.emit('message:send', {
  content: "¡Qué gol!",
  userId: "user-123"
});

// Servidor recibe y broadcast
socket.on('message:new', (message) => {
  // Actualizar chat
});
```

### Almacenamiento
```
- Mensajes en tiempo real: Socket.io
- Persistencia: PostgreSQL
- Cache: Redis
```

---

## 📱 Responsivo

| Dispositivo | Tamaño | Breakpoint |
|----------|--------|-----------|
| Móvil | < 768px | `sm:` |
| Tablet | 768-1024px | `md:`, `lg:` |
| Desktop | > 1024px | `xl:` |

Todos los componentes están optimizados para cada tamaño.

---

## 🔒 Seguridad

### Checklist de Seguridad
- [x] HTTPS obligatorio en producción
- [x] API Keys en variables de entorno
- [x] CORS configurado
- [x] Rate limiting activo
- [x] Validación de entrada (Zod)
- [x] Sanitización HTML/XSS
- [x] JWT con expiración
- [x] Cookies HttpOnly
- [x] CSP headers
- [x] HELMET.js configurado

### Ningún dato sensible expuesto
```javascript
// ❌ MAL
const API_KEY = 'abc123'; // En el código

// ✅ BIEN
const API_KEY = process.env.API_KEY; // En .env.local
```

---

## 🚀 Deployment

### Vercel (Recomendado)
```bash
npm i -g vercel
vercel login
vercel --prod
```

**Ventajas:**
- ✅ Deploy automático desde GitHub
- ✅ HTTPS gratis
- ✅ Global CDN
- ✅ Sin configuración

### Cloudflare Pages
```bash
npm install -g wrangler
wrangler login
npm run build
wrangler pages deploy out
```

### Docker
```bash
docker build -t mundial .
docker run -p 3000:3000 mundial
```

---

## 📈 Rendimiento

### Target
- Carga inicial: < 2 segundos
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

### Optimizaciones
- ✅ Image optimization
- ✅ Code splitting
- ✅ Lazy loading
- ✅ CSS minification
- ✅ Gzip compression
- ✅ Caché inteligente (5 min)

---

## 🎓 Personalización

### Cambiar colores
Editar `tailwind.config.js`:
```javascript
colors: {
  electric: '#00d4ff',    // Primario
  purple: '#8b5cf6',      // Secundario
  gold: '#fbbf24',        // Acento
}
```

### Cambiar tipografía
Editar `app/layout.tsx`:
```typescript
import { YourFont } from 'next/font/google';
const font = YourFont({ ... });
```

### Cambiar logo/favicon
Reemplazar archivos en `public/`:
- `favicon.ico`
- `logo.png`

---

## 📊 Monitoreo

### Error Tracking
- Sentry
- LogRocket

### Performance
- Google Analytics
- New Relic
- DataDog

### Uptime
- UptimeRobot
- Pingdom

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo licencia MIT. Ver `LICENSE` para más detalles.

---

## 💬 Soporte

- **Discord:** [Tu servidor Discord]
- **Twitter:** [@tutwitter]
- **Email:** support@mundial-streamer.com
- **GitHub Issues:** [Tu repositorio]

---

## 🙏 Agradecimientos

Gracias a:
- Football-Data.org por los datos
- Vercel por el hosting
- La comunidad de React y Next.js
- Todos los que contribuyen

---

## 🎯 Próximos Pasos

1. ✅ Clonar y ejecutar localmente
2. ✅ Configurar APIs
3. ✅ Personalizar colores y branding
4. ✅ Agregar stream de Twitch/YouTube
5. ✅ Conectar base de datos
6. ✅ Implementar autenticación
7. ✅ Hacer deploy a producción
8. ✅ Monitorear y escalar

---

## 📚 Recursos Útiles

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion/)
- [Football-Data API](https://www.football-data.org/documentation/api)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Best Practices](https://react.dev)

---

## ⭐ Si te fue útil, ¡no olvides dar una estrella!

```
     ⚽
    (•_•)
   /__█__\
   [MUNDIAL]
```

**¡Que disfrutes la construcción!** 🚀🎮

---

**Última actualización:** Junio 2026  
**Versión:** 1.0.0  
**Estado:** Listo para Producción ✅
