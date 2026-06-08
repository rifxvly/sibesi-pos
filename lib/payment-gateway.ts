import { createDummyPayment, type DummyPaymentMethod } from "@/lib/payment-dummy";
import { createWijayapayTransaction, wijayapayMethods, type WijayapayMethod } from "@/lib/wijayapay";

export type GatewayPaymentResponse = {
  amount: number;
  expiresAt?: string;
  instructions?: string[];
  orderId: string;
  pay_url?: string;
  provider: "dummy" | "wijayapay";
  qr_string?: string;
  reference?: string;
  status: string;
  va_number?: string;
};

export function isDummyPaymentMode() {
  return (process.env.PAYMENT_GATEWAY_MODE ?? "dummy") === "dummy";
}

function mapToWijayapayMethod(method: DummyPaymentMethod): WijayapayMethod {
  switch (method) {
    case "qris":
      return wijayapayMethods.QRIS;
    case "card":
      return wijayapayMethods.CARD;
    case "bca_va":
      return wijayapayMethods.BCA_VA;
    case "bni_va":
      return wijayapayMethods.BNI_VA;
    case "mandiri_va":
      return wijayapayMethods.MANDIRI_VA;
    default:
      return wijayapayMethods.BCA_VA;
  }
}

export async function createGatewayPayment(
  method: DummyPaymentMethod,
  orderId: string,
  amount: number
): Promise<GatewayPaymentResponse> {
  if (isDummyPaymentMode()) {
    return createDummyPayment(method, orderId, amount);
  }

  const wijayapayMethod = mapToWijayapayMethod(method);
  const response = await createWijayapayTransaction(wijayapayMethod, orderId, amount);

  if (response.success !== true || !response.data) {
    throw new Error(`WijayaPay error: ${response.message || "Unknown error"}`);
  }

  const result: GatewayPaymentResponse = {
    provider: "wijayapay",
    orderId,
    amount,
    status: "pending",
    reference: response.data.trx_reference ?? response.data.ref_id,
    expiresAt: response.data.expired,
    instructions: response.data.tutorial_pembayaran
      ? response.data.tutorial_pembayaran.split("\r\n").filter((line) => line.trim())
      : undefined
  };

  if (wijayapayMethod === wijayapayMethods.QRIS) {
    result.qr_string = response.data.qr_string;
    result.pay_url = response.data.qr_image;
  } else if (wijayapayMethod === wijayapayMethods.CARD) {
    result.pay_url = response.data.url_payment ?? response.data.qr_image;
  } else {
    result.va_number = response.data.va_number;
    result.pay_url = response.data.url_payment ?? response.data.qr_image;
  }

  return result;
}
