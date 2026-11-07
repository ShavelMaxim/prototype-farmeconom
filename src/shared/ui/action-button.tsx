import type { ComponentProps, ReactNode } from 'react';
import styles from './action-button.module.css';

type Props = ComponentProps<'button'> & {
  variant?: 'primary' | 'default' | 'text' | 'link';
  small?: boolean;
  icon?: ReactNode;
};
export function ActionButton({
  variant = 'default',
  small,
  icon,
  className = '',
  children,
  type = 'button',
  ...props
}: Props) {
  return (
    <button
      {...props}
      type={type}
      className={`${styles.button} ${styles[variant] ?? ''} ${small ? styles.small : ''} ${className}`}
    >
      {icon}
      {children}
    </button>
  );
}
