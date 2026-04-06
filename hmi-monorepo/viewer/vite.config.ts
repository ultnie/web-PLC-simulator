import {defineConfig, loadEnv} from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({mode}) => {
    // .env, .env.development и т.д.
    const env = loadEnv(mode, process.cwd(), '')

    /** fallback = http://localhost:5000  */
    const backend = env.VITE_BACKEND_URL || 'http://localhost:5000'

    return {
        plugins: [vue()],
        resolve: {alias: {'@': '/src'}},
        server: {
            port: Number(env.VITE_PORT),
            proxy: {
                '/sessions': {
                    target: backend,
                    changeOrigin: true,
                    secure: false,
                    rewrite: p => p,          // /sessions → /sessions
                },
            },
        },
    }
})
