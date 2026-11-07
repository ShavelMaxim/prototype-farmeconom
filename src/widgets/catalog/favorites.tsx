'use client';
import { useAppSelector } from '@/shared/lib/store-hooks';
import { useInventory } from '@/entities/product/api';
import type { Product } from '@/entities/product/model';
import { ProductGrid } from './product-grid';
import { ActionLink } from '@/shared/ui/action-link';
import { PagePlaceholder } from '@/shared/ui/page-placeholder';
export function Favorites({ products: initial }: { products: Product[] }) {
  const { favorites, hydrated, storageUnavailable } = useAppSelector((s) => s.personal);
  const pharmacy = useAppSelector((s) => s.cart.pharmacy);
  const inventory = useInventory(initial);
  const products = inventory.products.filter((p) => favorites.includes(p.id));
  return (
    <main id="main" className="container">
      <div className="page-top">
        <p className="eyebrow">СОХРАНЕНО ВАМИ</p>
        <h1>Избранное</h1>
        <p className="muted">
          Сохраните нужное, чтобы вернуться позже. Список хранится только в этом браузере.
        </p>
      </div>
      {storageUnavailable && (
        <p role="alert">
          Не удалось сохранить данные на устройстве. Список доступен только в текущем сеансе.
        </p>
      )}
      {!hydrated ? (
        <PagePlaceholder />
      ) : !favorites.length ? (
        <div className="panel empty-state">
          <span aria-hidden="true">♡</span>
          <h2>Пока ничего не сохранено</h2>
          <p className="muted">
            Нажмите сердечко на товаре. Даже отсутствующий товар можно оставить в избранном.
          </p>
          <ActionLink href="/">Найти товары</ActionLink>
        </div>
      ) : (
        <>
          {favorites.length > products.length && inventory.ready && (
            <p className="muted">Часть сохранённых товаров больше не представлена в каталоге.</p>
          )}
          {inventory.isError && (
            <div role="alert" className="panel">
              <p>Не удалось обновить цены и наличие.</p>
              <button onClick={inventory.refetch}>Повторить</button>
            </div>
          )}
        </>
      )}
      {hydrated && (
        <ProductGrid
          products={products}
          pharmacy={pharmacy}
          busy={inventory.isFetching || inventory.isError || !inventory.ready}
        />
      )}
    </main>
  );
}
