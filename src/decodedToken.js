const jwt = require('jsonwebtoken')
const decodedToken = (req, requireAuth = true) => {
  const header = req.req.headers.authorization

  if (header) {
    const token = header.replace('Bearer ', '')
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
