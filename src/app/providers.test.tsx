import React from 'react';
import { afterEach, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { Providers } from './providers';
import { useAppSelector } from '@/shared/lib/store-hooks';
function Status() {
  const cart = useAppSelector((s) => s.cart);
  return (
    <output>{cart.hydrated ? `ready:${cart.pharmacy}:${cart.items.length}` : 'pending'}</output>
  );
}
afterEach(() => {
  cleanup();
  localStorage.clear();
});
it('восстанавливает клиентский store даже без запросов RTK Query', async () => {
  render(
    <Providers>
      <Status />
    </Providers>,
  );
  expect(await screen.findByText('ready:central:0')).toBeInTheDocument();
});
it('восстанавливает сохранённые аптеку и товары после hydration', async () => {
  localStorage.setItem(
    'apteka-ryadom:cart:v1',
    JSON.stringify({ pharmacy: 'park', items: [{ id: 'product-2', quantity: 2 }] }),
  );
  render(
    <Providers>
      <Status />
    </Providers>,
  );
  expect(await screen.findByText('ready:park:1')).toBeInTheDocument();
});
it('повреждённый JSON не блокирует восстановление интерфейса', async () => {
  localStorage.setItem('apteka-ryadom:cart:v1', '{broken');
  render(
    <Providers>
      <Status />
    </Providers>,
  );
  expect(await screen.findByText('ready:central:0')).toBeInTheDocument();
});
