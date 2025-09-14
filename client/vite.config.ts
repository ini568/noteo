import { defineConfig } from "vite";

export default defineConfig(async () => {
  // динамический импорт ESM-only плагина
  const reactPlugin = (await import("@vitejs/plugin-react")).default;

  return {
    plugins: [reactPlugin()],
    server: {
      port: 5173
    }
  };
});
