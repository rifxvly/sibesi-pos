import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

function getKey() {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw || raw.length !== 64) {
    throw new Error("ENCRYPTION_KEY must be a 64 character hex string.");
  }
  return Buffer.from(raw, "hex");
}

export function encrypt(text: string) {
  const iv = randomBytes(16);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [iv.toString("hex"), encrypted.toString("hex"), tag.toString("hex")].join(":");
}

export function decrypt(payload: string) {
  const [ivHex, encryptedHex, tagHex] = payload.split(":");
  const decipher = createDecipheriv("aes-256-gcm", getKey(), Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, "hex")),
    decipher.final()
  ]);

  return decrypted.toString("utf8");
}
