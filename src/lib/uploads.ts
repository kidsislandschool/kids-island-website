import path from "node:path";

/**
 * Uploads must live inside /public so Next.js can serve them. UPLOAD_DIR is
 * resolved relative to the project root and rejected if it escapes /public.
 */
export function getPublicDir() {
  return path.resolve(process.cwd(), "public");
}

export function getUploadRoot() {
  const configured = process.env.UPLOAD_DIR?.trim();
  const root = configured
    ? path.resolve(process.cwd(), configured)
    : path.join(getPublicDir(), "uploads");
  const relative = path.relative(getPublicDir(), root);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("UPLOAD_DIR must point to a directory inside the project's public/ folder.");
  }
  return root;
}

export function getUploadUrlPrefix() {
  const relative = path.relative(getPublicDir(), getUploadRoot()).split(path.sep).filter(Boolean).join("/");
  return `/${relative}`;
}