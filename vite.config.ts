import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    define: {
      // Polyfill process.env.API_KEY so it can be accessed in the client code
      // This pulls from Netlify Environment Variables during 'npm run build'
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
  };
});