import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
	reactStrictMode: true,
	images: {
		remotePatterns: [{ protocol: 'https', hostname: '**' }],
	},
	async redirects() {
		return [
			{
				source: '/books/:id',
				destination: '/book/:id',
				permanent: true,
			},
			{
				source: '/chat',
				destination: '/chats',
				permanent: true,
			},
			{
				source: '/login',
				destination: '/auth/sign-in',
				permanent: true,
			},
		];
	},
	webpack: config => {
		config.resolve.alias = {
			...(config.resolve.alias ?? {}),
			'@': path.resolve(__dirname),
		};
		return config;
	},
};

export default nextConfig;
