const { PrismaClient } = require("@prisma/client");
const { compare } = require("bcryptjs");
const prisma = new PrismaClient();

async function debugAuth() {
  const email = "irahulkv@gmail.com";
  const password = "123456";

  console.log("Checking user...");
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    console.log("Error: User not found in DB.");
    return;
  }

  console.log("User found. Comparing password...");
  console.log("Stored hash:", user.password);
  
  const isValid = await compare(password, user.password);
  console.log("Is Valid:", isValid);
}

debugAuth();
