'use client';
import { StarOutlined } from '@ant-design/icons';
import { setDisplay } from '@/entities/personal/model';
import { useAppDispatch, useAppSelector } from '@/shared/lib/store-hooks';
import styles from './header.module.css';

export function SeasonalToggle() {
  const festive = useAppSelector((s) => s.personal.display.festive === true);
  const hydrated = useAppSelector((s) => s.personal.hydrated);
  const dispatch = useAppDispatch();
  return (
    <button
      type="button"
      className={styles.seasonal}
      disabled={!hydrated}
      aria-label="Новогоднее оформление"
      aria-pressed={festive}
      onClick={() => dispatch(setDisplay({ festive: !festive }))}
    >
      <StarOutlined />
      <span>Новый год</span>
    </button>
  );
}
