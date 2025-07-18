// import "server-only";
import { defineLive } from "next-sanity";
import { createClient } from "@sanity/client";

// Destructure env vars for cleaner validation
const {
  SANITY_API_TOKEN: token,
  NEXT_PUBLIC_SANITY_PROJECT_ID: projectId,
  NEXT_PUBLIC_SANITY_DATASET: dataset,
} = process.env;

// Validate critical env vars
if (!token) throw new Error("Missing SANITY_API_TOKEN");
if (!projectId) throw new Error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID");
if (!dataset) throw new Error("Missing NEXT_PUBLIC_SANITY_DATASET");

// Create the live client instance
const liveClient = createClient({
  projectId,
  dataset,
  apiVersion: "2023-05-03",
  useCdn: false,
  token,
  perspective: "previewDrafts", // Optional but helps with live previews
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
