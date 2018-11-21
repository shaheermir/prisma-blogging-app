import jwt from "jsonwebtoken"

const generateToken = userId => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7 days"
  })
  return token
}

export default generateToken
