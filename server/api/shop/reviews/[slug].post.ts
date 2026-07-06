import {
  createError,
  defineEventHandler,
  getHeader,
  getRouterParam,
  readBody,
  readMultipartFormData,
} from "h3";
import { ofetch } from "ofetch";

function normalizeBase(value: unknown) {
  return String(value || "https://api.daigo.ru").replace(/\/+$/, "");
}

function errorMessage(error: any) {
  return (
    error?.data?.message ||
    error?.data?.error ||
    error?.response?._data?.message ||
    error?.response?._data?.error ||
    error?.statusMessage ||
    "Не удалось отправить отзыв"
  );
}

function throwUpstreamError(error: any): never {
  const statusCode = Number(
    error?.response?.status || error?.statusCode || error?.status || 500,
  );

  throw createError({
    statusCode,
    statusMessage: String(errorMessage(error)),
    data: error?.data || error?.response?._data,
  });
}

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug");
  const base = normalizeBase(useRuntimeConfig(event).public.daigoApiBase);
  const authorization = getHeader(event, "authorization");
  const contentType = String(
    getHeader(event, "content-type") || "",
  ).toLowerCase();

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: "Product slug is required",
    });
  }

  if (!authorization) {
    throw createError({
      statusCode: 401,
      statusMessage: "Authorization is required",
    });
  }

  const url = `${base}/v1/shop/reviews/${encodeURIComponent(String(slug))}`;

  if (contentType.includes("multipart/form-data")) {
    const parts = await readMultipartFormData(event);

    if (!parts?.length) {
      throw createError({
        statusCode: 400,
        statusMessage: "Multipart form is empty",
      });
    }

    const formData = new FormData();

    for (const part of parts) {
      if (!part.name) continue;

      if (part.filename) {
        const type = part.type || "application/octet-stream";
        const blob = new Blob([part.data as any], { type });
        (formData as any).append(part.name, blob, part.filename);
      } else {
        formData.append(part.name, part.data.toString("utf8"));
      }
    }

    try {
      const headers: Record<string, string> = {};
      if (authorization) headers.Authorization = authorization;

      return await ofetch(url, {
        method: "POST",
        headers,
        body: formData,
        retry: 0,
        timeout: 120000,
      });
    } catch (error: any) {
      throwUpstreamError(error);
    }
  }

  const body = await readBody<{
    author?: string;
    rating?: number;
    title?: string;
    text?: string;
    tags?: string[];
    media?: Array<{ type: "image" | "video"; thumb?: string; src?: string }>;
    daigo_id?: number | string;
  }>(event);

  if (!body?.daigo_id) {
    throw createError({
      statusCode: 400,
      statusMessage: "daigo_id is required",
    });
  }

  if (!body?.author || !body?.text || !body?.rating) {
    throw createError({
      statusCode: 400,
      statusMessage: "Review fields are required",
    });
  }

  try {
    return await ofetch(url, {
      method: "POST",
      headers: {
        Authorization: authorization,
        "Content-Type": "application/json",
      },
      body,
      retry: 0,
      timeout: 10000,
    });
  } catch (error: any) {
    throwUpstreamError(error);
  }
});
