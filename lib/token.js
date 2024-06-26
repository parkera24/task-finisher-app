import { SignJWT, jwtVerify } from "jose";

export const signJWT = async (payload, options) => {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY);
    const alg = "HS256";
    return new SignJWT(payload)
      .setProtectedHeader({ alg })
      .setExpirationTime(options.exp)
      .setIssuedAt()
      .setSubject(payload.sub)
      .sign(secret);
  } catch (error) {
    throw error;
  }
};

export const verifyJWT = async (token) => {
  try {
    return await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET_KEY)
    ).payload;
  } catch (error) {
    console.log(error);
    throw new Error("Your token has expired.");
  }
};
