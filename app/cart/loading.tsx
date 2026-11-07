import { AntdBoundary } from '@/shared/ui/antd-boundary';
import { Skeleton } from 'antd';
export default function CartLoading() {
  return (
    <AntdBoundary>
      <main id="main" className="container" aria-busy="true">
        <h1>Корзина</h1>
        <div className="panel">
          <Skeleton active paragraph={{ rows: 5 }} />
        </div>
      </main>
    </AntdBoundary>
  );
}
