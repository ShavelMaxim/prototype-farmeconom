'use client';
import { pharmacies } from '@/shared/config/pharmacies';
import { useAppSelector } from '@/shared/lib/store-hooks';
import { money, type Product } from '@/entities/product/model';
import { PharmacyPicker } from './picker';
import styles from './offers.module.css';

export function PharmacyOffers({ product }: { product: Product }) {
  const selected = useAppSelector((state) => state.cart.pharmacy);
  return (
    <section aria-labelledby="pharmacy-offers-title" className={styles.offers}>
      <h2 id="pharmacy-offers-title">Цена и наличие в аптеках</h2>
      <p className="muted">
        Сравните точки самовывоза. Все адреса и остатки демонстрационные. Смена аптеки применяется
        ко всей корзине после подтверждения.
      </p>
      <ul>
        {pharmacies.map((pharmacy) => {
          const offer = product.offers[pharmacy.id];
          const current = selected === pharmacy.id;
          return (
            <li key={pharmacy.id} className={current ? styles.selected : ''}>
              <div>
                <h3>{pharmacy.name}</h3>
                {current && <span className={styles.badge}>Выбрана</span>}
              </div>
              <p>
                {pharmacy.address}
                <br />
                {pharmacy.hours}
              </p>
              <div className={styles.priceRow}>
                <strong>{money(offer.price)}</strong>
                <span>{offer.stock ? `В наличии ${offer.stock} шт.` : 'Нет в этой аптеке'}</span>
              </div>
              <PharmacyPicker target={pharmacy.id} product={product} />
            </li>
          );
        })}
      </ul>
      <span role="status" className="visually-hidden">
        Выбрана аптека: {pharmacies.find((p) => p.id === selected)!.name}
      </span>
    </section>
  );
}
