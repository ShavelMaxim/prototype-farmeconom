import type { Metadata } from 'next';
import { Providers } from '@/app/providers';
import { Header } from '@/widgets/header/header';
import Link from 'next/link';
import './globals.css';
import './seasonal.css';
import { defaultCatalog } from '@/entities/product/repository';
export const metadata: Metadata = {
  title: { default: 'Фарм Эконом — забота каждый день', template: '%s · Фарм Эконом' },
  description:
    'Товары для здоровья, домашней аптечки и ежедневного ухода. Каталог, избранное и выбор аптеки в Ангарске.',
  robots: { index: false, follow: false },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script
          id="display-preferences"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var d=JSON.parse(localStorage.getItem('apteka-ryadom:personal:v1')).display,r=document.documentElement;if(['100','125','150','200'].includes(d.scale))r.dataset.scale=d.scale;if(['standard','light','dark'].includes(d.contrast))r.dataset.contrast=d.contrast;r.dataset.spacing=String(d.spacing===true);r.dataset.motion=d.reducedMotion===true?'reduce':'system';r.dataset.festive=String(d.festive===true)}catch(e){}})()`,
          }}
        />
      </head>
      <body>
        <div className="seasonal-decor" aria-hidden="true" />
        <a className="skip-link" href="#main">
          Перейти к содержимому
        </a>
        <Providers initialCatalog={defaultCatalog}>
          <Header />
          {children}
          <footer className="footer">
            <div>
              <strong>фарм эконом</strong>
              <p>Забота начинается с простого.</p>
            </div>
            <p>
              Всё необходимое для заботы о себе.
              <br />
              Ангарск · самовывоз из выбранной аптеки
            </p>
            <Link prefetch={false} href="/about">
              Как пользоваться магазином ↗
            </Link>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
