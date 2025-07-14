// client.ts
import { createClient } from 'next-sanity';
import { apiVersion, dataset, projectId } from '../env';

if (!projectId || !dataset || !apiVersion) {
  throw new Error("Sanity client configuration is missing required values.");
}

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  stega: {
    studioUrl: process.env.VERCLE_URL === 'production'
      ? `https://${process.env.VERCLE_URL}/studio`
      : `${process.env.NEXT_PUBLIC_BASE_URL}/studio`
  },
});