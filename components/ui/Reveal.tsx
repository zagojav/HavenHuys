'use client';

import { motion } from 'motion/react';
import type { ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  /** Seconds to wait before the element starts moving. */
  delay?: number;
  /** Distance in px the element travels up into place. */
  distance?: number;
  className?: string;
  as?: 'div' | 'section' | 'li' | 'article' | 'header';
}

/**
 * Fade plus a short lift as the element enters the viewport. Runs once, and
 * the CSS reduced-motion guard in globals.css collapses it to a plain fade for
 * anyone who asked for less movement.
 */
export function Reveal({
  children,
  delay = 0,
  distance = 18,
  className,
  as = 'div',
}: RevealProps) {
  const Component = motion[as];

  return (
    <Component
      className={className}
      initial={{ opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-64px' }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Component>
  );
}
