import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {VitePWA} from 'vite-plugin-pwa';
export default defineConfig({plugins:[react(),VitePWA({registerType:'prompt',includeAssets:['icon-192.png','icon-512.png'],manifest:{name:'Perfume Studio — Formulation & Costing',short_name:'Perfume Studio',description:'Offline perfume formulation, production costing, and pricing',theme_color:'#3457d5',background_color:'#f0f5ff',display:'standalone',start_url:'/',scope:'/',icons:[{src:'/icon-192.png',sizes:'192x192',type:'image/png',purpose:'any maskable'},{src:'/icon-512.png',sizes:'512x512',type:'image/png',purpose:'any maskable'}]},workbox:{globPatterns:['**/*.{js,css,html,svg,png,ico}'],navigateFallback:'/index.html',cleanupOutdatedCaches:true}})]});
