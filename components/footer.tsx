'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaDiscord, FaTwitch, FaInstagram, FaTwitter, FaTiktok } from 'react-icons/fa';

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-gradient-to-t from-dark-950 to-transparent py-14">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Logo + descripción */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-3">
              <div className="relative w-9 h-9 rounded-xl overflow-hidden ring-2 ring-electric/30">
                <Image src="/logo.png" alt="Puchismo" fill className="object-cover" />
              </div>
              <span className="font-poppins font-black text-lg text-white">PUCHISMO</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              La comunidad futbolera de Bepucho. Accede al Discord para ver partidos de Champions League, Premier League, Liga Española, Liga Peruana, Libertadores y más en vivo.
            </p>
            <div className="flex gap-3 mt-4">
              {[
                { icon: FaDiscord, href: 'https://discord.gg/puchismo', color: '#5865f2' },
                { icon: FaTwitch, href: 'https://www.twitch.tv/bepucho', color: '#9146ff' },
                { icon: FaTiktok, href: 'https://www.tiktok.com/@bepucho', color: '#fff' },
                { icon: FaTwitter, href: 'https://x.com/bePucho', color: '#1d9bf0' },
                { icon: FaInstagram, href: 'https://www.instagram.com/bepucho/', color: '#e1306c' },
              ].map(({ icon: Icon, href, color }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
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
                { label: 'Inicio', href: '/' },
                { label: 'Stream en Vivo', href: '/stream' },
                { label: 'Recompensas', href: '/rewards' },
                { label: 'Leaderboard', href: '/leaderboard' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-gray-400 hover:text-electric transition-colors text-sm">
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
                { label: 'Discord Oficial', href: 'https://discord.gg/puchismo' },
                { label: 'Kick.com/bepucho', href: 'https://kick.com/bepucho' },
                { label: 'Twitch.tv/bepucho', href: 'https://www.twitch.tv/bepucho' },
              ].map((l) => (
                <li key={l.href}>
                  <a href={l.href} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-electric transition-colors text-sm">
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
          <p className="text-gray-600 text-xs">
            Datos deportivos por{' '}
            <a href="https://www.football-data.org/" target="_blank" rel="noopener noreferrer" className="hover:text-electric transition-colors">
              football-data.org
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
