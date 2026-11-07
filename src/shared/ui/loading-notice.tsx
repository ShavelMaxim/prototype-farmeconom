import type { ReactNode } from 'react';
import styles from './loading-notice.module.css';

export function LoadingNotice({ children }: { children: ReactNode }) {
  return (
    <div className={styles.notice} role="status" aria-live="polite">
      {children}
    </div>
  );
}
