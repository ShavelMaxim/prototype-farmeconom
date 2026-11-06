'use client';
import { Button } from 'antd';
import { CheckOutlined, PlusOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '@/shared/lib/store-hooks';
import { addItem } from '@/entities/cart/model';
import type { Product } from '@/entities/product/model';
export function AddButton({ product, busy = false }: { product: Product; busy?: boolean }) {
  const dispatch = useAppDispatch();
  const { pharmacy, items, hydrated } = useAppSelector((s) => s.cart);
  const offer = product.offers[pharmacy];
  const quantity = items.find((x) => x.id === product.id)?.quantity ?? 0;
  return (
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
      onClick={() => dispatch(addItem({ id: product.id, stock: offer.stock }))}
    >
      {!offer.stock
        ? 'Нет в этой аптеке'
        : quantity >= offer.stock
          ? `В корзине ${quantity} · максимум`
          : quantity
            ? `В корзине ${quantity} · ещё`
            : 'В корзину'}
    </Button>
  );
}
