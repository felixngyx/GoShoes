import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		host: true,
		port: 4567,
		https: {
			key: fs.readFileSync('./certs/key.pem'),
			cert: fs.readFileSync('./certs/cert.pem'),
		},
	},
});
