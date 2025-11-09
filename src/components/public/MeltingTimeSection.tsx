'use client';

import { motion } from 'framer-motion';
import { Clock, Timer, Hourglass } from 'lucide-react';
import { useI18n } from '@/hooks/useI18n';

export default function MeltingTimeSection() {
  const { isRTL } = useI18n();

  return (
    <section id="melting-time" className="py-16 bg-gradient-to-br from-purple-900 via-indigo-900 to-orange-900 overflow-hidden relative">
      {/* Background Stars */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [0.5, 1.5, 0.5],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            {isRTL ? 'הזמן נמס' : 'Time Is Melting'}
          </h2>
          <p className="text-lg text-purple-200 max-w-3xl mx-auto">
            {isRTL 
              ? 'במדבר, הזמן מקבל משמעות חדשה. כאן בקנדי לנד, אנחנו יוצרים רגעים שנצרבים בזיכרון לנצח'
              : 'In the desert, time takes on new meaning. Here at Candy Land, we create moments that burn into memory forever'
            }
          </p>
        </motion.div>

        {/* Melting Clocks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Clock 1 - Past */}
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-center"
          >
            <div className="relative mb-4">
              <motion.div
                className="relative inline-block"
                animate={{
                  transform: ['perspective(400px) rotateX(0deg)', 'perspective(400px) rotateX(-10deg)', 'perspective(400px) rotateX(0deg)'],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              >
                {/* Melting Clock SVG */}
                <svg width="100" height="80" viewBox="0 0 100 80" className="drop-shadow-2xl">
                  <defs>
                    <linearGradient id="clockGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#fbbf24" />
                      <stop offset="100%" stopColor="#f59e0b" />
                    </linearGradient>
                    <filter id="melt1">
                      <feTurbulence baseFrequency="0.1" numOctaves="2" result="noise">
                        <animate attributeName="baseFrequency" values="0.1;0.2;0.1" dur="6s" repeatCount="indefinite"/>
                      </feTurbulence>
                      <feDisplacementMap in="SourceGraphic" in2="noise" scale="3"/>
                    </filter>
                  </defs>
                  
                  {/* Clock Face - Melting */}
                  <motion.path
                    d="M15 20 Q50 15 85 20 Q85 35 70 50 Q50 65 30 50 Q15 35 15 20 Z"
                    fill="url(#clockGradient1)"
                    stroke="#f97316"
                    strokeWidth="2"
                    filter="url(#melt1)"
                    animate={{
                      d: [
                        "M15 20 Q50 15 85 20 Q85 35 70 50 Q50 65 30 50 Q15 35 15 20 Z",
                        "M15 25 Q50 20 85 25 Q80 40 65 55 Q50 70 35 55 Q20 40 15 25 Z",
                        "M15 20 Q50 15 85 20 Q85 35 70 50 Q50 65 30 50 Q15 35 15 20 Z",
                      ]
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                  />
                  
                  {/* Clock Hands */}
                  <g transform="translate(50, 35)">
                    <motion.line
                      x1="0" y1="0" x2="0" y2="-15"
                      stroke="#dc2626" strokeWidth="2" strokeLinecap="round"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.line
                      x1="0" y1="0" x2="0" y2="-10"
                      stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                    />
                    <circle cx="0" cy="0" r="2" fill="#dc2626"/>
                  </g>
                  
                  {/* Dripping Effect */}
                  <motion.path
                    d="M50 65 Q52 70 50 75 Q48 70 50 65"
                    fill="url(#clockGradient1)"
                    animate={{
                      d: [
                        "M50 65 Q52 70 50 75 Q48 70 50 65",
                        "M50 65 Q54 75 50 80 Q46 75 50 65",
                        "M50 65 Q52 70 50 75 Q48 70 50 65",
                      ]
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  />
                </svg>
              </motion.div>
            </div>
            <h3 className="text-lg font-bold text-yellow-300 mb-1">Memories</h3>
            <p className="text-purple-200 text-xs">
              {isRTL ? 'זכרונות מבערים קודמים' : 'Echoes from past burns'}
            </p>
          </motion.div>

          {/* Clock 2 - Present (Candy Land) */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-center"
          >
            <div className="relative mb-4">
              <motion.div
                className="relative inline-block"
                animate={{
                  y: [0, -8, 0],
                  rotate: [0, 3, -3, 0],
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                <svg width="100" height="100" viewBox="0 0 100 100" className="drop-shadow-2xl">
                  <defs>
                    <radialGradient id="clockGradient2" cx="50%" cy="30%" r="70%">
                      <stop offset="0%" stopColor="#fef3c7" />
                      <stop offset="50%" stopColor="#fbbf24" />
                      <stop offset="100%" stopColor="#f59e0b" />
                    </radialGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                      <feMerge> 
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  
                  {/* Main Clock - Floating */}
                  <motion.circle
                    cx="50" cy="40" r="30"
                    fill="url(#clockGradient2)"
                    stroke="#f97316"
                    strokeWidth="2"
                    filter="url(#glow)"
                    animate={{
                      r: [30, 33, 30],
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  />
                  
                  {/* Clock Hands */}
                  <g transform="translate(50, 40)">
                    <motion.line
                      x1="0" y1="0" x2="0" y2="-18"
                      stroke="#dc2626" strokeWidth="3" strokeLinecap="round"
                      animate={{ 
                        rotate: 360,
                        y: [0, -1, 0],
                      }}
                      transition={{ 
                        rotate: { duration: 12, repeat: Infinity, ease: "linear" },
                        y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                      }}
                    />
                    <motion.line
                      x1="0" y1="0" x2="0" y2="-12"
                      stroke="#dc2626" strokeWidth="2" strokeLinecap="round"
                      animate={{ 
                        rotate: 360,
                        y: [0, -0.5, 0],
                      }}
                      transition={{ 
                        rotate: { duration: 1, repeat: Infinity, ease: "linear" },
                        y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                      }}
                    />
                    <motion.circle 
                      cx="0" cy="0" r="2" 
                      fill="#dc2626"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </g>
                  
                  {/* Melting Drips */}
                  <motion.path
                    d="M50 70 Q52 80 50 85 Q48 80 50 70"
                    fill="url(#clockGradient2)"
                    animate={{
                      d: [
                        "M50 70 Q52 80 50 85 Q48 80 50 70",
                        "M50 70 Q55 85 50 95 Q45 85 50 70",
                        "M50 70 Q52 80 50 85 Q48 80 50 70",
                      ]
                    }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  />
                </svg>
              </motion.div>
            </div>
            <h3 className="text-xl font-bold text-yellow-300 mb-1">Candy Land</h3>
            <p className="text-purple-200 text-sm">
              {isRTL ? 'הרגע הנוכחי נמס לקסם' : 'The present moment melts into magic'}
            </p>
          </motion.div>

          {/* Clock 3 - Future */}
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.6 }}
            className="text-center"
          >
            <div className="relative mb-4">
              <motion.div
                className="relative inline-block"
                animate={{
                  transform: ['perspective(400px) rotateY(0deg)', 'perspective(400px) rotateY(8deg)', 'perspective(400px) rotateY(0deg)'],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              >
                <svg width="100" height="90" viewBox="0 0 100 90" className="drop-shadow-2xl">
                  <defs>
                    <linearGradient id="clockGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#a855f7" />
                      <stop offset="50%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#dc2626" />
                    </linearGradient>
                    <filter id="melt3">
                      <feTurbulence baseFrequency="0.15" numOctaves="1" result="noise">
                        <animate attributeName="baseFrequency" values="0.15;0.25;0.15" dur="8s" repeatCount="indefinite"/>
                      </feTurbulence>
                      <feDisplacementMap in="SourceGraphic" in2="noise" scale="4"/>
                    </filter>
                  </defs>
                  
                  {/* Heavily Melted Clock */}
                  <motion.path
                    d="M25 15 Q50 10 75 20 Q90 30 85 50 Q75 65 60 75 Q40 85 25 70 Q10 55 12 40 Q15 20 25 15 Z"
                    fill="url(#clockGradient3)"
                    stroke="#7c3aed"
                    strokeWidth="2"
                    filter="url(#melt3)"
                    animate={{
                      d: [
                        "M25 15 Q50 10 75 20 Q90 30 85 50 Q75 65 60 75 Q40 85 25 70 Q10 55 12 40 Q15 20 25 15 Z",
                        "M30 20 Q50 15 70 25 Q85 35 80 55 Q70 70 55 80 Q35 90 20 75 Q5 60 8 45 Q12 25 30 20 Z",
                        "M25 15 Q50 10 75 20 Q90 30 85 50 Q75 65 60 75 Q40 85 25 70 Q10 55 12 40 Q15 20 25 15 Z",
                      ]
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                  />
                  
                  {/* Distorted Clock Hands */}
                  <g transform="translate(50, 40)">
                    <motion.path
                      d="M0 0 Q-3 -12 0 -20 Q3 -12 0 0"
                      fill="#7c3aed"
                      animate={{ 
                        rotate: 360,
                        d: [
                          "M0 0 Q-3 -12 0 -20 Q3 -12 0 0",
                          "M0 0 Q-6 -10 -1 -20 Q6 -10 0 0",
                          "M0 0 Q-3 -12 0 -20 Q3 -12 0 0",
                        ]
                      }}
                      transition={{ 
                        rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                        d: { duration: 6, repeat: Infinity, ease: "easeInOut" }
                      }}
                    />
                  </g>
                  
                  {/* Multiple Drips */}
                  <motion.path
                    d="M35 75 Q37 80 35 85 Q33 80 35 75"
                    fill="url(#clockGradient3)"
                    animate={{
                      d: [
                        "M35 75 Q37 80 35 85 Q33 80 35 75",
                        "M35 75 Q39 85 35 90 Q31 85 35 75",
                        "M35 75 Q37 80 35 85 Q33 80 35 75",
                      ]
                    }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  />
                  <motion.path
                    d="M65 70 Q67 75 65 80 Q63 75 65 70"
                    fill="url(#clockGradient3)"
                    animate={{
                      d: [
                        "M65 70 Q67 75 65 80 Q63 75 65 70",
                        "M65 70 Q69 80 65 85 Q61 80 65 70",
                        "M65 70 Q67 75 65 80 Q63 75 65 70",
                      ]
                    }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                  />
                </svg>
              </motion.div>
            </div>
            <h3 className="text-lg font-bold text-purple-300 mb-1">Dreams</h3>
            <p className="text-purple-200 text-xs">
              {isRTL ? 'חלומות על בערים עתידיים' : 'Visions of future burns'}
            </p>
          </motion.div>
        </div>

        {/* Philosophical Quote */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <blockquote className="text-xl md:text-2xl font-light text-white/90 italic mb-4 leading-relaxed">
            {isRTL 
              ? '"במדבר, השעונים נמסים והזמן הופך לחוויה טהורה"'
              : '"In the desert, clocks melt and time becomes pure experience"'
            }
          </blockquote>
          <cite className="text-purple-300">
            — {isRTL ? 'פילוסופיית קנדי לנד' : 'Candy Land Philosophy'}
          </cite>
        </motion.div>

        {/* Floating Time Elements */}
        <div className="absolute inset-0 pointer-events-none">
          {[Clock, Timer, Hourglass].map((Icon, index) => (
            <motion.div
              key={index}
              className="absolute text-white/10"
              style={{
                left: `${15 + index * 35}%`,
                top: `${20 + index * 15}%`,
              }}
              animate={{
                y: [0, -20, 0],
                rotate: [0, 360],
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{
                duration: 12 + index * 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 2,
              }}
            >
              <Icon className="h-8 w-8" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
