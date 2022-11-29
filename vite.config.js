// vite.config.js / vite.config.ts
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default {

	root: 'src', // everything from now is relative to this!
	//publicDir: '/assets/',
	build: {
		outDir: '../build',
		minify: true,
		emptyOutDir: true,
	},
	plugins: [
		viteStaticCopy({
			targets: [
				{
					src: 'netlify.toml', // relative to root
					dest: '' // relative to outDir
				},
				{
					src: 'assets', // relative to root
					dest: '' // relative to outDir
				},
				{
					src: 'components/**/*.css', // relative to root
					dest: 'components' // relative to outDir
				},
			]
		})
	]
}
