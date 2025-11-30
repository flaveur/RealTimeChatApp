// Import the stylesheet so Vite/PostCSS processes it in dev
import "./styles.css";
import stylesUrl from "./styles.css?url";
// You can add page-specific CSS files and link them here as needed
// import qStyles from './question-table.css?url'
// import qPageStyles from './questions-page.css?url'

export const Document: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <html lang="en">
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>@redwoodjs/starter-minimal</title>
      <link rel="stylesheet" href={stylesUrl} />
      {/* Andre CSS imports kan legges til her også!
          <link rel="stylesheet" href={qStyles} />
          <link rel="stylesheet" href={qPageStyles} />
      */}
      <link rel="modulepreload" href="/src/client.tsx" />
    </head>
    <body>
      <div id="root" className="min-h-screen flex flex-col md:flex-row">
        <div id="sidebar-root" />
        <main className="flex-1 p-6">{children}</main>
      </div>
      <script type="module" src="/src/client.tsx"></script>
    </body>
  </html>
);
