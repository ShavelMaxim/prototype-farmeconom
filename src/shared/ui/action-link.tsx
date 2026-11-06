import Link from 'next/link';
import type { ReactNode } from 'react';
import styles from './action-link.module.css';

// Navigation stays a real link; never nest a button inside an anchor.
export function ActionLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link prefetch={false} href={href} className={styles.link}>
      {children}
    </Link>
  );
}
