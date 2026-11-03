'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaDiscord, FaTelegramPlane, FaTwitch, FaInstagram, FaTwitter, FaTiktok } from 'react-icons/fa';

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-gradient-to-t from-dark-950 to-transparent py-14">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
          {/* Logo + descripción */}
          <div className="sm:col-span-2 lg:col-span-2">
            <Link href="/" data-track="footer-logo" className="flex items-center gap-3 mb-3">
              <div className="relative w-9 h-9 rounded-xl overflow-hidden ring-2 ring-electric/30">
                <Image src="/logo.webp" alt="Puchismo" fill className="object-cover" />
              </div>
              <span className="font-poppins font-black text-lg text-white">PUCHISMO</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              La comunidad futbolera de Bepucho. Únete a nuestro Discord y streams en Kick para comentar partidos, compartir pronósticos, ganar puntos y vivir el fútbol en comunidad.
            </p>
            <div className="flex gap-3 mt-4">
              {[
                { icon: FaDiscord, href: 'https://discord.gg/3DtQkGhtrn', color: '#5865f2', track: 'footer-social-discord' },
                { icon: FaTelegramPlane, href: 'https://t.me/+jpyDeMxokzUzNDgx', color: '#229ed9', track: 'footer-social-telegram' },
                { icon: FaTwitch, href: 'https://www.twitch.tv/bepucho', color: '#9146ff', track: 'footer-social-twitch' },
                { icon: FaTiktok, href: 'https://www.tiktok.com/@bepucho', color: '#fff', track: 'footer-social-tiktok' },
                { icon: FaTwitter, href: 'https://x.com/bePucho', color: '#1d9bf0', track: 'footer-social-twitter' },
                { icon: FaInstagram, href: 'https://www.instagram.com/bepucho/', color: '#e1306c', track: 'footer-social-instagram' },
              ].map(({ icon: Icon, href, color, track }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-track={track}
                  className="w-9 h-9 rounded-lg glass-card flex items-center justify-center hover:scale-110 transition-all"
                  aria-label={track}
                >
                  <Icon size={16} style={{ color }} />
                </a>
              ))}
            </div>
          </div>

          {/* Fútbol & Dinámicas */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Fútbol & Agenda</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Partidos de Hoy', href: '/partidos/hoy' },
                { label: 'Partidos de Mañana', href: '/partidos/manana' },
                { label: 'Quiniela (Prode)', href: '/quiniela' },
                { label: 'Tabla Champions League', href: '/tabla/champions-league' },
                { label: 'Tabla Premier League', href: '/tabla/premier-league' },
                { label: 'Tabla LaLiga EA Sports', href: '/tabla/la-liga' },
                { label: 'Stream en Vivo', href: '/stream' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Recompensas */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Comunidad</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Tienda de Recompensas', href: '/rewards' },
                { label: 'Leaderboard de Puntos', href: '/leaderboard' },
                { label: 'Promo Bet365 (+50 Pts)', href: '/bet365' },
                { label: 'Reglas de Recompensas', href: '/reglas-recompensas' },
                { label: 'Discord Oficial', href: 'https://discord.gg/3DtQkGhtrn', external: true },
                { label: 'Canal de Telegram', href: 'https://t.me/+jpyDeMxokzUzNDgx', external: true },
              ].map((l) => (
                <li key={l.label}>
                  {l.external ? (
                    <a href={l.href} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">
                      {l.label}
                    </a>
                  ) : (
                    <Link href={l.href} className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">
                      {l.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Legal y Confianza */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Legal & Confianza</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Términos y Condiciones', href: '/terminos' },
                { label: 'Política de Privacidad', href: '/privacidad' },
                { label: 'Juego Responsable (+18)', href: '/juego-responsable' },
                { label: 'Declaración de Afiliados', href: '/afiliados' },
                { label: 'Contacto y Soporte', href: '/contacto' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-gray-500 text-xs text-center md:text-left space-y-1">
            <p>© 2026 Puchismo — Comunidad futbolera de Bepucho. Todos los derechos reservados.</p>
            <p className="text-[11px] text-gray-600">
              Aviso legal: Puchismo es una plataforma comunitaria y de entretenimiento deportivo. No retransmite partidos de fútbol ni opera juegos de azar.
            </p>
          </div>
          <div className="flex items-center gap-4 text-gray-500 text-xs">
            <Link href="/privacidad" className="hover:text-emerald-400 transition-colors">
              Privacidad
            </Link>
            <span>·</span>
            <Link href="/terminos" className="hover:text-emerald-400 transition-colors">
              Términos
            </Link>
            <span>·</span>
            <span>
              Datos provistos por{' '}
              <a href="https://www.football-data.org/" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors underline">
                football-data.org
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
