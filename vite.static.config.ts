import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
 base:process.env.NAPA_BASE_PATH || '/napa/',
 plugins:[react()],
 build:{outDir:'dist-static',emptyOutDir:true},
});
