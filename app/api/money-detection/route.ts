import { NextRequest, NextResponse } from "next/server";

import { ensureAdminApi } from "@/lib/access";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

const MODELS = [
  "google/gemma-4-31b-it:free",
  "google/gemma-4-26b-a4b-it:free",
  "nvidia/nemotron-nano-12b-v2-vl:free",
  "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
];

export async function POST(request: NextRequest) {
  const guard = await ensureAdminApi();

  if (guard) {
    return guard;
  }

  if (!OPENROUTER_API_KEY) {
    return NextResponse.json(
      { error: "OPENROUTER_API_KEY tidak dikonfigurasi" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { imageBase64 } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { error: "Gambar uang tidak ditemukan" },
        { status: 400 }
      );
    }

    const prompt = `Anda adalah ahli autentikasi uang kertas Indonesia (Rupiah). Analisis gambar ini dengan detail dan berikan hasil dalam format JSON yang STRICT.

PENTING: Anda HARUS menentukan sendiri NOMINAL uang yang terlihat di gambar. JANGAN meminta user memilih nominal.

Aturan analisis:
1. Identifikasi NOMINAL uang yang terlihat di gambar (1000, 2000, 5000, 10000, 20000, 50000, 100000). Lihat angka, warna dominan, dan ukuran untuk menentukan nominal.
2. Berikan PERSENTASE KEASLIAN (0-100) berdasarkan:
   - Kesesuaian warna dengan nominal yang seharusnya
   - Kualitas cetak dan detail tekstur
   - Keberadaan fitur keamanan (watermark, garis pengaman, dll)
   - Keseluruhan kualitas dan proporsi uang
3. Tentukan STATUS: "ASLI" (>=70%), "DIRAGUKAN" (40-69%), atau "PALSU" (<40%)

Kembalikan HANYA JSON dengan format ini TANPA text tambahan:
{
  "nominal": <angka nominal yang Anda deteksi dari gambar>,
  "confidence": <angka 0-100>,
  "status": "<ASLI|DIRAGUKAN|PALSU>",
  "details": {
    "warna": "<deskripsi singkat analisis warna>",
    "tekstur": "<deskripsi singkat analisis tekstur/cetak>",
    "fiturKeamanan": "<deskripsi singkat fitur keamanan terdeteksi>"
  }
}

Jika gambar tidak jelas atau bukan uang Indonesia, berikan nominal: 0, confidence: 0, status: "PALSU".`;

    let lastError: Error | null = null;

    for (const model of MODELS) {
      try {
        console.log(`Mencoba model: ${model}`);
        
        const response = await fetch(OPENROUTER_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "SiBesi POS Money Detector",
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "image_url",
                    image_url: {
                      url: imageBase64,
                    },
                  },
                  {
                    type: "text",
                    text: prompt,
                  },
                ],
              },
            ],
            max_tokens: 500,
            temperature: 0.1,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          console.warn(`Model ${model} gagal (HTTP ${response.status}):`, JSON.stringify(errorData));
          lastError = new Error(`Model ${model} gagal: ${response.status} - ${JSON.stringify(errorData)}`);
          continue;
        }

        const data = await response.json();
        console.log(`Model ${model} berhasil, response:`, JSON.stringify(data).substring(0, 200));
        
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
          lastError = new Error("Tidak ada response dari AI");
          continue;
        }

        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          lastError = new Error("Response AI tidak valid");
          continue;
        }

        const result = JSON.parse(jsonMatch[0]);

        return NextResponse.json({
          nominal: result.nominal || 0,
          confidence: result.confidence || 0,
          status: result.status || "PALSU",
          details: result.details || {
            warna: "Tidak dapat dianalisis",
            tekstur: "Tidak dapat dianalisis",
            fiturKeamanan: "Tidak dapat dianalisis",
          },
        });
      } catch (modelError) {
        console.warn(`Model ${model} error:`, modelError);
        lastError = modelError as Error;
        continue;
      }
    }

    return NextResponse.json(
      { error: "Semua model AI gagal. Coba lagi nanti.", detail: lastError?.message },
      { status: 500 }
    );
  } catch (error) {
    console.error("Money detection error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menganalisis uang" },
      { status: 500 }
    );
  }
}
