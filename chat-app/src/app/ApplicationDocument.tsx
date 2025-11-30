import stylesUrl from "./styles.css?url";

export const ApplicationDocument: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <html lang="en">
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>RealTime ChatApp — Application</title>
      <link rel="stylesheet" href={stylesUrl} />
      <link rel="modulepreload" href="/src/client.tsx" />
    </head>
    <body>
      <div id="root" className="min-h-screen flex flex-col md:flex-row">
        <div id="sidebar-root" />
        <main className="flex-1 p-6">{children}</main>
      </div>
      <script>import("/src/client.tsx")</script>
    </body>
  </html>
);

export default ApplicationDocument;
