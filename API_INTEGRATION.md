# 🔗 GUÍA DE INTEGRACIÓN DE APIs - MUNDIAL 2026

## 📡 APIs Disponibles para Datos de Fútbol

### 1. **Football-Data.org** (RECOMENDADO)
**Sitio:** https://www.football-data.org/

**Ventajas:**
- ✅ API gratuita y de pago
- ✅ Datos en tiempo real
- ✅ Muy confiable
- ✅ Soporte 24/7

**Endpoints principales:**
```bash
# Obtener todas las competiciones
GET https://api.football-data.org/v4/competitions

# Obtener tabla de una competición
GET https://api.football-data.org/v4/competitions/{competitionId}/standings

# Obtener partidos
GET https://api.football-data.org/v4/competitions/{competitionId}/matches

# Obtener equipos
GET https://api.football-data.org/v4/teams/{teamId}
```

**Headers requeridos:**
```javascript
{
  'X-Auth-Token': 'YOUR_API_KEY_HERE'
}
```

---

### 2. **API-Football**
**Sitio:** https://rapidapi.com/api-sports/api/api-football

**Ventajas:**
- ✅ Muy detallado
- ✅ Estadísticas avanzadas
- ✅ Eventos en vivo
- ✅ Muchos mercados

**Ejemplo:**
```bash
GET https://api-football-v1.p.rapidapi.com/v3/fixtures?league=1&season=2026

Headers:
- x-rapidapi-key: YOUR_KEY
- x-rapidapi-host: api-football-v1.p.rapidapi.com
```

---

### 3. **Sportmonks**
**Sitio:** https://www.sportmonks.com/

**Ventajas:**
- ✅ Datos en tiempo real
- ✅ Eventos detallados
- ✅ Cobertura global
- ✅ WebSockets para streaming

---

### 4. **TheSportsDB**
**Sitio:** https://www.thesportsdb.com/api.php

**Ventajas:**
- ✅ Gratis
- ✅ Logos y escudos de equipos
- ✅ Información de jugadores
- ✅ Sin autenticación

```javascript
// Obtener equipo
GET https://www.thesportsdb.com/api/v1/json/3/eventslast.php?id=TEAM_ID

// Obtener logo
GET https://www.thesportsdb.com/images/media/team/badge/{team_id}.png
```

---

## 🚀 Implementación en Next.js

### Paso 1: Crear archivo de cliente API

```typescript
// lib/api/football-data.ts

import axios from 'axios';

const BASE_URL = 'https://api.football-data.org/v4';
const API_KEY = process.env.FOOTBALL_DATA_API_KEY;

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'X-Auth-Token': API_KEY,
  },
});

// Interceptor para errores
client.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data);
    throw error;
  }
);

export async function getCompetitions() {
  try {
    const { data } = await client.get('/competitions');
    return data.competitions;
  } catch (error) {
    console.error('Error fetching competitions:', error);
    throw error;
  }
}

export async function getStandings(competitionId: string) {
  try {
    const { data } = await client.get(`/competitions/${competitionId}/standings`);
    return data.standings;
  } catch (error) {
    console.error('Error fetching standings:', error);
    throw error;
  }
}

export async function getMatches(
  competitionId: string,
  filters?: {
    status?: 'SCHEDULED' | 'LIVE' | 'IN_PLAY' | 'PAUSED' | 'FINISHED';
    dateFrom?: string;
    dateTo?: string;
  }
) {
  try {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);

    const { data } = await client.get(
      `/competitions/${competitionId}/matches?${params.toString()}`
    );
    return data.matches;
  } catch (error) {
    console.error('Error fetching matches:', error);
    throw error;
  }
}

export async function getTeam(teamId: string) {
  try {
    const { data } = await client.get(`/teams/${teamId}`);
    return data;
  } catch (error) {
    console.error('Error fetching team:', error);
    throw error;
  }
}
```

---

### Paso 2: Crear API Route en Next.js

```typescript
// app/api/sports/standings/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getStandings } from '@/lib/api/football-data';
import { rateLimit } from '@/lib/security/rate-limit';

// Validar API Key del cliente (si es necesario)
const VALID_API_KEYS = ['your_secret_key'];

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const limited = !rateLimit(ip, 100, 15 * 60 * 1000);

    if (limited) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const competitionId = searchParams.get('competitionId') || 'WC';

    // Cachear respuesta
    const cacheKey = `standings-${competitionId}`;
    const cached = await getFromCache(cacheKey);

    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          'Cache-Control': 'public, max-age=300', // 5 minutos
          'X-Cache': 'HIT',
        },
      });
    }

    const data = await getStandings(competitionId);

    // Guardar en caché
    await saveToCache(cacheKey, data, 5 * 60); // 5 minutos

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=300',
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getFromCache(key: string) {
  // Implementar con Redis o Supabase
  // return await redis.get(key);
  return null;
}

async function saveToCache(key: string, data: any, ttl: number) {
  // Implementar con Redis o Supabase
  // return await redis.setex(key, ttl, JSON.stringify(data));
}
```

