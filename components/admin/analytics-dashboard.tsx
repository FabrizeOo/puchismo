'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTelegramPlane, FaDownload, FaSyncAlt, FaTrashAlt, FaMobileAlt, FaDesktop, FaTabletAlt, FaGlobeAmericas, FaArrowUp, FaArrowDown } from 'react-icons/fa';

interface TimelinePoint {
  label: string;
  views: number;
  visitors: number;
  clicks: number;
}

interface ButtonStat {
  buttonName: string;
  clicks: number;
  uniqueUsers: number;
  conversionRate: number;
  isTelegram: boolean;
}

interface PageStat {
  path: string;
  views: number;
  percentage: number;
}

interface SourceStat {
  source: string;
  views: number;
  percentage: number;
}

interface DeviceStat {
  device: string;
  count: number;
  percentage: number;
}

interface BrowserStat {
  browser: string;
  count: number;
  percentage: number;
}

interface CountryStat {
  country: string;
  count: number;
  percentage: number;
}

interface PeakHourStat {
  hour: number;
  hourLabel: string;
  views: number;
  percentage: number;
}

interface AnalyticsData {
  summary: {
    viewsToday: number;
    viewsTodayChange: number;
    visitorsToday: number;
    visitorsTodayChange: number;
    viewsLast7Days: number;
    viewsLast30Days: number;
    clicksToday: number;
    clicksTodayChange: number;
  };
  realtime: {
    activeUsersNow: number;
    pages: { path: string; count: number }[];
  };
  timeline: TimelinePoint[];
  buttons: ButtonStat[];
  topPages: PageStat[];
  trafficSources: SourceStat[];
  devices: DeviceStat[];
  browsers: BrowserStat[];
  countries: CountryStat[];
  peakHours: PeakHourStat[];
  rangeInfo: {
    range: string;
    startDate: string;
    endDate: string;
    totalPeriodViews: number;
    totalPeriodVisitors: number;
    totalPeriodClicks: number;
  };
}

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<'today' | 'yesterday' | '7d' | '30d' | 'custom'>('7d');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [buttonSort, setButtonSort] = useState<'clicks' | 'conversion'>('clicks');
  const [buttonFilter, setButtonFilter] = useState('');
  const [hoveredTimelineIndex, setHoveredTimelineIndex] = useState<number | null>(null);
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      let url = `/api/admin/analytics?range=${range}`;
      if (range === 'custom' && customStart) {
        url += `&startDate=${encodeURIComponent(customStart)}`;
        if (customEnd) url += `&endDate=${encodeURIComponent(customEnd)}`;
      }

      const res = await fetch(url, { cache: 'no-store' });
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      }
    } catch (err) {
      console.error('Error cargando analíticas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [range]);

  // Actualizar automáticamente tiempo real cada 30 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      if (range === 'today' || range === '7d') {
        fetchAnalytics();
      }
    }, 30000);
    return () => clearInterval(timer);
  }, [range]);

  const handleApplyCustomRange = (e: React.FormEvent) => {
    e.preventDefault();
    if (customStart) {
      fetchAnalytics();
    }
  };

  const handlePruneOld = async () => {
    if (!confirm('¿Deseas purgar los eventos crudos de más de 90 días para optimizar la base de datos? Los resúmenes diarios se mantendrán intactos.')) {
      return;
    }

    setMaintenanceLoading(true);
    try {
      const res = await fetch('/api/admin/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'prune', days: 90 }),
      });
      const resJson = await res.json();
      if (res.ok && resJson.success) {
        setToastMessage(resJson.message);
        fetchAnalytics();
      } else {
        setToastMessage(resJson.error || 'Error en depuración');
      }
    } catch {
      setToastMessage('Error de conexión en depuración');
    } finally {
      setMaintenanceLoading(false);
      setTimeout(() => setToastMessage(null), 5000);
    }
  };

  const handleExportCSV = () => {
    if (!data) return;

    let csvContent = 'data:text/csv;charset=utf-8,';

    // 1. Resumen
    csvContent += 'RESUMEN GENERAL\r\n';
    csvContent += `Rango,${data.rangeInfo.range}\r\n`;
    csvContent += `Fecha Inicio,${data.rangeInfo.startDate}\r\n`;
    csvContent += `Fecha Fin,${data.rangeInfo.endDate}\r\n`;
    csvContent += `Total Visitas Periodo,${data.rangeInfo.totalPeriodViews}\r\n`;
    csvContent += `Total Visitantes Unicos Periodo,${data.rangeInfo.totalPeriodVisitors}\r\n`;
    csvContent += `Total Clics Periodo,${data.rangeInfo.totalPeriodClicks}\r\n\r\n`;

    // 2. Línea de tiempo
    csvContent += 'LINEA DE TIEMPO\r\n';
    csvContent += 'Periodo/Fecha,Visitas,Visitantes Unicos,Clics\r\n';
    data.timeline.forEach((t) => {
      csvContent += `"${t.label}",${t.views},${t.visitors},${t.clicks}\r\n`;
    });
    csvContent += '\r\n';

    // 3. Clics por Botón
    csvContent += 'CLICS POR BOTON Y CONVERSION\r\n';
    csvContent += 'Boton,Clics Totales,Usuarios Unicos,Tasa de Conversion (%)\r\n';
    data.buttons.forEach((b) => {
      csvContent += `"${b.buttonName}",${b.clicks},${b.uniqueUsers},${b.conversionRate}%\r\n`;
    });
    csvContent += '\r\n';

    // 4. Páginas más vistas
    csvContent += 'PAGINAS MAS VISITADAS\r\n';
    csvContent += 'Ruta,Visitas,Porcentaje (%)\r\n';
    data.topPages.forEach((p) => {
      csvContent += `"${p.path}",${p.views},${p.percentage}%\r\n`;
    });
    csvContent += '\r\n';

    // 5. Fuentes de tráfico
    csvContent += 'FUENTES DE TRAFICO\r\n';
    csvContent += 'Fuente,Visitas,Porcentaje (%)\r\n';
    data.trafficSources.forEach((s) => {
      csvContent += `"${s.source}",${s.views},${s.percentage}%\r\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `puchismo_analiticas_${data.rangeInfo.range}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtrado y orden de botones
  const filteredButtons = (data?.buttons || [])
    .filter((b) => b.buttonName.toLowerCase().includes(buttonFilter.toLowerCase()))
    .sort((a, b) => {
      if (buttonSort === 'conversion') {
        return b.conversionRate - a.conversionRate;
      }
      return b.clicks - a.clicks;
    });

  // Cálculo para el gráfico SVG
  const maxTimelineViews = Math.max(1, ...(data?.timeline.map((t) => Math.max(t.views, t.visitors)) || [1]));
  const maxHourlyViews = Math.max(1, ...(data?.peakHours.map((h) => h.views) || [1]));

  return (
    <div className="space-y-8">
      {/* Toast de Notificación */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 rounded-2xl bg-emerald-950 border border-emerald-500 text-emerald-300 font-bold text-xs flex items-center justify-between shadow-2xl"
          >
            <span>{toastMessage}</span>
            <button onClick={() => setToastMessage(null)} className="text-gray-400 hover:text-white ml-4">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Barra Superior de Control y Filtros */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 rounded-3xl bg-neutral-900/90 border border-white/10 shadow-xl">
        {/* Rango Selector */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-black/60 border border-white/5">
          {(
            [
              { id: 'today', label: 'Hoy' },
              { id: 'yesterday', label: 'Ayer' },
              { id: '7d', label: 'Últimos 7 días' },
              { id: '30d', label: 'Últimos 30 días' },
              { id: 'custom', label: 'Personalizado' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => setRange(item.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                range === item.id
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Acciones: Actualizar, Exportar CSV, Purgar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
            title="Refrescar datos"
          >
            <FaSyncAlt className={loading ? 'animate-spin text-emerald-400' : ''} />
            <span>Actualizar</span>
          </button>

          <button
            onClick={handleExportCSV}
            disabled={!data || data.timeline.length === 0}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all flex items-center gap-2"
          >
            <FaDownload />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={handlePruneOld}
            disabled={maintenanceLoading}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-neutral-800/80 hover:bg-neutral-800 text-gray-400 hover:text-gray-300 border border-white/5 transition-all flex items-center gap-1.5"
            title="Depurar visitas crudas antiguas (>90 días)"
          >
            <FaTrashAlt size={11} />
            <span className="hidden sm:inline">Limpiar &gt;90d</span>
          </button>
        </div>
      </div>

      {/* Rango Personalizado Form */}
      {range === 'custom' && (
        <form onSubmit={handleApplyCustomRange} className="p-4 rounded-2xl bg-neutral-900/60 border border-white/10 flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Desde:</span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              required
              className="px-3 py-1.5 rounded-xl bg-black/80 border border-white/10 text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Hasta:</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-black/80 border border-white/10 text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-emerald-500 text-black font-bold hover:bg-emerald-400 transition-all"
          >
            Consultar Rango
          </button>
        </form>
      )}

      {/* ── 1. TARJETAS DE RESUMEN SUPERIOR ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {/* Visitas Hoy */}
        <div className="p-5 rounded-3xl bg-neutral-900/90 border border-white/10 relative overflow-hidden group">
          <span className="text-gray-400 text-xs block font-semibold mb-1">Visitas Hoy</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white">{data?.summary.viewsToday ?? 0}</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] font-bold">
            {(data?.summary.viewsTodayChange ?? 0) >= 0 ? (
              <span className="text-emerald-400 flex items-center gap-0.5">
                <FaArrowUp size={9} /> +{data?.summary.viewsTodayChange}%
              </span>
            ) : (
              <span className="text-red-400 flex items-center gap-0.5">
                <FaArrowDown size={9} /> {data?.summary.viewsTodayChange}%
              </span>
            )}
            <span className="text-gray-500">vs ayer</span>
          </div>
        </div>

        {/* Visitantes Únicos Hoy */}
        <div className="p-5 rounded-3xl bg-neutral-900/90 border border-emerald-500/20 relative overflow-hidden group">
          <span className="text-emerald-400 text-xs block font-semibold mb-1">Visitantes Únicos</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-400">{data?.summary.visitorsToday ?? 0}</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] font-bold">
            {(data?.summary.visitorsTodayChange ?? 0) >= 0 ? (
              <span className="text-emerald-400 flex items-center gap-0.5">
                <FaArrowUp size={9} /> +{data?.summary.visitorsTodayChange}%
              </span>
            ) : (
              <span className="text-red-400 flex items-center gap-0.5">
                <FaArrowDown size={9} /> {data?.summary.visitorsTodayChange}%
              </span>
            )}
            <span className="text-gray-500">vs ayer</span>
          </div>
        </div>

        {/* Clics Hoy */}
        <div className="p-5 rounded-3xl bg-neutral-900/90 border border-amber-500/20 relative overflow-hidden group">
          <span className="text-amber-400 text-xs block font-semibold mb-1">Total Clics Hoy</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-400">{data?.summary.clicksToday ?? 0}</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] font-bold">
            {(data?.summary.clicksTodayChange ?? 0) >= 0 ? (
              <span className="text-emerald-400 flex items-center gap-0.5">
                <FaArrowUp size={9} /> +{data?.summary.clicksTodayChange}%
              </span>
            ) : (
              <span className="text-red-400 flex items-center gap-0.5">
                <FaArrowDown size={9} /> {data?.summary.clicksTodayChange}%
              </span>
            )}
            <span className="text-gray-500">vs ayer</span>
          </div>
        </div>

        {/* Visitas 7 Días */}
        <div className="p-5 rounded-3xl bg-neutral-900/90 border border-white/10 relative overflow-hidden">
          <span className="text-gray-400 text-xs block font-semibold mb-1">Últimos 7 Días</span>
          <span className="text-2xl sm:text-3xl font-black text-white">{data?.summary.viewsLast7Days ?? 0}</span>
          <span className="text-gray-500 text-[10px] block mt-2">Visitas acumuladas</span>
        </div>

        {/* Visitas 30 Días */}
        <div className="p-5 rounded-3xl bg-neutral-900/90 border border-white/10 relative overflow-hidden">
          <span className="text-gray-400 text-xs block font-semibold mb-1">Últimos 30 Días</span>
          <span className="text-2xl sm:text-3xl font-black text-white">{data?.summary.viewsLast30Days ?? 0}</span>
          <span className="text-gray-500 text-[10px] block mt-2">Visitas mensuales</span>
        </div>

        {/* Tiempo Real Card */}
        <div className="p-5 rounded-3xl bg-emerald-950/40 border border-emerald-500/40 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-1">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">En Tiempo Real</span>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-white">{data?.realtime.activeUsersNow ?? 0}</span>
          <span className="text-emerald-400/80 text-[10px] block mt-1 font-semibold">
            Activos en los últimos 5 min
          </span>
        </div>
      </div>

      {/* Páginas en Tiempo Real (si hay usuarios activos) */}
      {data && data.realtime.pages.length > 0 && (
        <div className="p-4 rounded-2xl bg-black/40 border border-emerald-500/20 flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-400 font-semibold mr-2">Navegando ahora:</span>
          {data.realtime.pages.map((p) => (
            <span key={p.path} className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5">
              <span>{p.path}</span>
              <span className="px-1.5 py-0.2 rounded-md bg-emerald-500 text-black text-[10px]">{p.count}</span>
            </span>
          ))}
        </div>
      )}

      {/* ── 2. GRÁFICO INTERACTIVO DE VISITAS EN EL TIEMPO ── */}
      <div className="p-6 rounded-3xl bg-neutral-900/90 border border-white/10 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white">Evolución de Tráfico y Visitas</h2>
            <p className="text-xs text-gray-400">
              Desglose {range === 'today' || range === 'yesterday' ? 'por hora del día' : 'diario'} de visitas totales y visitantes únicos.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(83,252,24,0.6)]" />
              <span className="text-gray-300">Visitas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.6)]" />
              <span className="text-gray-300">Visitantes Únicos</span>
            </div>
          </div>
        </div>

        {/* Contenedor del gráfico de barras SVG adaptable */}
        <div className="relative pt-6 pb-2">
          {loading ? (
            <div className="h-64 flex items-center justify-center text-gray-500 text-xs">Cargando gráfico...</div>
          ) : !data || data.timeline.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-500 text-xs">No hay datos en este rango</div>
          ) : (
            <div className="h-64 flex items-end gap-1.5 sm:gap-2 px-2 border-b border-white/10 relative">
              {data.timeline.map((point, index) => {
                const heightViews = Math.max(4, Math.round((point.views / maxTimelineViews) * 100));
                const heightVisitors = Math.max(2, Math.round((point.visitors / maxTimelineViews) * 100));
                const isHovered = hoveredTimelineIndex === index;

                return (
                  <div
                    key={point.label}
                    className="flex-1 h-full flex flex-col justify-end items-center relative group cursor-pointer"
                    onMouseEnter={() => setHoveredTimelineIndex(index)}
                    onMouseLeave={() => setHoveredTimelineIndex(null)}
                  >
                    {/* Tooltip flotante */}
                    {isHovered && (
                      <div className="absolute bottom-full mb-3 z-30 p-2.5 rounded-xl bg-neutral-950 border border-emerald-500/40 text-xs shadow-2xl min-w-[140px] pointer-events-none transform -translate-x-1/2 left-1/2">
                        <span className="font-bold text-white block mb-1 text-center border-b border-white/10 pb-1 font-mono">
                          {point.label}
                        </span>
                        <div className="flex justify-between items-center text-emerald-400 font-bold">
                          <span>Visitas:</span>
                          <span>{point.views}</span>
                        </div>
                        <div className="flex justify-between items-center text-sky-400 font-bold">
                          <span>Únicos:</span>
                          <span>{point.visitors}</span>
                        </div>
                        <div className="flex justify-between items-center text-amber-400 font-bold">
                          <span>Clics:</span>
                          <span>{point.clicks}</span>
                        </div>
                      </div>
                    )}

                    {/* Barras gemelas */}
                    <div className="w-full max-w-[28px] flex items-end justify-center gap-0.5 sm:gap-1 h-full">
                      <motion.div
                        className={`w-1/2 rounded-t-md transition-all ${
                          isHovered ? 'bg-emerald-300 shadow-[0_0_12px_rgba(83,252,24,0.8)]' : 'bg-emerald-500/80 hover:bg-emerald-400'
                        }`}
                        style={{ height: `${heightViews}%` }}
                        initial={{ height: 0 }}
                        animate={{ height: `${heightViews}%` }}
                        transition={{ duration: 0.4 }}
                      />
                      <motion.div
                        className={`w-1/2 rounded-t-md transition-all ${
                          isHovered ? 'bg-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.8)]' : 'bg-sky-500/80 hover:bg-sky-400'
                        }`}
                        style={{ height: `${heightVisitors}%` }}
                        initial={{ height: 0 }}
                        animate={{ height: `${heightVisitors}%` }}
                        transition={{ duration: 0.4, delay: 0.05 }}
                      />
                    </div>

                    {/* Etiqueta Eje X */}
                    <span className="text-[9px] sm:text-[10px] text-gray-500 mt-2 truncate max-w-full font-mono">
                      {point.label.includes('-') ? point.label.split('-').slice(1).join('/') : point.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── 3. TABLA DE CLICS POR BOTÓN & CONVERSIÓN (DESTACANDO TELEGRAM) ── */}
      <div className="p-6 rounded-3xl bg-neutral-900/90 border border-white/10 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🎯</span>
              <h2 className="text-lg sm:text-xl font-black text-white">Rendimiento de Clics por Botón (CTAs)</h2>
            </div>
            <p className="text-xs text-gray-400">
              Métricas de clics, usuarios únicos y tasa de conversión sobre los visitantes totales ({data?.rangeInfo.totalPeriodVisitors || 0}).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Filtrar botón..."
              value={buttonFilter}
              onChange={(e) => setButtonFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={() => setButtonSort(buttonSort === 'clicks' ? 'conversion' : 'clicks')}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/5 border border-white/10 text-gray-300 hover:text-white"
            >
              Ordenar: {buttonSort === 'clicks' ? 'Más Clics' : 'Mayor Conversión'}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/60 text-gray-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Botón / CTA (data-track)</th>
                <th className="py-3 px-4 text-center">Tipo</th>
                <th className="py-3 px-4 text-right">Clics Totales</th>
                <th className="py-3 px-4 text-right">Usuarios Únicos</th>
                <th className="py-3 px-4 text-right">Tasa Conversión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredButtons.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500 text-xs">
                    No se han registrado clics con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredButtons.map((btn) => (
                  <tr
                    key={btn.buttonName}
                    className={`transition-colors ${
                      btn.isTelegram
                        ? 'bg-sky-950/30 hover:bg-sky-950/50'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-xs">
                      <div className="flex items-center gap-2">
                        {btn.isTelegram && (
                          <span className="p-1 rounded-md bg-sky-500/20 text-sky-400">
                            <FaTelegramPlane size={14} />
                          </span>
                        )}
                        <span className={btn.isTelegram ? 'text-sky-300 font-black' : 'text-white'}>
                          {btn.buttonName}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center">
                      {btn.isTelegram ? (
                        <span className="px-2 py-0.5 rounded-full bg-sky-500/20 border border-sky-500/40 text-sky-300 text-[10px] font-black uppercase">
                          ⭐ Telegram
                        </span>
                      ) : btn.buttonName.includes('discord') ? (
                        <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-[10px] font-black uppercase">
                          Discord
                        </span>
                      ) : btn.buttonName.includes('kick') ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-black uppercase">
                          Kick Live
                        </span>
                      ) : (
                        <span className="text-gray-500 text-[10px] uppercase">General</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                      {btn.clicks.toLocaleString()}
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-gray-300">
                      {btn.uniqueUsers.toLocaleString()}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-neutral-800 rounded-full overflow-hidden hidden sm:block">
                          <div
                            className={`h-full rounded-full ${
                              btn.isTelegram ? 'bg-sky-400' : 'bg-emerald-400'
                            }`}
                            style={{ width: `${Math.min(100, btn.conversionRate)}%` }}
                          />
                        </div>
                        <span className="font-mono font-black text-xs text-white">
                          {btn.conversionRate}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 4 y 5. PÁGINAS MÁS VISTAS & FUENTES DE TRÁFICO ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Páginas Más Visitadas */}
        <div className="p-6 rounded-3xl bg-neutral-900/90 border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-black text-white">📄 Páginas Más Visitadas</h2>
            <span className="text-xs text-gray-500 font-mono">Top {data?.topPages.length || 0}</span>
          </div>

          <div className="space-y-3">
            {!data || data.topPages.length === 0 ? (
              <p className="text-xs text-gray-500 py-6 text-center">Sin visitas registradas.</p>
            ) : (
              data.topPages.map((page) => (
                <div key={page.path} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono font-bold text-gray-200 truncate max-w-[220px] sm:max-w-[320px]">
                      {page.path}
                    </span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {page.views} <span className="text-gray-500 font-normal">({page.percentage}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${page.percentage}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Fuentes de Tráfico */}
        <div className="p-6 rounded-3xl bg-neutral-900/90 border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-black text-white">🌐 Fuentes de Tráfico</h2>
            <span className="text-xs text-gray-500 font-mono">Referrers</span>
          </div>

          <div className="space-y-3">
            {!data || data.trafficSources.length === 0 ? (
              <p className="text-xs text-gray-500 py-6 text-center">Sin fuentes registradas.</p>
            ) : (
              data.trafficSources.map((source) => (
                <div key={source.source} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-gray-200 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-sky-400" />
                      {source.source}
                    </span>
                    <span className="font-mono text-sky-400 font-bold">
                      {source.views} <span className="text-gray-500 font-normal">({source.percentage}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-500 rounded-full"
                      style={{ width: `${source.percentage}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── 6. DISPOSITIVOS, NAVEGADORES Y PAÍSES ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Dispositivos */}
        <div className="p-6 rounded-3xl bg-neutral-900/90 border border-white/10 shadow-xl space-y-4">
          <h2 className="text-base font-black text-white">📱 Dispositivos</h2>
          <div className="space-y-3">
            {data?.devices.map((d) => (
              <div key={d.device} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-gray-300 flex items-center gap-2">
                    {d.device === 'Móvil' ? <FaMobileAlt className="text-emerald-400" /> : d.device === 'Tablet' ? <FaTabletAlt className="text-sky-400" /> : <FaDesktop className="text-amber-400" />}
                    {d.device}
                  </span>
                  <span className="font-mono font-bold text-white">{d.count} ({d.percentage}%)</span>
                </div>
                <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${d.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navegadores */}
        <div className="p-6 rounded-3xl bg-neutral-900/90 border border-white/10 shadow-xl space-y-4">
          <h2 className="text-base font-black text-white">🧭 Navegadores</h2>
          <div className="space-y-3">
            {data?.browsers.map((b) => (
              <div key={b.browser} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-gray-300">{b.browser}</span>
                  <span className="font-mono font-bold text-white">{b.count} ({b.percentage}%)</span>
                </div>
                <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-400 rounded-full" style={{ width: `${b.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Países */}
        <div className="p-6 rounded-3xl bg-neutral-900/90 border border-white/10 shadow-xl space-y-4">
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <FaGlobeAmericas className="text-emerald-400" />
            <span>Países (Aprox.)</span>
          </h2>
          <div className="space-y-3">
            {data?.countries.map((c) => (
              <div key={c.country} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-gray-300 uppercase font-mono">{c.country}</span>
                  <span className="font-mono font-bold text-white">{c.count} ({c.percentage}%)</span>
                </div>
                <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${c.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 7. HORAS PICO (DISTRIBUCIÓN 24 HORAS PARA HORARIOS DE PARTIDOS) ── */}
      <div className="p-6 rounded-3xl bg-neutral-900/90 border border-white/10 shadow-xl space-y-4">
        <div>
          <h2 className="text-lg font-black text-white">⏰ Horas Pico de Audiencia (00:00 a 23:00)</h2>
          <p className="text-xs text-gray-400">
            Distribución horaria del tráfico en el periodo seleccionado para identificar los picos durante partidos y streams.
          </p>
        </div>

        <div className="h-40 flex items-end gap-1 sm:gap-2 pt-6 border-b border-white/10">
          {data?.peakHours.map((h) => {
            const barHeight = Math.max(3, Math.round((h.views / maxHourlyViews) * 100));
            const isHigh = h.views > 0 && h.views === maxHourlyViews;

            return (
              <div key={h.hour} className="flex-1 h-full flex flex-col justify-end items-center group relative cursor-pointer">
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 hidden group-hover:block z-20 p-2 rounded-lg bg-black border border-emerald-500/40 text-[10px] text-center font-mono pointer-events-none whitespace-nowrap shadow-xl">
                  <span className="text-gray-400 block">{h.hourLabel}</span>
                  <span className="text-emerald-400 font-bold">{h.views} visitas</span>
                </div>

                <div
                  className={`w-full rounded-t-sm transition-all ${
                    isHigh
                      ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]'
                      : h.views > 0
                      ? 'bg-emerald-500/80 hover:bg-emerald-400'
                      : 'bg-neutral-800'
                  }`}
                  style={{ height: `${barHeight}%` }}
                />

                <span className="text-[8px] sm:text-[9px] text-gray-500 mt-2 font-mono">
                  {h.hour % 2 === 0 ? h.hour : ''}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
