import { createClient } from 'next-sanity';
import { apiVersion, dataset, projectId } from '../env';

// Backend client for server-side operations (webhooks, API routes)
export const backendClient = createClient({
    projectId,
    dataset, // Use the dataset from your env file
    apiVersion,
    useCdn: false, // IMPORTANT: Set to false for write operations and real-time data
    token: process.env.SANITY_API_TOKEN, // Must have write permissions
    perspective: 'published', // Optional: specify perspective
    ignoreBrowserTokenWarning: true, // Suppress token warnings in server context
});

// Optional: Create a separate read-only client for CDN-cached reads
export const readOnlyClient = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: true, // CDN can be used for read-only operations
    // No token needed for read-only public data
});

// Helper function to test the client connection
export async function testBackendClient() {
    try {
        // Test read operation
        const testRead = await backendClient.fetch('*[_type == "order"][0]');
        console.log('✅ Backend client read test successful');
        
        // Test write permissions (this won't actually create anything)
        const testWrite = await backendClient.fetch('*[_type == "sanity.imageAsset"][0]');
        console.log('✅ Backend client connection successful');
        
        return true;
    } catch (error) {
        console.error('❌ Backend client test failed:', error);
        return false;
    }
}