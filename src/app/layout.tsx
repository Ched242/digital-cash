import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DIGITAL CASH | Digital Marketplace',
  description: 'Achetez vos produits et services numériques en toute simplicité.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
