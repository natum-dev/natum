import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Playground",
  description: "Playground description",
  manifest: '/manifest.json',
  icons: {
    icon: '/assets/icons/index_logo.png',
    apple: [
      {
        url: '/assets/icons/icon_60.png',
        sizes: '60x60'
      },
      {
        url: '/assets/icons/icon_120.png',
        sizes: '120x120'
      },
      {
        url: '/assets/icons/icon_192.png',
        sizes: '192x192'
      },
      {
        url: '/assets/icons/icon_512.png',
        sizes: '512x512'
      }
    ]
  },
  appleWebApp: {
    capable: true,
    title: 'Playground',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
      </head>
      <body
        className={`antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
