import { EventEmitter } from 'events';

// Set the default max listeners
EventEmitter.defaultMaxListeners = 0;

console.log(`New defaultMaxListeners set to: ${EventEmitter.defaultMaxListeners}`);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Add other Next.js configurations here if needed
};

export default nextConfig;