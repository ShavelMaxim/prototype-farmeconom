import type { ThemeConfig } from 'antd';

// Shared visual tokens for all Ant Design components.
export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: '#23786b',
    colorInfo: '#23786b',
    colorText: '#152c31',
    colorTextSecondary: '#576d73',
    colorBgLayout: '#f2f5f5',
    colorBorder: '#dce5e5',
    borderRadius: 12,
    fontFamily: "'Segoe UI', Arial, sans-serif",
    controlHeight: 44,
  },
  components: {
    Button: {
      fontWeight: 600,
      primaryShadow: 'none',
      colorPrimary: '#54dfc4',
      colorPrimaryHover: '#75e8d1',
      colorPrimaryActive: '#41c8af',
      primaryColor: '#10372f',
    },
    Input: { activeShadow: '0 0 0 3px #23786b18' },
  },
};
