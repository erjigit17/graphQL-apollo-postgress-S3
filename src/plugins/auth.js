const jwt = require('jsonwebtoken')
require('dotenv').config()
const jwtSecretKey = process.env.JWT_SECRET_KEY
const {User} = require('../../models')


const auth = async (req, requireAuth = true)  => {

  const symbols = req.request.raw
  const symbolKey = Object.getOwnPropertySymbols(symbols)
    .find(key => key.toString() === 'Symbol(kHeaders)')

  if (symbolKey.length === 0) throw new Error('Need headers.')
  const header = symbols[symbolKey]


  if (header) {
    const token = header.authorization.replace('Bearer ', '')
    const decoded = jwt.verify(token, jwtSecretKey)
    // check exp
    const nowInSecs = Math.floor(Date.now() / 1000)
    if(decoded.exp < nowInSecs) throw new Error('Token expired, please login again.')

    return decoded
  }

  if (requireAuth) throw new Error('Login in to access resource')

  return null
}

const userContext = async (req) => {
  const decodedToken = await auth(req)
  if (decodedToken === null) throw new Error('Token not exist')
  if (decodedToken.name === 'JsonWebTokenError') throw new Error('Json Web Token Error')
  const user = await User.findOne({where: {email: decodedToken.email}, raw: true})
  if (user === null) throw new Error('User not found')
  return user
}


module.exports = { auth, userContext }
