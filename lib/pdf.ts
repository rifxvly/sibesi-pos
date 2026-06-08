import { createHash } from "crypto";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

type ContractPdfItem = {
  nama: string;
  jumlah: number;
  satuan: string;
  hargaSatuan: number;
  subtotal: number;
};

export type ContractPdfData = {
  noKontrak: string;
  customerName: string;
  customerAddress: string;
  jadwalKirim?: string;
  totalNilai: number;
  dp?: number;
  tempoPembayaran?: number;
  items: ContractPdfItem[];
};

export async function generateContractPDF(data: ContractPdfData) {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  let y = 790;

  page.drawRectangle({
    x: 32,
    y: 760,
    width: 531,
    height: 50,
    color: rgb(0.95, 0.62, 0.04)
  });
  page.drawText("KONTRAK PENJUALAN MATERIAL", {
    x: 46,
    y: 780,
    font: bold,
    size: 18,
    color: rgb(0.1, 0.11, 0.15)
  });
  page.drawText(`No. ${data.noKontrak}`, {
    x: 46,
    y: 764,
    font,
    size: 11,
    color: rgb(0.1, 0.11, 0.15)
  });

  y = 720;
  const bodyLines = [
    `Pelanggan: ${data.customerName}`,
    `Alamat: ${data.customerAddress}`,
    `Jadwal Kirim: ${data.jadwalKirim ?? "-"}`,
    `Tempo Pembayaran: ${data.tempoPembayaran ?? 0} hari`,
    `DP: Rp ${data.dp ?? 0}`
  ];

  for (const line of bodyLines) {
    page.drawText(line, { x: 46, y, font, size: 11, color: rgb(0.15, 0.15, 0.15) });
    y -= 18;
  }

  y -= 10;
  page.drawText("Daftar Material", {
    x: 46,
    y,
    font: bold,
    size: 12,
    color: rgb(0.1, 0.11, 0.15)
  });
  y -= 24;

  for (const item of data.items) {
    page.drawText(
      `${item.nama} | ${item.jumlah} ${item.satuan} x Rp ${item.hargaSatuan} = Rp ${item.subtotal}`,
      {
        x: 46,
        y,
        font,
        size: 10,
        color: rgb(0.15, 0.15, 0.15)
      }
    );
    y -= 16;
  }

  y -= 10;
  page.drawText(`Total Nilai Kontrak: Rp ${data.totalNilai}`, {
    x: 46,
    y,
    font: bold,
    size: 12,
    color: rgb(0.1, 0.11, 0.15)
  });

  const pdfBytes = await doc.save();
  const hashValue = createHash("sha256").update(Buffer.from(pdfBytes)).digest("hex");

  return {
    pdfBytes,
    hashValue
  };
}
