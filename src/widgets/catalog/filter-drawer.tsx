import { AntdBoundary } from '@/shared/ui/antd-boundary';
import type { ReactNode } from 'react';
import { Button, Drawer } from 'antd';
export default function FilterDrawer({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <AntdBoundary>
      <Drawer
        title="Категории и фильтры"
        open
        onClose={onClose}
        footer={
          <Button type="primary" block onClick={onClose}>
            Показать товары
          </Button>
        }
      >
        {children}
      </Drawer>
    </AntdBoundary>
  );
}
