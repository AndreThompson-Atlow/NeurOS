
import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
      fontFamily: {
        // Temporarily remove custom font families to rely on system defaults for diagnosis
        // sans: ['var(--font-ui)', 'system-ui', 'sans-serif'], 
        // display: ['var(--font-display)', 'serif'], 
        // mono: ['var(--font-mono)', 'monospace'], 
        // law: ['var(--font-law)', 'sans-serif'], 
        // chaos: ['var(--font-chaos)', 'serif'],  
        // neutral: ['var(--font-neutral)', 'sans-serif'], 
        sans: ['system-ui', 'sans-serif'], // Fallback to system sans-serif
        serif: ['serif'], // Fallback to system serif
        mono: ['monospace'], // Fallback to system monospace
      },
  		colors: {
        // Base UI Colors from Neural Litmus
        background: 'hsl(var(--background))',       // Midnight Navy
        foreground: 'hsl(var(--foreground))',       // Cool White
        
        card: {
          DEFAULT: 'hsl(var(--card))',              // Darker Navy variant for card end-gradient
          foreground: 'hsl(var(--card-foreground))', // Cool White
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',            // Darker Navy variant
          foreground: 'hsl(var(--popover-foreground))', // Cool White
        },
        primary: { // Mapped to Highlight Neon
          DEFAULT: 'hsl(var(--primary))',             // Specter Cyan
          foreground: 'hsl(var(--primary-foreground))', // Midnight Navy (for text on cyan buttons)
        },
        secondary: { // Mapped to Accent Glow
          DEFAULT: 'hsl(var(--secondary))',           // Judgment Crimson
          foreground: 'hsl(var(--secondary-foreground))', // Cool White (for text on crimson buttons)
        },
        muted: { // General Muted from Specter Gray
          DEFAULT: 'hsl(var(--muted))',               // Shadow Gray
          foreground: 'hsl(var(--muted-foreground))', // Lighter gray for text on dark
        },
        accent: { // Default Accent (Can be Specter Cyan or another color if Primary is Cyan)
          DEFAULT: 'hsl(var(--accent))',              // Specter Cyan
          foreground: 'hsl(var(--accent-foreground))', // Midnight Navy
        },
        destructive: { // Generic Destructive (Can be Judgment Crimson)
          DEFAULT: 'hsl(var(--destructive))',         // Judgment Crimson
          foreground: 'hsl(var(--destructive-foreground))', // Cool White
        },
        border: 'hsl(var(--border))',                 // Darker Shadow Gray for borders
        input: 'hsl(var(--input))',                   // Darker input background
        ring: 'hsl(var(--ring))',                     // Specter Cyan for focus rings

        // Alignment specific theme colors (can be used directly with bg-law-primary-color etc.)
        'law-primary-color': 'hsl(var(--law-primary-color))', // Construct Gold
        'law-secondary-color': 'hsl(var(--law-secondary-color))',
        'law-accent-color': 'hsl(var(--law-accent-color))',
        'law-text-color': 'hsl(var(--law-text-color))',
        'law-surface-color': 'hsl(var(--law-surface-color))',
        'law-border-color': 'hsl(var(--law-border-color))',
        'law-text-on-surface-color': 'hsl(var(--law-text-on-surface-color))',

        'chaos-primary-color': 'hsl(var(--chaos-primary-color))', // Judgment Crimson
        'chaos-secondary-color': 'hsl(var(--chaos-secondary-color))',
        'chaos-accent-color': 'hsl(var(--chaos-accent-color))',
        'chaos-text-color': 'hsl(var(--chaos-text-color))',
        'chaos-surface-color': 'hsl(var(--chaos-surface-color))',
        'chaos-border-color': 'hsl(var(--chaos-border-color))',
        'chaos-text-on-surface-color': 'hsl(var(--chaos-text-on-surface-color))',

        'neutral-primary-color': 'hsl(var(--neutral-primary-color))', // Specter Cyan
        'neutral-secondary-color': 'hsl(var(--neutral-secondary-color))',
        'neutral-accent-color': 'hsl(var(--neutral-accent-color))',
        'neutral-text-color': 'hsl(var(--neutral-text-color))',
        'neutral-surface-color': 'hsl(var(--neutral-surface-color))',
        'neutral-border-color': 'hsl(var(--neutral-border-color))',
        'neutral-text-on-surface-color': 'hsl(var(--neutral-text-on-surface-color))',
        'neutral-progress-fill': 'hsl(var(--neutral-progress-fill))',
        
        // Status Colors
        'status-new': 'hsl(var(--status-new))',
        'status-new-bg': 'hsl(var(--status-new-bg))',
        'status-familiar': 'hsl(var(--status-familiar))',
        'status-familiar-bg': 'hsl(var(--status-familiar-bg))',
        'status-understood': 'hsl(var(--status-understood))',
        'status-understood-bg': 'hsl(var(--status-understood-bg))',
        'status-needs-review': 'hsl(var(--status-needs-review))',
        'status-needs-review-bg': 'hsl(var(--status-needs-review-bg))',

        // Text colors from new guide
        'text-primary-neuro': 'hsl(var(--text-primary-neuro))',
        'text-secondary-neuro': 'hsl(var(--text-secondary-neuro))',
        'text-tertiary-neuro': 'hsl(var(--text-tertiary-neuro))',
        'divider-neuro': 'hsl(var(--divider-neuro))',
        
        // Chart colors
        'chart-1': 'hsl(var(--chart-1))',
        'chart-2': 'hsl(var(--chart-2))',
        'chart-3': 'hsl(var(--chart-3))',
        'chart-4': 'hsl(var(--chart-4))',
        'chart-5': 'hsl(var(--chart-5))',
  		},
  		borderRadius: { 
  			lg: 'var(--radius)', // 1rem
  			md: 'calc(var(--radius) - 0.25rem)', // 0.75rem
  			sm: 'calc(var(--radius) - 0.5rem)'  // 0.5rem 
  		},
      spacing: {
        'spacing-unit': '8px', // Base unit
        'spacing-xs': 'var(--spacing-unit)', // 8px 
        'spacing-sm': 'calc(var(--spacing-unit) * 2)', // 16px
        'spacing-md': 'calc(var(--spacing-unit) * 3)', // 24px
        'spacing-lg': 'calc(var(--spacing-unit) * 4)', // 32px
        'spacing-xl': 'calc(var(--spacing-unit) * 6)', // 48px
        'spacing-xxl': 'calc(var(--spacing-unit) * 8)', // 64px
      },
  		keyframes: { 
  			'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
  			'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
        typing: { from: { width: '0' }, to: { width: '100%' } },
        'blink-caret': { 'from, to': { borderColor: 'transparent' }, '50%': { borderColor: 'hsl(var(--primary))' } }, 
        glitch: { '2%, 64%': { transform: 'translate(2px,0) skew(0deg)' }, '4%, 60%': { transform: 'translate(-2px,0) skew(0deg)' }, '62%': { transform: 'translate(0,0) skew(5deg)' } },
        dissolve: { '0%': { opacity: '1', filter: 'blur(0px)' }, '100%': { opacity: '0', filter: 'blur(10px) drop-shadow(0 0 5px hsl(var(--secondary)))', transform: 'scale(0.8)' } }, 
        shatter: { '0%': { opacity: '1', transform: 'scale(1)' }, '50%': { opacity: '0.8', transform: 'scale(1.05) rotate(2deg) translateX(5px)', filter: 'drop-shadow(0 0 3px hsl(var(--primary)))' }, '100%': { opacity: '0', transform: 'scale(0.9) rotate(-5deg) translateX(20px)', filter: 'blur(5px) drop-shadow(0 0 0px hsl(var(--primary)))' } }, 
        vanish: { '0%': { opacity: '1', filter: 'drop-shadow(0 0 3px hsl(var(--law-primary-color)))' }, '100%': { opacity: '0', transform: 'translateY(-20px)', filter: 'drop-shadow(0 0 0px hsl(var(--law-primary-color)))' } }, 
        'pulse-destructive': { '0%, 100%': { boxShadow: '0 0 0 0 hsla(var(--secondary), 0.4)' }, '50%': { boxShadow: '0 0 0 10px hsla(var(--secondary), 0)' } }, 
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        lawEntrance: { from: { transform: 'translateY(-20px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        chaosEntrance: { from: { transform: 'scale(0.8) rotate(-5deg)', opacity: '0' }, to: { transform: 'scale(1) rotate(0)', opacity: '1' } },
        neutralEntrance: { from: { opacity: '0' }, to: { opacity: '1' } },
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
        typewriter: 'typing 3.5s steps(40, end), blink-caret .75s step-end infinite',
        glitch: 'glitch 1s linear infinite',
        dissolve: 'dissolve 0.5s ease-out forwards',
        shatter: 'shatter 0.6s ease-in-out forwards',
        vanish: 'vanish 0.4s ease-in forwards',
        'pulse-destructive': 'pulse-destructive 2s infinite',
        fadeIn: 'fadeIn 0.5s ease-out forwards',
        'law-entrance': 'lawEntrance 400ms cubic-bezier(0, 0, 0.2, 1) forwards',
        'chaos-entrance': 'chaosEntrance 500ms cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'neutral-entrance': 'neutralEntrance 300ms ease forwards',
  		},
      boxShadow: { 
        DEFAULT: '0 0 8px hsla(var(--primary), 0.1)', 
        md: '0 0 12px hsla(var(--primary), 0.25)', 
        lg: '0 0 16px hsla(var(--primary), 0.4)',  
        xl: '0 0 24px hsla(var(--primary), 0.5)',  
        'cyan-sm': '0 0 8px hsla(var(--primary), 0.1)', 
        'cyan-md': '0 0 12px hsla(var(--primary), 0.4)', 
        'crimson-btn': '0 2px 6px hsla(var(--secondary), 0.25)', 
        'gold-btn': '0 2px 6px hsla(var(--law-primary-color), 0.25)', 
        'cyan-btn': '0 2px 6px hsla(var(--primary), 0.25)', 
      },
      fontSize: { 
        'xxs': '0.625rem', 
        'xs': '0.75rem',    
        'sm': '0.875rem',   
        'base': '1rem',     
        'lg': '1.125rem',   
        'xl': '1.25rem',    
        '2xl': '1.5rem',    
        '3xl': '2rem',  
      }
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
