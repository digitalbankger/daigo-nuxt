// services/remarketingService.ts
import { useRuntimeConfig } from "#imports";

export type RemarketingPercent = 3 | 5;

export interface RemarketingParams {
  percent: RemarketingPercent;
  daigoId?: number | string | null;
  sessionId?: string | null;
}

export async function sendRemarketing(
  params: RemarketingParams,
): Promise<void> {
  const { percent, daigoId, sessionId } = params;
  const {
    public: { daigoApiBase },
  } = useRuntimeConfig();

  const qs = new URLSearchParams();
  qs.set("percent", String(percent));

  if (daigoId) {
    qs.set("daigoId", String(daigoId));
  } else if (sessionId) {
    qs.set("session_id", sessionId);
  }

  const url = `${daigoApiBase}/v1/shop/promotion/remarketing?${qs.toString()}`;

  await $fetch(url, {
    method: "POST",
  });
}
