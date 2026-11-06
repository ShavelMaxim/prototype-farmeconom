'use client';
import Link from 'next/link';
import { Alert, Button, Empty, InputNumber, Skeleton } from 'antd';
import { DeleteOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '@/shared/lib/store-hooks';
import { removeItem, setQuantity } from '@/entities/cart/model';
import { money, type Product } from '@/entities/product/model';
import { ProductArtwork } from '@/entities/product/artwork';
import { getCartSummary } from '@/features/cart/summary';
import { PharmacyPicker } from '@/features/pharmacy/picker';
import styles from './cart-view.module.css';
import { ActionLink } from '@/shared/ui/action-link';
export function CartView({ products }: { products: Product[] }) {
  const cart = useAppSelector((s) => s.cart);
  const dispatch = useAppDispatch();
  const summary = getCartSummary(cart.items, products, cart.pharmacy);
  return (
    <main id="main" className="container">
      <Link href="/" className="back-link">
        ← Продолжить покупки
      </Link>
      <div className="page-top">
        <p className="eyebrow">ВАШ ВЫБОР</p>
        <h1>Корзина</h1>
        <p className="muted">Всё нужное — в одном месте.</p>
      </div>
      {!cart.hydrated ? (
        <Skeleton active paragraph={{ rows: 5 }} />
      ) : !cart.items.length ? (
        <div className="panel">
          <Empty description="В корзине пока ничего нет">
            <p className="muted">Найдите товары для себя и своих близких.</p>
            <ActionLink href="/">Перейти в каталог</ActionLink>
          </Empty>
        </div>
      ) : (
        <div className={styles.layout}>
          <div className={styles.lines}>
            {!summary.valid && (
              <Alert
                type="warning"
                showIcon
                title="Проверьте наличие в выбранной аптеке"
                description="Уменьшите количество, уберите недоступные товары или выберите другую аптеку."
              />
            )}
            {summary.lines.map((line) => (
              <article className={styles.line} key={line.id}>
                {line.product ? (
                  <>
                    <Link className={styles.art} href={`/products/${line.product.slug}`}>
                      <ProductArtwork product={line.product} />
                    </Link>
                    <div className={styles.info}>
                      <Link href={`/products/${line.product.slug}`}>
                        <h2>{line.product.name}</h2>
                      </Link>
                      <p className="muted">{line.product.size}</p>
                      <p>{money(line.offer!.price)} / шт.</p>
                      {!line.valid && (
                        <p className={styles.warning}>
                          {line.offer!.stock
                            ? `Доступно только ${line.offer!.stock} шт.`
                            : 'Нет в выбранной аптеке'}
                        </p>
                      )}
                    </div>
                    <div className={styles.controls}>
                      <InputNumber
                        aria-label={`Количество: ${line.product.name}`}
                        min={1}
                        max={Math.max(1, line.offer!.stock)}
                        value={line.quantity}
                        disabled={!line.offer!.stock}
                        onChange={(value) => {
                          if (value != null)
                            dispatch(
                              setQuantity({
                                id: line.id,
                                quantity: value,
                                stock: line.offer!.stock,
                              }),
                            );
                        }}
                      />
                      <strong>{money(line.total)}</strong>
                      <Button
                        type="text"
                        icon={<DeleteOutlined />}
                        onClick={() => dispatch(removeItem(line.id))}
                        aria-label={`Удалить: ${line.product.name}`}
                      >
                        Убрать
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <p>Товар больше не доступен в демо-каталоге.</p>
                    <Button onClick={() => dispatch(removeItem(line.id))}>Удалить товар</Button>
                  </>
                )}
              </article>
            ))}
          </div>
          <aside className={`${styles.summary} panel`}>
            <h2>Ваш выбор</h2>
            <PharmacyPicker />
            <p className="muted">Цены и количество зависят от аптеки.</p>
            <div className={styles.row}>
              <span>Количество товаров</span>
              <span>{summary.count}</span>
            </div>
            <div className={styles.row}>
              <span>Самовывоз</span>
              <span>Бесплатно</span>
            </div>
            <div className={styles.total}>
              <span>Итого</span>
              <strong>{money(summary.total)}</strong>
            </div>
            {!summary.valid && (
              <p className={styles.warning}>
                Сумма включает недоступные позиции. Уберите их или измените аптеку перед
                оформлением.
              </p>
            )}
            {summary.valid ? (
              <ActionLink href="/checkout">
                К оформлению <ArrowRightOutlined aria-hidden="true" />
              </ActionLink>
            ) : (
              <Button block disabled>
                Исправьте наличие товаров
              </Button>
            )}
            <p className={styles.disclaimer}>
              Демонстрационный сценарий.
              <br />
              Оплата и реальный заказ не создаются.
            </p>
          </aside>
        </div>
      )}
    </main>
  );
}
