import type { Metadata } from 'next';

import { vazirmatn } from '@/config/fonts';

import './globals.css';

export const metadata: Metadata = {
  title: 'نسخه سبز',
  description: 'پلتفرم نسخه سبز',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="fa" dir="rtl" className={`${vazirmatn.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        {children}
      </body>
    </html>
  );
}
