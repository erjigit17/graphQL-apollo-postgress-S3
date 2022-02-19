const jwt = require('jsonwebtoken')
require('dotenv').config()
const jwtsecretkey = process.env.JWT_SECRET_KEY

const {User} = require('./../models')

const userContext = async (req, requireAuth = true)  => {

  const symbols = req.request.raw
  const symbolKey = Object.getOwnPropertySymbols(symbols)
    .find(key => key.toString() === 'Symbol(kHeaders)')

  if (symbolKey.length === 0) throw new Error('Need headers.')
  const header = symbols[symbolKey]


  if (header) {
    const token = header.authorization.replace('Bearer ', '')
    const decoded = jwt.verify(token, jwtsecretkey)
    // check exp
    const nowInSecs = Math.floor(Date.now() / 1000)
    if(decoded.exp < nowInSecs) throw new Error('Token expired, please login again.')

    const user = await User.findOne({where: {email: decoded.email}, raw: true})

    return user
  }
  if (requireAuth) {
    throw new Error('Login in to access resource')
  }
  return null
}
module.exports = userContext
