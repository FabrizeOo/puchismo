'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaTimes } from 'react-icons/fa';

const navItems = [
  { label: 'Inicio', href: '/' },
  { label: 'Stream', href: '/stream' },
  { label: 'Rewards', href: '/rewards' },
  { label: 'Leaderboard', href: '/leaderboard' },
  { label: 'Discord', href: 'https://discord.gg/puchismo', external: true },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled || menuOpen
          ? 'bg-dark-950/95 backdrop-blur-xl border-b border-emerald-500/20 shadow-elevation-2'
          : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent'
      }`}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 sm:h-24 md:h-28">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <motion.div
              whileHover={{ scale: 1.08, rotate: -2 }}
              whileTap={{ scale: 0.95 }}
              className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden"
              style={{
                filter: 'drop-shadow(0 0 16px rgba(83,252,24,0.6))',
              }}
            >
              <Image
                src="/logo.png"
                alt="Logo"
                fill
                className="object-cover"
                priority
              />
            </motion.div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) =>
              item.external ? (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-sm font-semibold text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
                    pathname === item.href
                      ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.label === 'Rewards' ? `🎁 ${item.label}` : item.label}
                </Link>
              )
            )}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <motion.a
              href="/rewards"
              className="text-xs sm:text-sm py-2 px-4 rounded-xl font-bold transition-all"
              style={{
                background: 'rgba(83,252,24,0.1)',
                border: '1px solid rgba(83,252,24,0.3)',
                color: '#53fc18',
              }}
              whileHover={{
                scale: 1.05,
                background: 'rgba(83,252,24,0.2)',
                boxShadow: '0 0 20px rgba(83,252,24,0.4)',
              }}
              whileTap={{ scale: 0.95 }}
            >
              🎁 Rewards
            </motion.a>
            <motion.a
              href="https://kick.com/bepucho"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-kick text-xs sm:text-sm py-2 px-4"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🔴 Ver en Vivo
            </motion.a>
          </div>

          {/* Mobile burger */}
          <button
            className="md:hidden text-white p-2.5 rounded-xl bg-white/5 border border-white/10"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="md:hidden backdrop-blur-2xl border-b border-emerald-500/20"
            style={{
              background: 'rgba(3,11,4,0.98)',
            }}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-4 py-5 flex flex-col gap-2">
              {navItems.map((item) =>
                item.external ? (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-3 text-sm font-bold text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label} ↗
                  </a>
                ) : (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="px-4 py-3 rounded-xl font-bold text-sm transition-all"
                    style={
                      pathname === item.href
                        ? { color: '#53fc18', background: 'rgba(83,252,24,0.1)', border: '1px solid rgba(83,252,24,0.3)' }
                        : { color: '#d1d5db' }
                    }
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label === 'Rewards' ? `🎁 ${item.label}` : item.label}
                  </Link>
                )
              )}
              <div className="flex gap-3 pt-3 mt-2 border-t border-white/10">
                <a
                  href="https://kick.com/bepucho"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-kick flex-1 text-center text-xs py-3 rounded-xl font-bold"
                  onClick={() => setMenuOpen(false)}
                >
                  🔴 Stream en Kick
                </a>
                <a
                  href="https://discord.gg/puchismo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-discord flex-1 text-center text-xs py-3 rounded-xl font-bold"
                  onClick={() => setMenuOpen(false)}
                >
                  Discord Oficial
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
