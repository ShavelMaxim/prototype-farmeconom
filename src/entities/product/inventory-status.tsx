'use client';
import { Alert, Button, Skeleton } from 'antd';
import { apiErrorMessage } from '@/shared/api/errors';
export function InventoryStatus({ error, retry }: { error: unknown; retry: () => unknown }) {
  return (
    <main id="main" className="container" aria-busy={!error}>
      {error ? (
        <Alert
          type="error"
          showIcon
          title="Не удалось проверить цены и наличие"
          description={apiErrorMessage(error)}
          action={<Button onClick={retry}>Повторить</Button>}
        />
      ) : (
        <div role="status" aria-label="Проверяем цены и наличие">
          <Skeleton active paragraph={{ rows: 5 }} />
        </div>
      )}
    </main>
  );
}
