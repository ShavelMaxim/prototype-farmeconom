import type { ThemeConfig } from 'antd';

// Shared visual tokens for all Ant Design components.
export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: '#176b52',
    colorInfo: '#176b52',
    colorText: '#203c35',
    colorBgLayout: '#f7f8f3',
    borderRadius: 12,
    fontFamily: 'Arial, Helvetica, sans-serif',
    controlHeight: 44,
  },
  components: {
    Button: { fontWeight: 600, primaryShadow: 'none' },
    Input: { activeShadow: '0 0 0 3px #176b5218' },
  },
};