---

### Paso 3: Crear Hook de React

```typescript
// hooks/useGroupStandings.ts

import { useEffect, useState } from 'react';
import { GroupStandings } from '@/types/entities';

export function useGroupStandings(competitionId: string = 'WC') {
  const [standings, setStandings] = useState<GroupStandings[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchStandings() {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/sports/standings?competitionId=${competitionId}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setStandings(data.standings);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    }

    fetchStandings();

    // Refetch cada 5 minutos
    const interval = setInterval(fetchStandings, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [competitionId]);

  return { standings, loading, error };
}
```

---

### Paso 4: Usar en Componentes

```typescript
'use client';

import { useGroupStandings } from '@/hooks/useGroupStandings';

export function StandingsComponent() {
  const { standings, loading, error } = useGroupStandings();

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {standings?.map((group) => (
        <div key={group.group.id}>
          <h3>{group.group.name}</h3>
          {/* Renderizar tabla */}
        </div>
      ))}
    </div>
  );
}
```

---

## 🕐 Conversión de Horarios

La aplicación incluye un sistema automático de conversión de horarios basado en la zona horaria del navegador del usuario:

```typescript
// Uso en componentes
import { formatMatchTime, convertToLocalTimezone } from '@/timezone-utils';

const matchTime = '2026-06-15T15:00:00Z';
const localTime = formatMatchTime(matchTime); // "Hoy a las 15:30"
```

El sistema detecta automáticamente:
- ✅ La zona horaria del usuario
- ✅ Horarios locales vs UTC
- ✅ Formatos de fecha según idioma
- ✅ Próximos partidos personalizados

---

## 📊 Estructura de Datos del Mundo 2026

```json
{
  "competition": {
    "id": 2013,
    "name": "FIFA World Cup",
    "code": "WC",
    "emblem": "url",
    "plan": "TIER_FOUR"
  },
  "filters": {
    "season": 2026
  },
  "standings": [
    {
      "stage": "GROUP_STAGE",
      "type": "GROUP",
      "group": "Group A",
      "table": [
        {
          "position": 1,
          "team": {
            "id": 2072,
            "name": "Argentina",
            "shortName": "ARG",
            "crest": "url",
            "flag": "🇦🇷"
          },
          "playedGames": 3,
          "won": 3,
          "draws": 0,
          "lost": 0,
          "points": 9,
          "goalsFor": 7,
          "goalsAgainst": 1,
          "goalDifference": 6
        }
      ]
    }
  ]
}
```

---

## 🔐 Seguridad de API Keys

### ✅ HACER:
```javascript
// .env.local (NUNCA SUBIR A GIT)
FOOTBALL_DATA_API_KEY=your_key_here

// Usar desde servidor
const apiKey = process.env.FOOTBALL_DATA_API_KEY;
```

### ❌ NUNCA HACER:
```javascript
// ❌ NO exponer API Keys en el cliente
const API_KEY = 'your_key_here'; // PELIGROSO
fetch('https://api.football-data.org/v4/..', {
  headers: { 'X-Auth-Token': API_KEY }
})

// ❌ NO harcodear en código
const myKey = 'abc123xyz'; // INSEGURO
```

---

## 🔄 Sistema de Caché Inteligente

```typescript
// lib/api/cache.ts

interface CacheEntry {
  data: any;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

export function setCache(key: string, data: any, ttlSeconds: number) {
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

export function getCache(key: string) {
  const entry = cache.get(key);
  if (!entry) return null;
  
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  
  return entry.data;
}

// TTLs Recomendados:
// - Tabla de grupos: 5 minutos
// - Partidos en vivo: 30 segundos
// - Equipos: 1 hora
// - Redes sociales: 1 hora
```

---

## 🎯 Configuración del Servidor (Backend)

```javascript
// server.js (Express)

import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';

const app = express();

// Seguridad
app.use(helmet());

// CORS
app.use(cors({
  origin: ['https://tudominio.com', 'https://www.tudominio.com'],
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 requests por ventana
  message: 'Demasiadas solicitudes, intenta más tarde',
});

app.use('/api/', limiter);

// Rutas
app.get('/api/sports/standings', async (req, res) => {
  // Implementación
});

app.listen(3001, () => {
  console.log('Servidor escuchando en puerto 3001');
});
```

---

## 📋 Checklist de Configuración

- [ ] Registrarse en Football-Data.org y obtener API Key
- [ ] Crear archivo `.env.local` con las variables
- [ ] Configurar CORS en el servidor
- [ ] Implementar caché inteligente
- [ ] Configurar rate limiting
- [ ] Probar endpoints de API
- [ ] Validar conversión de horarios
- [ ] Configurar WebSockets para chat
- [ ] Implementar notificaciones de goles
- [ ] Hacer test de seguridad

---

## 🚀 Deployment

Ver archivo `DEPLOYMENT.md` para instrucciones completas de:
- Vercel
- Cloudflare
- Docker
- VPS personalizado
