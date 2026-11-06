'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, Checkbox, Empty, Radio, Result, Skeleton } from 'antd';
import { useAppDispatch, useAppSelector } from '@/shared/lib/store-hooks';
import { clearCart } from '@/entities/cart/model';
import { money, type Product } from '@/entities/product/model';
import { getCartSummary } from '@/features/cart/summary';
import {
  checkoutFormSchema,
  type CheckoutFormValues,
  type CheckoutResponse,
} from '@/features/checkout/model';
import { useCheckoutMutation } from '@/features/checkout/api';
import { pharmacies } from '@/shared/config/pharmacies';
import styles from './checkout.module.css';
import { ActionLink } from '@/shared/ui/action-link';
import { useInventory } from '@/entities/product/api';
import { InventoryStatus } from '@/entities/product/inventory-status';
import { apiErrorMessage } from '@/shared/api/errors';
export function Checkout({ products: initial }: { products: Product[] }) {
  const inventory = useInventory(initial);
  const products = inventory.products;
  const cart = useAppSelector((s) => s.cart);
  const dispatch = useAppDispatch();
  const summary = getCartSummary(cart.items, products, cart.pharmacy);
  const [checkout, { isLoading, error }] = useCheckoutMutation();
  const [result, setResult] = useState<CheckoutResponse | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: { pickup: 'today', acknowledge: false },
  });
  const pharmacy = pharmacies.find((p) => p.id === cart.pharmacy)!;
  async function submit(values: CheckoutFormValues) {
    if (!summary.valid || isLoading || !inventory.ready) return;
    try {
      const response = await checkout({
        ...values,
        items: cart.items,
        pharmacy: cart.pharmacy,
      }).unwrap();
      setResult(response);
      dispatch(clearCart());
    } catch {
      /* RTK Query provides the error state below. */
    }
  }
  if (!result && !inventory.ready)
    return <InventoryStatus error={inventory.error} retry={inventory.refetch} />;
  return (
    <main id="main" className="container prose">
      {result ? (
        <Result
          status="success"
          title="Демонстрация завершена"
          subTitle={`${result.reference} · ${result.count} шт. · ${money(result.total)}`}
          extra={<ActionLink href="/">Вернуться в каталог</ActionLink>}
        >
          <p>
            {result.message} Данные не переданы в аптеку, товары не зарезервированы, оплата не
            списана.
          </p>
        </Result>
      ) : (
        <>
          <Link href="/cart" className="back-link">
            ← Назад в корзину
          </Link>
          <h1>Получение заказа</h1>
          <p className="muted">Последний шаг учебного сценария. Личные данные не нужны.</p>
          {!cart.hydrated ? (
            <Skeleton active />
          ) : !cart.items.length ? (
            <Empty description="Сначала добавьте товары в корзину">
              <Link href="/">Открыть каталог →</Link>
            </Empty>
          ) : (
            <form className={`panel ${styles.form}`} onSubmit={handleSubmit(submit)} noValidate>
              <Alert
                showIcon
                type="info"
                title="Это демонстрационное оформление"
                description="Проверьте аптеку, день получения и состав корзины. Реального бронирования или покупки не произойдёт."
              />
              <section>
                <h2>1. Аптека</h2>
                <strong>{pharmacy.name}</strong>
                <p className="muted">
                  {pharmacy.address}
                  <br />
                  Режим работы: {pharmacy.hours}
                </p>
                <Link href="/cart" className="back-link">
                  Изменить аптеку в корзине
                </Link>
              </section>
              <fieldset>
                <legend>2. Когда вам удобно?</legend>
                <Controller
                  name="pickup"
                  control={control}
                  render={({ field }) => (
                    <Radio.Group {...field} aria-label="День получения">
                      <Radio value="today">Сегодня</Radio>
                      <Radio value="tomorrow">Завтра</Radio>
                    </Radio.Group>
                  )}
                />
              </fieldset>
              <div className={styles.total}>
                <span>{summary.count} шт. · самовывоз</span>
                <strong>{money(summary.total)}</strong>
              </div>
              <Controller
                name="acknowledge"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    onBlur={field.onBlur}
                    ref={field.ref}
                    aria-describedby={errors.acknowledge ? 'ack-error' : undefined}
                    aria-invalid={Boolean(errors.acknowledge)}
                  >
                    Я понимаю, что это учебный сценарий без реального заказа
                  </Checkbox>
                )}
              />
              {errors.acknowledge && (
                <p id="ack-error" role="alert" className={styles.error}>
                  {errors.acknowledge.message}
                </p>
              )}
              {!summary.valid && (
                <Alert
                  showIcon
                  type="warning"
                  title="Проверьте корзину"
                  description="Некоторые товары недоступны в выбранном количестве. Вернитесь в корзину."
                />
              )}
              {error && (
                <Alert
                  type="error"
                  showIcon
                  title="Не удалось завершить демонстрацию"
                  description={apiErrorMessage(error)}
                />
              )}
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={isLoading}
                disabled={!summary.valid}
              >
                Завершить демо-оформление
              </Button>
            </form>
          )}
        </>
      )}
    </main>
  );
}
