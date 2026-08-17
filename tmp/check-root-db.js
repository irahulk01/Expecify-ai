const { PrismaClient } = require("@prisma/client");
// Manually set URL to root dev.db
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "file:./dev.db",
    },
  },
});

async function check() {
  const user = await prisma.user.findUnique({
    where: { email: "irahulkv@gmail.com" },
  });
  console.log("User in root dev.db found:", user ? "YES" : "NO");
}

check();
