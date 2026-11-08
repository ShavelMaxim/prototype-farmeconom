'use client';
import { useState } from 'react';
import { Button, Modal } from 'antd';
import { AntdBoundary } from '@/shared/ui/antd-boundary';
import { useAppDispatch, useAppSelector } from '@/shared/lib/store-hooks';
import { repeatItems } from '@/entities/cart/model';
import { money, type Product } from '@/entities/product/model';
import type { DemoOrder } from '@/entities/personal/model';
import { useInventory } from '@/entities/product/api';
import { repeatPlan } from '@/features/orders/repeat-plan';
import { pharmacies } from '@/shared/config/pharmacies';
import { PagePlaceholder } from '@/shared/ui/page-placeholder';
import { ActionLink } from '@/shared/ui/action-link';
import { useDialogController } from '@/shared/lib/use-dialog-controller';
import styles from './orders.module.css';
const date = new Intl.DateTimeFormat('ru-RU', { dateStyle: 'long', timeStyle: 'short' });
export function Orders({ products: initial }: { products: Product[] }) {
  const { orders, hydrated, storageUnavailable } = useAppSelector((s) => s.personal);
  const cart = useAppSelector((s) => s.cart);
  const dispatch = useAppDispatch();
  const inventory = useInventory(initial);
  const [repeat, setRepeat] = useState<DemoOrder | null>(null);
  const [completed, setCompleted] = useState(false);
  const [dialogReady, setDialogReady] = useState(false);
  const {
    open: repeatOpen,
    show: showRepeat,
    close: dismissRepeat,
    setTrigger: setRepeatTrigger,
  } = useDialogController();
  function closeRepeat() {
    setRepeat(null);
    dismissRepeat();
  }
  const plan = repeat ? repeatPlan(repeat, inventory.products, cart.pharmacy, cart.items) : [];
  const count = plan.reduce((sum, line) => sum + line.adding, 0);
  const total = plan.reduce((sum, line) => sum + line.adding * (line.offer?.price ?? 0), 0);
  return (
    <AntdBoundary>
      <main id="main" className="container">
        <div className="page-top">
          <p className="eyebrow">ВАША ИСТОРИЯ</p>
          <h1>Мои заказы</h1>
          <p className="muted">
            История заказов, сохранённых на этом устройстве. Сохраняются последние 30 записей.
          </p>
        </div>
        {storageUnavailable && (
          <p role="alert">Хранилище недоступно. История сохранится только до закрытия страницы.</p>
        )}
        {!hydrated ? (
          <PagePlaceholder />
        ) : !orders.length ? (
          <div className="panel empty-state">
            <span aria-hidden="true">↗</span>
            <h2>Здесь появятся ваши заказы</h2>
            <p className="muted">
              Пройдите оформление корзины — состав и стоимость останутся в истории.
            </p>
            <ActionLink href="/">Перейти в каталог</ActionLink>
          </div>
        ) : (
          <div className={styles.list}>
            {orders.map((order) => {
              const pharmacy = pharmacies.find((p) => p.id === order.pharmacy)!;
              const amount = order.lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
              return (
                <section
                  key={order.reference}
                  className={`panel ${styles.order}`}
                  aria-label={order.reference}
                >
                  <div className={styles.top}>
                    <div>
                      <h2>{order.reference}</h2>
                      <time dateTime={order.createdAt}>
                        {date.format(new Date(order.createdAt))}
                      </time>
                    </div>
                    <span className={styles.status}>Сохранён на устройстве</span>
                  </div>
                  <p>
                    {pharmacy.name} · {pharmacy.address}
                  </p>
                  <p className="muted">
                    Выбранный день:{' '}
                    {order.pickup === 'today' ? 'в день оформления' : 'на следующий день'}. В аптеку
                    не передано.
                  </p>
                  <details>
                    <summary>
                      Состав · {order.lines.reduce((sum, line) => sum + line.quantity, 0)} шт. ·{' '}
                      {money(amount)}
                    </summary>
                    <ul>
                      {order.lines.map((line) => (
                        <li key={line.id}>
                          <span>
                            <span>{line.name}</span>
                            <small>
                              {line.quantity} шт. × {money(line.price)}
                            </small>
                          </span>
                          <strong>{money(line.price * line.quantity)}</strong>
                        </li>
                      ))}
                    </ul>
                  </details>
                  <Button
                    onClick={(event) => {
                      setRepeatTrigger(event.currentTarget);
                      setRepeat(order);
                      setCompleted(false);
                      setDialogReady(false);
                      showRepeat();
                    }}
                    disabled={
                      !cart.hydrated ||
                      !inventory.ready ||
                      inventory.isFetching ||
                      inventory.isError
                    }
                  >
                    Повторить заказ
                  </Button>
                </section>
              );
            })}
          </div>
        )}
        {inventory.isError && (
          <div role="alert" className="panel">
            <p>Не удалось проверить актуальные цены и наличие для повтора.</p>
            <Button onClick={inventory.refetch}>Повторить проверку</Button>
          </div>
        )}
        <Modal
          title={completed ? 'Товары добавлены' : 'Проверка перед повтором'}
          open={Boolean(repeat) && repeatOpen}
          afterOpenChange={setDialogReady}
          onCancel={closeRepeat}
          footer={
            completed ? (
              <>
                <ActionLink href="/cart">Открыть корзину</ActionLink>
                <Button onClick={closeRepeat}>Остаться в истории</Button>
              </>
            ) : (
              <>
                <Button onClick={closeRepeat}>Отмена</Button>
                <Button
                  type="primary"
                  disabled={!count || !inventory.ready || inventory.isFetching || inventory.isError}
                  onClick={() => {
                    dispatch(
                      repeatItems(
                        plan
                          .filter((line) => line.adding > 0)
                          .map((line) => ({
                            id: line.id,
                            quantity: line.adding,
                            stock: line.offer!.stock,
                          })),
                      ),
                    );
                    setCompleted(true);
                  }}
                >
                  Добавить {count} шт. · {money(total)}
                </Button>
              </>
            )
          }
        >
          <span hidden data-dialog-ready={dialogReady} />
          {completed ? (
            <p role="status">Существующая корзина сохранена. Новый заказ ещё не сохранён.</p>
          ) : (
            <>
              <p>
                Текущая аптека:{' '}
                <strong>{pharmacies.find((p) => p.id === cart.pharmacy)!.name}</strong>. Товары
                добавятся к вашей корзине.
              </p>
              <ul className={styles.review}>
                {plan.map((line) => (
                  <li key={line.id}>
                    <strong>{line.name}</strong>
                    <span>
                      {!line.product
                        ? 'Больше нет в каталоге'
                        : !line.offer?.stock
                          ? 'Нет в выбранной аптеке'
                          : line.limitReached
                            ? 'В корзине уже 50 разных товаров'
                            : !line.adding
                              ? 'Доступное количество уже в корзине'
                              : `Добавим ${line.adding} из ${line.quantity} шт. · ${money(line.offer.price)} / шт.`}
                    </span>
                    {line.changedPrice && line.offer && (
                      <small>Цена при прошлом оформлении: {money(line.price)}</small>
                    )}
                  </li>
                ))}
              </ul>
              <p className="muted">
                Недоступные позиции пропускаются; количество ограничено текущим остатком. Проверьте
                состав перед подтверждением.
              </p>
            </>
          )}
        </Modal>
      </main>
    </AntdBoundary>
  );
}
