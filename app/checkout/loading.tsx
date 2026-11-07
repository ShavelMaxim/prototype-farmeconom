import { AntdBoundary } from '@/shared/ui/antd-boundary';
import { Skeleton } from 'antd';
export default function CheckoutLoading() {
  return (
    <AntdBoundary>
      <main id="main" className="container prose" aria-busy="true">
        <h1>Получение заказа</h1>
        <div className="panel">
          <Skeleton active paragraph={{ rows: 6 }} />
        </div>
      </main>
    </AntdBoundary>
  );
}
