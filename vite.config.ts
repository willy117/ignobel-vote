
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 設定為相對路徑 './'，這樣無論部署到 GitHub Pages 的哪個子目錄
  // (例如 user.github.io/repo-name/) 都能正確讀取資源。
  // 注意：這需要配合 HashRouter 使用 (您已在 App.tsx 中使用 HashRouter)。
  base: './',
});
