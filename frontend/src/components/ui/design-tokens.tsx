import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Organic, invisible-border card container
export const FloatingCard = ({ children, className, delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay, type: "spring", stiffness: 90, damping: 20 }}
    className={cn(
      "bg-white/70 backdrop-blur-3xl rounded-[2.5rem] border border-white p-7 w-full",
      "shadow-[0_8px_30px_rgb(0,0,0,0.02),0_1px_3px_rgb(0,0,0,0.01)] hover:shadow-[0_15px_40px_rgb(0,0,0,0.04)]",
      "transition-shadow duration-500",
      className
    )}
  >
    {children}
  </motion.div>
);

// High-contrast, pitch-black pill buttons
export const PillButton = ({ icon: Icon, label, className, onClick, children }: { icon?: any, label?: React.ReactNode, className?: string, onClick?: () => void, children?: React.ReactNode }) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex items-center justify-center gap-2 bg-black text-white px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide hover:bg-gray-800 transition-colors",
      className
    )}
  >
    {Icon && <Icon className="w-3.5 h-3.5" strokeWidth={2.5} />}
    {label && <span>{label}</span>}
    {children}
  </button>
);

// Tiny floating icon buttons (like in the top nav of the reference)
export const NavIconButton = ({ icon: Icon, active, onClick, className }: { icon: any, active?: boolean, onClick?: () => void, className?: string }) => (
  <button onClick={onClick} className={cn(
    "w-9 h-9 flex items-center justify-center rounded-full transition-colors",
    active ? "bg-white text-black shadow-sm" : "bg-transparent text-gray-500 hover:bg-white/50",
    className
  )}>
    <Icon className="w-4 h-4 stroke-[2]" />
  </button>
);

// Editorial Typography: Huge Display Title
export const DisplayTitle = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <h1 className={cn("text-[28px] md:text-[36px] font-medium tracking-tight text-gray-900 leading-none", className)}>
    {children}
  </h1>
);

// Editorial Typography: Micro Label
export const MicroLabel = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <span className={cn("text-[9px] uppercase tracking-[0.15em] font-semibold text-gray-400 block", className)}>
    {children}
  </span>
);
