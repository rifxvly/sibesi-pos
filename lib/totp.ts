import { authenticator } from "otplib";

authenticator.options = {
  digits: 6,
  step: 30
};

export function generateTotpSecret(email: string) {
  return authenticator.generateSecret();
}

export function buildTotpUri(email: string, secret: string) {
  return authenticator.keyuri(email, "SiBesi POS", secret);
}

export function verifyTotpToken(token: string, secret?: string | null) {
  if (!secret) {
    return false;
  }
  return authenticator.verify({ token, secret });
}
