// components/main-components.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaTwitch,
  FaYoutube,
  FaInstagram,
  FaTwitter,
  FaDiscord,
  FaArrowUp,
  FaUsers,
  FaTiktok,
  FaFacebook,
  FaKickstarter,
} from 'react-icons/fa';

/* ============================================
   ANIMACIONES
   ============================================ */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: 'easeOut' },
  },
};

const floatVariants = {
  float: {
    y: [0, -20, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

const glowVariants = {
  initial: { boxShadow: '0 0 20px rgba(0, 212, 255, 0.5)' },
  animate: {
    boxShadow: [
      '0 0 20px rgba(0, 212, 255, 0.5)',
      '0 0 40px rgba(0, 212, 255, 0.8)',
      '0 0 20px rgba(0, 212, 255, 0.5)',
    ],
    transition: { duration: 2, repeat: Infinity },
  },
};

/* ============================================
   NAVBAR
   ============================================ */

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Inicio', href: '#inicio' },
    { label: 'Redes', href: '#redes' },
    { label: 'Stream', href: '#stream' },
    { label: 'Mundial', href: '#mundial' },
    { label: 'Llaves', href: '#llaves' },
    { label: 'Discord', href: '#discord' },
  ];

  return (
    <motion.nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-dark-950/95 backdrop-blur-xl border-b border-white/10 shadow-elevation-2'
          : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-electric flex items-center justify-center">
              <span className="text-white font-bold text-lg">⚽</span>
            </div>
            <span className="hidden sm:inline font-poppins font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-electric to-cyan-400">
              MUNDIAL STREAMER
            </span>
          </motion.div>

          {/* Menu Items */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <motion.a
                key={item.label}
                href={item.href}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                whileHover={{ color: '#00d4ff' }}
              >
                {item.label}
              </motion.a>
            ))}
          </div>

          {/* Action Button */}
          <motion.button
            className="px-6 py-2 rounded-lg bg-gradient-electric text-white font-semibold text-sm hover:shadow-glow-electric transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Discord
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
}

/* ============================================
   HERO SECTION
   ============================================ */

