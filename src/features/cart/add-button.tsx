'use client';
import { Button } from 'antd';
import { CheckOutlined, PlusOutlined } from '@ant-design/icons';
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
      <Button
        block
        type={quantity ? 'default' : 'primary'}
        icon={quantity ? <CheckOutlined /> : <PlusOutlined />}
        disabled={!hydrated || busy || offer.stock === 0 || quantity >= offer.stock}
        aria-label={
          offer.stock
            ? `${quantity ? 'Добавить ещё' : 'В корзину'}: ${product.name}`
            : `Нет в наличии: ${product.name}`
        }
        onClick={() => {
          dispatch(addItem({ id: product.id, stock: offer.stock }));
          setAnnouncement(`${product.name}: в корзине ${quantity + 1} шт.`);
        }}
      >
        {!offer.stock
          ? 'Нет в этой аптеке'
          : quantity >= offer.stock
            ? `В корзине ${quantity} · максимум`
            : quantity
              ? `В корзине ${quantity} · ещё`
              : 'В корзину'}
      </Button>
      <span className="visually-hidden" role="status" aria-live="polite">
        {announcement}
      </span>
    </>
  );
}
