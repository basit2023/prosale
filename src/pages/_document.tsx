import '@/app/globals.css';

export const metadata = {
  title: 'My PWA Application',
  description: 'A Progressive Web App built with Next.js',
};

export default function RootLayout({ children }:any) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