export function HeroSection() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className="relative min-h-screen pt-20 flex items-center justify-center overflow-hidden">
      {/* Fondo animado con gradiente */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-dark-950 via-dark-900 to-dark-950" />
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-electric/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple/20 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      {/* Contenido */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          className="space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div variants={itemVariants}>
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-electric/10 border border-electric/50 backdrop-blur">
              <span className="w-2 h-2 rounded-full bg-electric animate-pulse" />
              <span className="text-sm font-medium text-electric">
                ⚽ VIENDO EN VIVO - BRASIL vs ARGENTINA
              </span>
            </div>
          </motion.div>

          {/* Título principal */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-poppins font-bold">
              <span className="text-white">TRANSMISIONES EN VIVO</span>
              <br />
              <span className="text-gradient">DEL MUNDIAL 2026</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Únete a nuestra comunidad para ver los mejores partidos del Mundial.
              Chat en vivo, análisis en tiempo real y mucho más.
            </p>
          </motion.div>

          {/* Botones */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.button
              className="px-8 py-4 rounded-lg bg-gradient-electric text-white font-semibold text-base hover:shadow-glow-electric transition-all"
              whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(0, 212, 255, 0.8)' }}
              whileTap={{ scale: 0.95 }}
            >
              ▶️ Ver Stream
            </motion.button>
            <motion.button
              className="px-8 py-4 rounded-lg bg-white/10 border border-white/20 text-white font-semibold text-base hover:bg-white/20 transition-all backdrop-blur"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaDiscord className="inline mr-2" />
              Discord
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4 mt-12">
            {[
              { number: '2.5M+', label: 'Seguidores' },
              { number: '64', label: 'Partidos' },
              { number: '8', label: 'Grupos' },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg glass-card hover:border-electric/50 transition-all"
              >
                <div className="text-2xl md:text-3xl font-bold text-electric">
                  {stat.number}
                </div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Floating Football */}
      <motion.div
        className="absolute bottom-20 right-10 text-8xl opacity-20"
        variants={floatVariants}
        animate="float"
      >
        ⚽
      </motion.div>
    </section>
  );
}

/* ============================================
   SECCIÓN DE REDES SOCIALES
   ============================================ */

export function SocialSection() {
  const socials = [
    {
      name: 'Twitch',
      icon: FaTwitch,
      url: '#',
      followers: '1.2M',
      color: 'from-purple to-pink-600',
      description: 'Transmisiones en vivo diarias',
    },
    {
      name: 'YouTube',
      icon: FaYoutube,
      url: '#',
      followers: '890K',
      color: 'from-red-600 to-red-700',
      description: 'Análisis y highlights',
    },
    {
      name: 'Instagram',
      icon: FaInstagram,
      url: '#',
      followers: '1.5M',
      color: 'from-pink-500 to-rose-500',
      description: 'Contenido detrás de cámaras',
    },
    {
      name: 'Twitter/X',
      icon: FaTwitter,
      url: '#',
      followers: '740K',
      color: 'from-gray-700 to-gray-900',
      description: 'Noticias y comentarios',
    },
    {
      name: 'TikTok',
      icon: FaTiktok,
      url: '#',
      followers: '2.1M',
      color: 'from-gray-900 to-black',
      description: 'Clips virales y memes',
    },
    {
      name: 'Discord',
      icon: FaDiscord,
      url: '#',
      followers: '320K',
      color: 'from-indigo-600 to-blue-600',
      description: 'Comunidad oficial',
    },
  ];

  return (
    <section id="redes" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-poppins font-bold mb-4">
            Sígueme en{' '}
            <span className="text-gradient">Todas Partes</span>
          </h2>
          <p className="text-gray-400 text-lg">
            Mantente conectado con las actualizaciones más recientes
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {socials.map((social, idx) => {
            const Icon = social.icon;
            return (
              <motion.a
                key={idx}
                href={social.url}
                variants={itemVariants}
                className="group glass-card p-6 hover:border-electric/80 transition-all cursor-pointer"
                whileHover={{ y: -8 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${social.color} group-hover:shadow-lg transition-all`}>
                    <Icon className="text-2xl text-white" />
                  </div>
                  <span className="text-sm font-semibold text-electric">
                    {social.followers}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {social.name}
                </h3>
                <p className="text-gray-400 mb-4">{social.description}</p>
                <button className="w-full py-2 rounded-lg border border-white/20 hover:bg-white/10 transition-all text-white font-semibold">
                  Seguir
                </button>
              </motion.a>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

/* ============================================
   FLOATING BACK TO TOP BUTTON
   ============================================ */

export function FloatingBackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <motion.button
      onClick={scrollToTop}
      className="fixed bottom-8 right-8 z-40 w-12 h-12 rounded-full bg-gradient-electric text-white flex items-center justify-center shadow-glow-electric hover:shadow-lg transition-all"
      initial={{ opacity: 0, scale: 0 }}
      animate={isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <FaArrowUp className="text-lg" />
    </motion.button>
  );
}

/* ============================================
   FOOTER
   ============================================ */

export function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-gradient-to-t from-dark-950 to-transparent py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Logo */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-electric flex items-center justify-center">
                <span className="text-white font-bold">⚽</span>
              </div>
              <span className="font-poppins font-bold text-white">MUNDIAL</span>
            </div>
            <p className="text-gray-400 text-sm">
              La mejor plataforma para ver fútbol en vivo con tu comunidad.
            </p>
          </motion.div>

          {/* Links */}
          {[
            {
              title: 'Navegación',
              links: ['Inicio', 'Stream', 'Mundial', 'Llaves'],
            },
            {
              title: 'Legal',
              links: ['Privacidad', 'Términos', 'Cookies', 'Contacto'],
            },
            {
              title: 'Comunidad',
              links: ['Discord', 'Foro', 'Reportar', 'Sugerencias'],
            },
          ].map((section) => (
            <motion.div key={section.title} variants={itemVariants}>
              <h4 className="font-semibold text-white mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-electric transition-colors text-sm"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              © 2026 Mundial Streamer. Todos los derechos reservados.
            </p>
            <div className="flex gap-4 mt-4 md:mt-0">
              {[FaTwitch, FaYoutube, FaInstagram, FaTwitter].map(
                (Icon, idx) => (
                  <motion.a
                    key={idx}
                    href="#"
                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
                    whileHover={{ scale: 1.1 }}
                  >
                    <Icon className="text-white" />
                  </motion.a>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
