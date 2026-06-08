const { PrismaClient } = require('@prisma/client');
const { authenticator } = require('otplib');

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({ where: { username: 'admin' } });
  if (user && user.mfaSecret) {
    console.log('=== KODE RAHASIA ADMIN ===');
    console.log('MFA Secret Key:', user.mfaSecret);
    
    authenticator.options = { digits: 6, step: 30 };
    const token = authenticator.generate(user.mfaSecret);
    console.log('OTP Saat Ini (berlaku 30 detik):', token);
  } else {
    console.log('MFA belum aktif untuk admin.');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
