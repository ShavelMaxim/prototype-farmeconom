import type { MouseEventHandler } from 'react';
import { CheckOutlined, PlusOutlined } from '@ant-design/icons';
import styles from './add-button.module.css';

export function CartAction({
  productId,
  name,
  stock,
  quantity,
  locked = false,
  onClick,
}: {
  productId: string;
  name: string;
  stock: number;
  quantity: number;
  locked?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}) {
  return (
    <button
      type="button"
      className={`${styles.button} ${quantity ? styles.added : ''}`}
      data-product-id={productId}
      disabled={locked || stock === 0 || quantity >= stock}
      aria-label={
        stock ? `${quantity ? 'Добавить ещё' : 'В корзину'}: ${name}` : `Нет в наличии: ${name}`
      }
      onClick={onClick}
    >
      {quantity ? <CheckOutlined /> : <PlusOutlined />}
      <span>
        {!stock
          ? 'Нет в этой аптеке'
          : quantity >= stock
            ? `В корзине ${quantity} · максимум`
            : quantity
              ? `В корзине ${quantity} · ещё`
              : 'В корзину'}
      </span>
    </button>
  );
}
