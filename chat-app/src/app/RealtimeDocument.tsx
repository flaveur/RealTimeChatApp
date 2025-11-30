import stylesUrl from "./styles.css?url";

export const RealtimeDocument: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <html lang="en">
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>RealTime ChatApp — Realtime</title>
      <link rel="stylesheet" href={stylesUrl} />
      <link rel="modulepreload" href="/src/client.tsx" />
    </head>
    <body>
      <div id="root" className="min-h-screen">
        <header className="p-4 border-b">
          <div className="max-w-6xl mx-auto">Realtime Dashboard</div>
        </header>
        <main className="p-6">{children}</main>
      </div>
      <script>import("/src/client.tsx")</script>
    </body>
  </html>
);

export default RealtimeDocument;
