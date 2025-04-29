import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { mediapipe } from 'vite-plugin-mediapipe'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        mediapipe(),
        viteStaticCopy({
            targets: [
                {
                    src: path.resolve(__dirname, './static') + '/[!.]*',
                    dest: './static',
                },
            ],
        }),
    ],
})
