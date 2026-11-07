import { useCallback, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/shared/lib/store-hooks';
import { addItem } from '@/entities/cart/model';
import type { PharmacyId, Product } from '@/entities/product/model';

export function useCatalogCart(products: Product[], pharmacy: PharmacyId, busy: boolean) {
  const { items, hydrated } = useAppSelector((state) => state.cart);
  const dispatch = useAppDispatch();
  const quantities = useMemo(
    () => new Map(items.map(({ id, quantity }) => [id, quantity])),
    [items],
  );
  const byId = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);
  const [announcement, setAnnouncement] = useState('');
  const add = useCallback(
    (id: string) => {
      const product = byId.get(id);
      if (!product || !hydrated || busy) return;
      const { stock } = product.offers[pharmacy];
      const quantity = quantities.get(id) ?? 0;
      if (quantity >= stock) return;
      dispatch(addItem({ id, stock }));
      setAnnouncement(`${product.name}: в корзине ${quantity + 1} шт.`);
    },
    [byId, hydrated, busy, pharmacy, quantities, dispatch],
  );
  return { quantities, hydrated, add, announcement };
}
