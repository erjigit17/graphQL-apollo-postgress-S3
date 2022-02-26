require('dotenv').config()
const Bull = require('bull')
const emailProcess = require('../src/processes/email.process')

const emailQueue = new Bull('email', {
  redis: {
    url: process.env.REDIS_URL,
    secure: process.env.REDIS_TLS_URL || ''
  }
})

emailQueue.process(emailProcess)

const sendEmail = data => {
  emailQueue.add(data, {
    attempts: 2,
    priority: 3
  })
}

module.exports = {sendEmail}