import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ശ്രീമദ് ഭാഗവതം - മലയാള അർത്ഥം',
  description: 'ശ്രീമദ് ഭാഗവതം നിത്യപാരായണത്തിനായുള്ള മലയാള അർത്ഥം (സ്കന്ധങ്ങൾ 1 മുതൽ 12 വരെ)',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#B85304',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ml">
      <head>
        {/* Preconnect to Google Fonts for Malayalam font support */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manjari:wght@400;700&family=Noto+Sans+Malayalam:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function() {});
                });
              }
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-devotional-main text-devotional-primary antialiased selection:bg-amber-200">
        {children}
      </body>
    </html>
  );
}
