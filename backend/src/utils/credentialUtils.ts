import bcrypt from "bcrypt";

// hashes a plain text password and generated salt
// recommended to use a salt round of 10~12
export async function hashPassword(
  password: string,
  saltRounds = 10
): Promise<string> {
  const result = await bcrypt.hash(password, saltRounds);
  return result;
}

// compares a plaintext password against the hashed password from the database
export async function comparePassword(
  plainTextPassword: string,
  hashedPassword: string
): Promise<boolean> {
  const result = await bcrypt.compare(plainTextPassword, hashedPassword);

  return result;
}
