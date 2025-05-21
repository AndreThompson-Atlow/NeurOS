
import type {NextConfig} from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer, webpack }) => {
    // Initialize alias and fallback objects if they don't exist
    config.resolve.alias = config.resolve.alias || {};
    config.resolve.fallback = config.resolve.fallback || {};

    // Define path to the empty stub module
    const emptyModulePath = path.resolve(__dirname, 'stubs/empty.js');

    if (!isServer) {
      console.log("Applying client-side webpack fallbacks for problematic Node.js modules...");
      // Handle async_hooks: Alias to empty module AND set fallback to false
      config.resolve.alias['async_hooks'] = emptyModulePath;
      config.resolve.alias['node:async_hooks'] = emptyModulePath;
      config.resolve.fallback['async_hooks'] = false; // Important: set to false
      config.resolve.fallback['node:async_hooks'] = false; // Important: set to false

      // Handle @opentelemetry/context-async-hooks: Alias to empty module AND set fallback to false
      config.resolve.alias['@opentelemetry/context-async-hooks'] = emptyModulePath;
      config.resolve.fallback['@opentelemetry/context-async-hooks'] = false; // Important: set to false

      // Handle @opentelemetry/sdk-trace-node: Alias to empty module AND set fallback to false
      // This is the parent package often causing issues by pulling in context-async-hooks.
      config.resolve.alias['@opentelemetry/sdk-trace-node'] = emptyModulePath;
      config.resolve.fallback['@opentelemetry/sdk-trace-node'] = false; // Important: set to false
      
    } else {
      // Server-side specific configurations can go here if needed
      console.log("Webpack running for server-side build.");
    }

    // Alias for empty-undici.js (used by NormalModuleReplacementPlugin)
    config.resolve.alias['./empty-undici.js'] = path.resolve(__dirname, './empty-undici.js');

    // Fix for issue with genkit-tools and undici
    config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
            /undici$/,
            (resource: any) => {
                if (resource.context.includes('node_modules/@genkit-ai/tools-common') ||
                    resource.context.includes('node_modules/langchain_core') ||
                    resource.context.includes('node_modules/@langchain/core')
                   ) {
                    resource.request = './empty-undici.js'; 
                }
            }
        )
    );
    
    return config;
  },
};

export default nextConfig;
