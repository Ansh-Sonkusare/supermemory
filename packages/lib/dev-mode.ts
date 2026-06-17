export const API_KEY =
	typeof process !== "undefined" ? process.env.NEXT_PUBLIC_API_KEY : undefined
export const isApiKeyMode = !!API_KEY
export const BACKEND_URL =
	process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://api.supermemory.ai"
