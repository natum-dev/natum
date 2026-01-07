import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Playground",
  description: "Playground description",
  manifest: '/manifest.json',
  icons: {
    icon: '/assets/icons/index_logo_dark.png',
    apple: [
      {
        url: '/assets/icons/icon_60_dark.png',
        sizes: '60x60'
      },
      {
        url: '/assets/icons/icon_120_dark.png',
        sizes: '120x120'
      },
      {
        url: '/assets/icons/icon_192_dark.png',
        sizes: '192x192'
      },
      {
        url: '/assets/icons/icon_512_dark.png',
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
