import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carregar variáveis de ambiente baseado no modo
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    server: {
      host: true, // Expõe o servidor para acesso externo
      port: 5173, // Porta padrão
      open: true, // Abre o navegador automaticamente
    },
    build: {
      // Configurações para PWA
      assetsDir: 'assets',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
          },
        },
      },
    },
    // Garantir que as variáveis de ambiente sejam carregadas
    define: {
      'process.env': env
    }
  };
});
