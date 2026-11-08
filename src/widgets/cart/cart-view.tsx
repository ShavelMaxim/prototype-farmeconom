'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Alert, Button, Empty, InputNumber, Skeleton } from 'antd';
import { DeleteOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '@/shared/lib/store-hooks';
import { removeItem, restoreRemovedItem, setQuantity } from '@/entities/cart/model';
import { money, type Product } from '@/entities/product/model';
import { ProductArtwork } from '@/entities/product/artwork';
import { getCartSummary } from '@/features/cart/summary';
import { PharmacyPicker } from '@/features/pharmacy/picker';
import styles from './cart-view.module.css';
import { ActionLink } from '@/shared/ui/action-link';
import { useInventory } from '@/entities/product/api';
import { InventoryStatus } from '@/entities/product/inventory-status';
import { FeedbackToast } from '@/shared/ui/feedback-toast';
export function CartView({ products: initial }: { products: Product[] }) {
  const inventory = useInventory(initial);
  const products = inventory.products;
  const cart = useAppSelector((s) => s.cart);
  const dispatch = useAppDispatch();
  const [removed, setRemoved] = useState<{ id: string; quantity: number; name: string } | null>(
    null,
  );
  const checkoutRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = checkoutRef.current;
    if (!element) return;
    const main = element.closest('main');
    const measure = () =>
      main?.style.setProperty('--cart-checkout-height', `${element.offsetHeight}px`);
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    measure();
    return () => {
      observer.disconnect();
      main?.style.removeProperty('--cart-checkout-height');
    };
  }, [cart.hydrated, cart.items.length, inventory.ready]);
  function remove(id: string, quantity: number, name: string) {
    setRemoved({ id, quantity, name });
    dispatch(removeItem(id));
  }
  const summary = getCartSummary(cart.items, products, cart.pharmacy);
  if (!inventory.ready)
    return <InventoryStatus error={inventory.error} retry={inventory.refetch} />;
  return (
    <main id="main" className={`container ${styles.cartPage}`}>
      <Link prefetch={false} href="/" className="back-link">
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
                    <Link
                      prefetch={false}
                      className={styles.art}
                      href={`/products/${line.product.slug}`}
                      aria-label={`Открыть товар: ${line.product.name}`}
                    >
                      <ProductArtwork product={line.product} />
                    </Link>
                    <div className={styles.info}>
                      <Link prefetch={false} href={`/products/${line.product.slug}`}>
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
                      <div
                        className={styles.quantity}
                        role="group"
                        aria-label={`Количество: ${line.product.name}`}
                      >
                        <button
                          aria-label={`Уменьшить количество: ${line.product.name}`}
                          disabled={!line.offer!.stock || line.quantity <= 1}
                          onClick={() =>
                            dispatch(
                              setQuantity({
                                id: line.id,
                                quantity: line.quantity - 1,
                                stock: line.offer!.stock,
                              }),
                            )
                          }
                        >
                          −
                        </button>
                        <InputNumber
                          controls={false}
                          precision={0}
                          aria-label={`Количество: ${line.product.name}`}
                          min={1}
                          max={Math.max(1, Math.min(99, line.offer!.stock))}
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
                        <button
                          aria-label={`Увеличить количество: ${line.product.name}`}
                          disabled={
                            !line.offer!.stock || line.quantity >= Math.min(99, line.offer!.stock)
                          }
                          onClick={() =>
                            dispatch(
                              setQuantity({
                                id: line.id,
                                quantity: line.quantity + 1,
                                stock: line.offer!.stock,
                              }),
                            )
                          }
                        >
                          +
                        </button>
                      </div>
                      <strong>{money(line.total)}</strong>
                      <Button
                        type="text"
                        icon={<DeleteOutlined />}
                        onClick={() => remove(line.id, line.quantity, line.product!.name)}
                        aria-label={`Удалить: ${line.product.name}`}
                      >
                        Убрать
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <p>Товар больше не доступен в каталоге.</p>
                    <Button onClick={() => remove(line.id, line.quantity, 'Товар')}>
                      Удалить товар
                    </Button>
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
            <div ref={checkoutRef} className={styles.checkoutAction}>
              <div className={styles.mobileTotal}>
                <span>{summary.valid ? 'Итого' : 'Проверьте наличие'}</span>
                <strong>{money(summary.total)}</strong>
              </div>
              {summary.valid ? (
                <ActionLink href="/checkout">
                  К оформлению <ArrowRightOutlined aria-hidden="true" />
                </ActionLink>
              ) : (
                <Button block disabled>
                  Исправьте наличие товаров
                </Button>
              )}
            </div>
            <p className={styles.disclaimer}>
              Заказ сохраняется на этом устройстве.
              <br />
              Отправка в аптеку пока недоступна.
            </p>
          </aside>
        </div>
      )}
      {cart.items.length > 0 && <div className={styles.checkoutSpace} aria-hidden="true" />}
      {removed && (
        <FeedbackToast
          message={`${removed.name}: убрано из корзины`}
          onClose={() => setRemoved(null)}
          onUndo={() => {
            dispatch(restoreRemovedItem({ id: removed.id, quantity: removed.quantity }));
            setRemoved(null);
          }}
        />
      )}
    </main>
  );
}
