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
  { label: 'Discord', href: 'https://discord.gg/puchismo', external: true },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.nav
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-dark-950/95 backdrop-blur-xl border-b shadow-elevation-2'
          : 'bg-transparent'
      }`}
      style={scrolled ? { borderBottomColor: 'rgba(83,252,24,0.15)' } : {}}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-32">
          {/* Logo — solo imagen, sin texto */}
          <Link href="/" className="flex items-center group">
            <motion.div
              whileHover={{ scale: 1.08, rotate: -2 }}
              whileTap={{ scale: 0.95 }}
              className="relative w-28 h-28 rounded-2xl overflow-hidden"
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
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) =>
              item.external ? (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nav-link"
                >
                  {item.label}
                </a>
              ) : item.label === 'Rewards' ? (
                <Link key={item.label} href={item.href} className="nav-link">
                  <span
                    className={`flex items-center gap-1 ${pathname === item.href ? 'neon-text-sm font-bold' : ''}`}
                  >
                    <span className="text-xs">🎁</span>
                    {item.label}
                  </span>
                </Link>
              ) : (
                <Link key={item.label} href={item.href} className="nav-link">
                  <span style={pathname === item.href ? { color: '#53fc18' } : {}}>
                    {item.label}
                  </span>
                </Link>
              )
            )}
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex items-center gap-3">
            <motion.a
              href="/rewards"
              className="text-sm py-2 px-4 rounded-xl font-bold transition-all"
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
              className="btn-kick text-sm py-2 px-4"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🔴 Ver en Vivo
            </motion.a>
          </div>

          {/* Mobile burger */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="md:hidden backdrop-blur-xl border-t"
            style={{
              background: 'rgba(3,11,4,0.97)',
              borderTopColor: 'rgba(83,252,24,0.15)',
            }}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-4 py-4 flex flex-col gap-2">
              {navItems.map((item) =>
                item.external ? (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="px-4 py-3 rounded-lg transition-all"
                    style={
                      pathname === item.href
                        ? { color: '#53fc18', background: 'rgba(83,252,24,0.1)' }
                        : { color: '#9ca3af' }
                    }
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label === 'Rewards' ? `🎁 ${item.label}` : item.label}
                  </Link>
                )
              )}
              <div className="flex gap-3 pt-2">
                <a href="https://kick.com/bepucho" target="_blank" rel="noopener noreferrer" className="btn-kick flex-1 text-center text-sm py-2">
                  🔴 Kick
                </a>
                <a href="https://discord.gg/puchismo" target="_blank" rel="noopener noreferrer" className="btn-discord flex-1 text-center text-sm py-2">
                  Discord
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
