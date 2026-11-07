'use client';
import { useEffect } from 'react';
import styles from './feedback-toast.module.css';
export function FeedbackToast({
  message,
  onClose,
  onUndo,
}: {
  message: string;
  onClose: () => void;
  onUndo?: () => void;
}) {
  useEffect(() => {
    if (onUndo) return;
    const timer = setTimeout(onClose, 6000);
    return () => clearTimeout(timer);
  }, [message, onClose, onUndo]);
  return (
    <div className={styles.toast}>
      <span role="status">{message}</span>
      {onUndo && <button onClick={onUndo}>Отменить</button>}
      <button aria-label="Закрыть уведомление" onClick={onClose}>
        ×
      </button>
    </div>
  );
}
