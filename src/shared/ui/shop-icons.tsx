'use client';
// The icon package uses React context. Expose a narrow client boundary so
// otherwise static Server Components do not import that context on the server.
export { ArrowRightOutlined, EnvironmentOutlined, AppstoreOutlined } from '@ant-design/icons';
