const { compare } = require("bcryptjs");

async function test() {
  const password = "123456";
  const hashed = "$2b$10$FuD4aZD.ChPGF8R48JgbOe4ilCugJf0u31lY4jWnhAG0iK8ufO.We";
  const isValid = await compare(password, hashed);
  console.log("Is Valid:", isValid);
}

test();
