import type { Metadata } from 'next';
import { Providers } from '@/app/providers';
import { Header } from '@/widgets/header/header';
import Link from 'next/link';
import './globals.css';
import { defaultCatalog } from '@/entities/product/repository';
export const metadata: Metadata = {
  title: { default: 'Аптека рядом — учебный интернет-магазин', template: '%s · Аптека рядом' },
  description: 'Frontend-портфолио: поиск, выбор аптеки и корзина на демонстрационных данных.',
  robots: { index: false, follow: false },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script
          id="display-preferences"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var d=JSON.parse(localStorage.getItem('apteka-ryadom:personal:v1')).display,r=document.documentElement;if(['100','125','150','200'].includes(d.scale))r.dataset.scale=d.scale;if(['standard','light','dark'].includes(d.contrast))r.dataset.contrast=d.contrast;r.dataset.spacing=String(d.spacing===true);r.dataset.motion=d.reducedMotion===true?'reduce':'system'}catch(e){}})()`,
          }}
        />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Перейти к содержимому
        </a>
        <Providers initialCatalog={defaultCatalog}>
          <Header />
          {children}
          <footer className="footer">
            <div>
              <strong>аптека рядом.</strong>
              <p>Забота начинается с простого.</p>
            </div>
            <p>
              Независимый учебный проект.
              <br />
              Не официальный сайт Фармэконом. Покупки не совершаются.
            </p>
            <Link prefetch={false} href="/about">
              Как устроен проект ↗
            </Link>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
