export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-02-11'

export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  'Missing environment variable: NEXT_PUBLIC_SANITY_DATASET'
)

const rawProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
console.log('Raw Project ID:', rawProjectId); // Debug line

// Validate projectId format
if (rawProjectId && !/^[a-z0-9_-]+$/.test(rawProjectId)) {
  throw new Error(`Invalid Sanity projectId format: "${rawProjectId}". Only lowercase letters, numbers, underscores, and dashes are allowed.`);
}

export const projectId = assertValue(
  rawProjectId,
  'Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID'
)

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    throw new Error(errorMessage)
  }

  return v
}