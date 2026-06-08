export type DummyPaymentMethod = "qris" | "card" | "bca_va" | "bni_va" | "mandiri_va";

export type DummyPaymentResponse = {
  provider: "dummy";
  orderId: string;
  amount: number;
  status: string;
  pay_url?: string;
  qr_string?: string;
  va_number?: string;
  instructions?: string[];
  expiresAt: string;
  reference: string;
};

export function createDummyPayment(
  method: DummyPaymentMethod,
  orderId: string,
  amount: number
): DummyPaymentResponse {
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  const reference = `DUMMY-${orderId}`;

  if (method === "qris") {
    return {
      provider: "dummy",
      orderId,
      amount,
      status: "pending",
      pay_url: `https://dummy.sibesi.local/qris/${orderId}`,
      qr_string: `00020101021226670016COM.DUMMY.SIBESI011893600000000000000802ID5911SIBESI POS6007JAKARTA61051234062070703A016304${orderId.slice(-4)}`,
      instructions: [
        "Scan QR ini melalui aplikasi Dana, Gopay, OVO, atau dompet digital lainnya.",
        "Mode simulasi: gunakan tombol konfirmasi untuk menyelesaikan pembayaran."
      ],
      expiresAt,
      reference
    };
  }

  if (method === "card") {
    const authCode = `AUTH-${Date.now().toString(36).toUpperCase()}-${orderId.slice(-4)}`;
    return {
      provider: "dummy",
      orderId,
      amount,
      status: "pending",
      pay_url: `https://dummy.sibesi.local/card/${orderId}`,
      reference,
      va_number: authCode,
      instructions: [
        "Transaksi kartu debit/kredit sedang diproses.",
        `Authorization Code: ${authCode}`,
        "Mode simulasi: klik konfirmasi untuk menyelesaikan pembayaran kartu."
      ],
      expiresAt
    };
  }

  return {
    provider: "dummy",
    orderId,
    amount,
    status: "pending",
    pay_url: `https://dummy.sibesi.local/va/${orderId}`,
    va_number: `8808${Date.now().toString().slice(-10)}`,
    instructions: [
      "Nomor VA ini hanya simulasi lokal.",
      "Tidak terhubung ke bank atau gateway sungguhan."
    ],
    expiresAt,
    reference
  };
}
