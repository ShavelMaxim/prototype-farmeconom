import React from 'react';
import { afterEach, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { Providers } from './providers';
import { useAppSelector } from '@/shared/lib/store-hooks';
function Status() {
  const hydrated = useAppSelector((s) => s.cart.hydrated);
  return <output>{hydrated ? 'ready' : 'pending'}</output>;
}
afterEach(cleanup);
it('восстанавливает клиентский store даже без запросов RTK Query', async () => {
  render(
    <Providers>
      <Status />
    </Providers>,
  );
  expect(await screen.findByText('ready')).toBeInTheDocument();
});
