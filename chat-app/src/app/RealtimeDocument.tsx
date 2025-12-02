/**
 * RealtimeDocument - Dokument-wrapper for realtime-seksjon
 * 
 * Brukes for eksperimentelle realtime-ruter (/app/dashboard).
 * Basert på ApplicationDocument med samme tema-håndtering.
 */

import stylesUrl from "./styles.css?url";

// Inline script for å unngå feil tema ved lasting
const themeScript = `
(function() {
  const theme = localStorage.getItem('theme') || 'dark';
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const shouldBeDark = theme === 'dark' || (theme === 'system' && prefersDark);
  if (shouldBeDark) {
    document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = 'dark';
  } else {
    document.documentElement.style.colorScheme = 'light';
  }
})();
`;

export const RealtimeDocument: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <html lang="en">
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>RealTime ChatApp — Realtime</title>
      <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      <link rel="stylesheet" href={stylesUrl} />
      <link rel="modulepreload" href="/src/client.tsx" />
    </head>
    <body>
      <div id="root" className="min-h-screen">
        {children}
      </div>
      <script>import("/src/client.tsx")</script>
    </body>
  </html>
);

export default RealtimeDocument;
