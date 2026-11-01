import * as argon2 from "argon2";

export const hashPassword = async (password: string) => {
  return await argon2.hash(password);
};

export const verifyPassword = async (
  passwordHash: string,
  password: string,
) => {
  return await argon2.verify(passwordHash, password);
};
