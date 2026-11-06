import { Skeleton } from 'antd';
import styles from '@/widgets/product/product-detail.module.css';
export default function ProductLoading() {
  return (
    <main id="main" className="container" aria-label="Загружаем товар" aria-busy="true">
      <div style={{ height: 45 }} />
      <div className={styles.layout}>
        <div className="panel" style={{ height: 390 }}>
          <Skeleton active paragraph={{ rows: 6 }} />
        </div>
        <div>
          <Skeleton active paragraph={{ rows: 8 }} />
        </div>
      </div>
    </main>
  );
}
