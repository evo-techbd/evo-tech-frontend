const getEnvVar = (key: string, fallback?: string) => {
	const value = process.env[key] ?? fallback;
	if (!value) {
		throw new Error(`Missing environment variable: ${key}. Set it in your .env file or Vercel Project Settings.`);
	}
	return value;
};

export const frontBaseURL = getEnvVar("NEXT_PUBLIC_FEND_URL");
export const backAPIURL = getEnvVar("NEXT_PUBLIC_BACKEND_URL", process.env.NEXT_PUBLIC_API_URL);

export const nodeEnv = process.env.NODE_ENV ?? "development";
