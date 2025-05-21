
import type { Metadata } from 'next';
// Removed custom font imports for diagnosis
// import { IBM_Plex_Sans, Orbitron, Merriweather, Roboto, Outfit, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

// const primaryFont = IBM_Plex_Sans({ 
//   subsets: ['latin'],
//   weight: ['400', '500', '700'],
//   variable: '--font-ui', 
//   display: 'swap',
// });

// const displayFont = Orbitron({ 
//   subsets: ['latin'],
//   weight: ['400', '500', '600', '700', '800', '900'],
//   variable: '--font-display', 
//   display: 'swap',
// });

// const lawFont = Roboto({
//   subsets: ['latin'],
//   weight: ['400', '500', '700'],
//   variable: '--font-law',
//   display: 'swap',
// });

// const chaosFont = Merriweather({
//   subsets: ['latin'],
//   weight: ['400', '700'],
//   variable: '--font-chaos',
//   display: 'swap',
// });

// const neutralFont = Outfit({
//   subsets: ['latin'],
//   variable: '--font-neutral',
//   display: 'swap',
// });

// const monoFont = JetBrains_Mono({
//     subsets: ['latin'],
//     variable: '--font-mono',
//     display: 'swap',
// });


export const metadata: Metadata = {
  title: 'NeuroOS v2 Module Player',
  description: 'An advanced cognitive operating system for transformative learning.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Removed font variables from html tag for diagnosis
    <html lang="en">
      {/* Simplified body className for diagnosis */}
      <body className={`antialiased bg-background text-foreground`}> 
        {children}
        <Toaster />
      </body>
    </html>
  );
}
