'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaDiscord, FaTelegramPlane, FaTwitch, FaInstagram, FaTwitter, FaTiktok } from 'react-icons/fa';

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-gradient-to-t from-dark-950 to-transparent py-14">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Logo + descripción */}
          <div className="md:col-span-2">
            <Link href="/" data-track="footer-logo" className="flex items-center gap-3 mb-3">
              <div className="relative w-9 h-9 rounded-xl overflow-hidden ring-2 ring-electric/30">
                <Image src="/logo.webp" alt="Puchismo" fill className="object-cover" />
              </div>
              <span className="font-poppins font-black text-lg text-white">PUCHISMO</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              La comunidad futbolera de Bepucho. Accede al Discord para ver partidos de Champions League, Premier League, Liga Española, Liga Peruana, Libertadores y más en vivo.
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
                >
                  <Icon size={16} style={{ color }} />
                </a>
              ))}
            </div>
          </div>

          {/* Navegación */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Páginas</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Inicio', href: '/', track: 'footer-nav-inicio' },
                { label: 'Stream en Vivo', href: '/stream', track: 'footer-nav-stream' },
                { label: 'Recompensas', href: '/rewards', track: 'footer-nav-rewards' },
                { label: 'Leaderboard', href: '/leaderboard', track: 'footer-nav-leaderboard' },
                { label: 'Privacidad & Cookies', href: '/privacidad', track: 'footer-nav-privacidad' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} data-track={l.track} className="text-gray-400 hover:text-electric transition-colors text-sm">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Comunidad */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Comunidad</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Discord Oficial', href: 'https://discord.gg/3DtQkGhtrn', track: 'footer-community-discord' },
                { label: 'Canal Telegram', href: 'https://t.me/+jpyDeMxokzUzNDgx', track: 'footer-community-telegram' },
                { label: 'Kick.com/bepucho', href: 'https://kick.com/bepucho', track: 'footer-community-kick' },
                { label: 'Twitch.tv/bepucho', href: 'https://www.twitch.tv/bepucho', track: 'footer-community-twitch' },
              ].map((l) => (
                <li key={l.href}>
                  <a href={l.href} target="_blank" rel="noopener noreferrer" data-track={l.track} className="text-gray-400 hover:text-electric transition-colors text-sm">
                    {l.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-sm">
            © 2026 Puchismo — Hecho con ❤️ para la comunidad de Bepucho
          </p>
          <div className="flex items-center gap-4 text-gray-600 text-xs">
            <Link href="/privacidad" data-track="footer-bottom-privacidad" className="hover:text-electric transition-colors">
              Política de Privacidad
            </Link>
            <span>·</span>
            <span>
              Datos deportivos por{' '}
              <a href="https://www.football-data.org/" target="_blank" rel="noopener noreferrer" data-track="footer-football-data" className="hover:text-electric transition-colors">
                football-data.org
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
