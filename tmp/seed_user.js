const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("rahul1234", 10);

  const usersToCreate = [{ email: "rahul1234@gmail.com", name: "rahul1234" }];

  for (const userData of usersToCreate) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {
        name: userData.name,
        password: passwordHash,
        onboardingCompleted: true,
      },
      create: {
        email: userData.email,
        name: userData.name,
        password: passwordHash,
        onboardingCompleted: true,
      },
    });
    console.log(`User created/updated successfully: ID = ${user.id}, Email = ${user.email}`);
  }
}

main()
  .catch((e) => {
    console.error("Error creating user:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
