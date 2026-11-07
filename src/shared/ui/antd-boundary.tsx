'use client';
import type { ReactNode } from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import { antdTheme } from '@/shared/config/antd-theme';

// Keep Ant Design's runtime with its consumers, outside the home page's startup graph.
export function AntdBoundary({ children }: { children: ReactNode }) {
  return (
    <AntdRegistry>
      <ConfigProvider locale={ruRU} theme={antdTheme}>
        {children}
      </ConfigProvider>
    </AntdRegistry>
  );
}
