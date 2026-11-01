import * as argon2 from "argon2";
export const hashPassword = async (password) => {
    return await argon2.hash(password);
};
export const verifyPassword = async (passwordHash, password) => {
    return await argon2.verify(passwordHash, password);
};
//# sourceMappingURL=password.js.map