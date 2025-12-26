import type { Metadata } from 'next';
import { Montserrat, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

// Heading font - Montserrat
const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-heading',
  display: 'swap',
});

// Body font - Inter
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
});

// Monospace font - JetBrains Mono
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'BoltInsight - Proposal Management System',
  description: 'AI-powered research proposal management and creation platform',
  icons: {
    icon: [
      { url: 'https://www.boltinsight.com/wp-content/uploads/2025/03/cropped-cropped-favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: 'https://www.boltinsight.com/wp-content/uploads/2025/03/cropped-cropped-favicon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: 'https://www.boltinsight.com/wp-content/uploads/2025/03/cropped-cropped-favicon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-body antialiased">
        {children}
      </body>
    </html>
  );
}
