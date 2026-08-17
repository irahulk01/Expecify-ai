const { PrismaClient } = require("@prisma/client");
const { compare } = require("bcryptjs");
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
  if (user) {
    console.log("Password hash:", user.password);
    const isValid = await compare("123456", user.password);
    console.log("Is valid (123456):", isValid);
  }
}

check();
