const jwt = require('jsonwebtoken')
const decodedToken = (req, requireAuth = true) => {

  const symbols = req.request.raw
  const symbolKey = Object.getOwnPropertySymbols(symbols)
    .find(key => key.toString() === 'Symbol(kHeaders)')

  if (symbolKey.length === 0) throw new Error('Need headers.')

  const header = symbols[symbolKey] //.toString()

  if (header) {
    const token = header.authorization.replace('Bearer ', '')
    const decoded = jwt.verify(token, 'supersecret')
    // check exp
    const nowInSecs = Math.floor(Date.now() / 1000)
    if(decoded.exp < nowInSecs) throw new Error('Token expired, please login again.')

    return decoded
  }
  if (requireAuth) {
    throw new Error('Login in to access resource')
  }
  return null
}
module.exports = {decodedToken}
