import "server-only";
import { defineLive } from "next-sanity";
import { createClient } from '@sanity/client';

const token = process.env.SANITY_API_TOKEN;
if (!token) {
  throw new Error("Missing SANITY_API_TOKEN");
}

// Create a fresh client instance specifically for live functionality
const liveClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2023-05-03',
  useCdn: false,
  token,
});

export const { sanityFetch, SanityLive } = defineLive({
  // @ts-expect-error - Type conflict between different @sanity/client versions
  client: liveClient,
  serverToken: token,
  browserToken: token,
  fetchOptions: {
    revalidate: 0,
  },
});