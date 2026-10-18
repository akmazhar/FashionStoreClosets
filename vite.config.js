import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Vite configuration
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',       // Output directory for the build
    assetsDir: 'assets',  // Directory for built assets like images, fonts, etc.
    rollupOptions: {
      external: ['fsevents'],  // Mark 'fsevents' as external dependency for non-inclusion in the bundle
      input: {
        main: resolve(__dirname, 'index.html'),                 // Main entry point
        acc: resolve(__dirname, 'acc.html'),                   // Additional pages
        cart: resolve(__dirname, 'cart.html'),
        checkout: resolve(__dirname, 'checkout.html'),
        pageblackcat: resolve(__dirname, 'page-blackcat.html'),
        pagecategory: resolve(__dirname, 'page-category.html'),
        pagecellinglight: resolve(__dirname, 'page-cellinglight.html'),
        pageclocabinet: resolve(__dirname, 'page-clocabinet.html'),
        pagedslr: resolve(__dirname, 'page-dslr.html'),
        pageheadphone: resolve(__dirname, 'page-headphone.html'),
        pagehoodie: resolve(__dirname, 'page-hoodie.html'),
        pageladies: resolve(__dirname, 'page-ladies.html'),
        pagelaptop: resolve(__dirname, 'page-laptop.html'),
        pagelipstick: resolve(__dirname, 'page-lipstick.html'),
        pagemensprof: resolve(__dirname, 'page-mensprof.html'),
        pagemenswinter: resolve(__dirname, 'page-menswinter.html'),
        pageoffer: resolve(__dirname, 'page-offer.html'),
        pagepushup: resolve(__dirname, 'page-pushup.html'),
        pagesingle: resolve(__dirname, 'page-single.html'),
        pagesofadecor: resolve(__dirname, 'page-sofadecor.html'),
        pagesummernighty: resolve(__dirname, 'page-summernighty.html'),
        pagewomenscasual: resolve(__dirname, 'page-womenscasual.html'),
        script: resolve(__dirname, 'script.js'),               // JavaScript file
        style: resolve(__dirname, 'style.css')                 // CSS file
      }
    }
  }
});
