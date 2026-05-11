// // import { defineConfig } from 'vite'
// // import react from '@vitejs/plugin-react'

// // // https://vite.dev/config/
// // export default defineConfig({
// //   plugins: [react()],
// // })

// // import { defineConfig } from 'vite'
// // import react from '@vitejs/plugin-react'

// // // https://vite.dev/config/
// // export default defineConfig({
// //   plugins: [react()],
// //   build: {
// //     chunkSizeWarningLimit: 1000, 
// //   }
// // })


// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// export default defineConfig({
//   plugins: [react()],
//   build: {
//     rollupOptions: {
//       output: {
//         manualChunks(id) {
//           if (id.includes('node_modules')) {
//             if (id.includes('framer-motion')) {
//               return 'vendor-framer';
//             }
//             if (id.includes('firebase')) {
//               return 'vendor-firebase';
//             }
//             if (id.includes('lucide-react')) {
//               return 'vendor-icons';
//             }
//             return 'vendor'; 
//           }
//         }
//       }
//     }






import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // 1. Raise the warning threshold to 1500kb
    chunkSizeWarningLimit: 1500, 
    
    // 2. Keep the files split for better performance
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('framer-motion')) {
              return 'vendor-framer';
            }
            if (id.includes('firebase')) {
              return 'vendor-firebase';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            return 'vendor'; 
          }
        }
      }
    }
  }
})
//   }
// })
