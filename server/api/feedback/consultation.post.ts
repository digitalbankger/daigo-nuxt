import { createError, defineEventHandler, readBody } from "h3";

interface ConsultationRequest {
  type: "product";
  product_id: string;
  phone_number: string;
  name: string;
}

export default defineEventHandler(async (event) => {
  const body = await readBody<Partial<ConsultationRequest>>(event);

  const payload: ConsultationRequest = {
    type: "product",
    product_id: String(body?.product_id || "").trim(),
    phone_number: String(body?.phone_number || "").replace(/\D/g, ""),
    name: String(body?.name || "").trim(),
  };

  if (
    body?.type !== "product" ||
    !payload.product_id ||
    !payload.name ||
    payload.phone_number.length < 10 ||
    payload.phone_number.length > 15
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: "Некорректные данные формы консультации",
      data: { message: "Проверьте имя и номер телефона" },
    });
  }

  const {
    public: { daigoApiBase },
  } = useRuntimeConfig();

  try {
    return await $fetch("/v1/shop/feedback/consultation", {
      baseURL: daigoApiBase,
      method: "POST",
      body: payload,
    });
  } catch (error: any) {
    const statusCode = Number(
      error?.response?.status || error?.statusCode || error?.status || 502,
    );

    throw createError({
      statusCode: statusCode >= 400 && statusCode < 600 ? statusCode : 502,
      statusMessage: "Не удалось отправить заявку на консультацию",
      data: {
        message:
          error?.data?.message ||
          error?.response?._data?.message ||
          "Сервис консультаций временно недоступен",
      },
    });
  }
});
