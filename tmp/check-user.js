const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function check() {
  const user = await prisma.user.findUnique({
    where: { email: "irahulkv@gmail.com" },
  });
  console.log("User found:", user ? "YES" : "NO");
  if (user) {
    console.log("Email:", user.email);
    console.log("Name:", user.name);
    console.log("Password (hashed):", user.password);
  }
}

check();
