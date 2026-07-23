import { createServerFn } from "@tanstack/react-start";

export const getPublicConfig = createServerFn({ method: "GET" }).handler(() => {
  const apiUrl = process.env.API_URL;
  const bucketUrl = process.env.BUCKET_URL;

  if (!apiUrl || !bucketUrl) {
    throw new Error("API_URL and BUCKET_URL must be set");
  }

  return { apiUrl, bucketUrl };
});
