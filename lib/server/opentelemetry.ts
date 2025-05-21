// lib/server/opentelemetry.ts
'use server'; // Ensuring this is treated as a server module if imported by client components

let sdk: any = {}; // Default to an empty object for client-side or if not initialized

if (typeof window === 'undefined') {
  try {
    // Dynamically require to avoid webpack errors if package is not always available
    // or to ensure it's only loaded in Node.js environment.
    const { NodeSDK } = require('@opentelemetry/sdk-node');
    
    // Basic configuration example. Users should customize this.
    // Ensure all dependencies for NodeSDK are correctly handled for server-only.
    // For example, if @opentelemetry/sdk-trace-node is problematic even on server for some reason,
    // this approach might need more advanced conditional loading or splitting.
    sdk = new NodeSDK({
      // Example: Add desired exporters, resource detectors, etc.
      // traceExporter: new ConsoleSpanExporter(), // Placeholder
      // instrumentations: [] // Placeholder for instrumentations
    });

    // It's important to start the SDK
    // sdk.start(); // Uncomment and configure properly if using direct NodeSDK
    console.log("OpenTelemetry NodeSDK conditionally initialized on the server.");

  } catch (error) {
    console.warn("OpenTelemetry NodeSDK could not be initialized on the server:", error);
    // Fallback to empty object if there's an issue during server-side require/init
    sdk = {};
  }
} else {
    console.log("OpenTelemetry NodeSDK skipped on the client.");
}

export default sdk;
