
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('password123', 10);
  await prisma.user.update({
    where: { email: 'irahulkv@gmail.com' },
    data: { password: hash }
  });
  console.log('Password updated to: password123');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
