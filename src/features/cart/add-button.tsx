'use client';
import { CartAction } from './cart-action';
import { useAppDispatch, useAppSelector } from '@/shared/lib/store-hooks';
import { addItem } from '@/entities/cart/model';
import type { Product } from '@/entities/product/model';
import { useState } from 'react';
export function AddButton({ product, busy = false }: { product: Product; busy?: boolean }) {
  const dispatch = useAppDispatch();
  const pharmacy = useAppSelector((s) => s.cart.pharmacy);
  const hydrated = useAppSelector((s) => s.cart.hydrated);
  const quantity = useAppSelector(
    (s) => s.cart.items.find((x) => x.id === product.id)?.quantity ?? 0,
  );
  const [announcement, setAnnouncement] = useState('');
  const offer = product.offers[pharmacy];
  return (
    <>
      <CartAction
        productId={product.id}
        name={product.name}
        stock={offer.stock}
        quantity={quantity}
        locked={!hydrated || busy}
        onClick={() => {
          dispatch(addItem({ id: product.id, stock: offer.stock }));
          setAnnouncement(`${product.name}: в корзине ${quantity + 1} шт.`);
        }}
      />
      <span className="visually-hidden" role="status" aria-live="polite">
        {announcement}
      </span>
    </>
  );
}
