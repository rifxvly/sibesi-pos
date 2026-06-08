import crypto from "crypto";

const baseURL = process.env.WIJAYAPAY_MODE === "sandbox"
  ? "https://sandbox.wijayapay.com/api"
  : "https://wijayapay.com/api";

export const wijayapayMethods = {
  QRIS: "QRIS",
  BCA_VA: "VA_BCA",
  BNI_VA: "VA_BNI",
  MANDIRI_VA: "VA_MANDIRI",
  BRI_VA: "VA_BRI",
  CARD: "CC"
} as const;

export type WijayapayMethod = (typeof wijayapayMethods)[keyof typeof wijayapayMethods];

function generateSignature(refId: string): string {
  const merchantCode = process.env.WIJAYAPAY_MERCHANT_CODE;
  const apiKey = process.env.WIJAYAPAY_API_KEY;

  if (!merchantCode || !apiKey) {
    throw new Error("WijayaPay credentials are not configured.");
  }

  return crypto.createHash("md5").update(merchantCode + apiKey + refId).digest("hex");
}

export async function createWijayapayTransaction(
  method: WijayapayMethod,
  refId: string,
  amount: number
) {
  const merchantCode = process.env.WIJAYAPAY_MERCHANT_CODE;
  const apiKey = process.env.WIJAYAPAY_API_KEY;

  if (!merchantCode || !apiKey) {
    throw new Error("WijayaPay credentials are not configured.");
  }

  const signature = generateSignature(refId);

  const body = new URLSearchParams({
    code_merchant: merchantCode,
    api_key: apiKey,
    ref_id: refId,
    code_payment: method,
    nominal: Math.round(amount).toString()
  });

  const response = await fetch(`${baseURL}/transaction/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
      "X-Signature": signature
    },
    body
  });

  const data = await response.json();

  return data as {
    success: boolean;
    message?: string;
    data?: {
      payment_name?: string;
      payment_method?: string;
      total_bayar?: number;
      total_fee?: number;
      total_diterima?: number;
      ref_id?: string;
      trx_reference?: string;
      expired?: string;
      tutorial_pembayaran?: string;
      callback_url?: string;
      qr_image?: string;
      qr_string?: string;
      va_number?: string;
      url_payment?: string;
    };
  };
}

export async function checkWijayapayStatus(refId: string) {
  const merchantCode = process.env.WIJAYAPAY_MERCHANT_CODE;
  const apiKey = process.env.WIJAYAPAY_API_KEY;

  if (!merchantCode || !apiKey) {
    throw new Error("WijayaPay credentials are not configured.");
  }

  const url = new URL(`${baseURL}/get-status`);
  url.searchParams.set("code_merchant", merchantCode);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("ref_id", refId);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json"
    }
  });

  const data = await response.json();

  return data as {
    success: boolean;
    message?: string;
    data?: {
      ref_id?: string;
      status?: string;
      nominal?: string;
      trx_reference?: string;
    };
  };
}
