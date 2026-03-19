const { compare, hash } = require("bcryptjs");

async function test() {
  const password = "123456";
  const hashed = await hash(password, 10);
  console.log("Hashed:", hashed);
  const isValid = await compare(password, hashed);
  console.log("Is Valid:", isValid);
  
  // Test with another hash
  const otherHashed = await hash("123456", 10);
  console.log("Other Hashed:", otherHashed);
  const isValid2 = await compare(password, otherHashed);
  console.log("Is Valid 2:", isValid2);
}

test();
