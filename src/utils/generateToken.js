import jwt from "jsonwebtoken"

const generateToken = userId => {
  const token = jwt.sign({ userId }, "thisisasecret", { expiresIn: "7 days" })
  return token
}

export default generateToken
