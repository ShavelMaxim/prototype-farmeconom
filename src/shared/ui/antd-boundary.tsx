'use client';
import { useMemo, type ReactNode } from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider, theme } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import { antdTheme } from '@/shared/config/antd-theme';
import { useAppSelector } from '@/shared/lib/store-hooks';

// Keep Ant Design's runtime with its consumers, outside the home page's startup graph.
export function AntdBoundary({ children }: { children: ReactNode }) {
  const display = useAppSelector((s) => s.personal.display);
  const configuredTheme = useMemo(() => {
    const dark = display.contrast === 'dark';
    const contrast = display.contrast !== 'standard';
    return {
      ...antdTheme,
      algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm,
      token: {
        ...antdTheme.token,
        fontSize: (16 * Number(display.scale)) / 100,
        controlHeight: Math.max(44, (44 * Number(display.scale)) / 100),
        motion: !display.reducedMotion,
        ...(contrast
          ? {
              colorPrimary: dark ? '#f4df75' : '#003e2c',
              colorInfo: dark ? '#f4df75' : '#003e2c',
              colorText: dark ? '#fff' : '#000',
              colorTextSecondary: dark ? '#dedede' : '#303030',
              colorBgContainer: dark ? '#171b19' : '#fff',
              colorBgElevated: dark ? '#171b19' : '#fff',
              colorBorder: dark ? '#999' : '#555',
            }
          : {}),
      },
    };
  }, [display]);
  return (
    <AntdRegistry>
      <ConfigProvider locale={ruRU} theme={configuredTheme}>
        {children}
      </ConfigProvider>
    </AntdRegistry>
  );
}
