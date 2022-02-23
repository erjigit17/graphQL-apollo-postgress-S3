require('dotenv').config()
const nodemailer = require('nodemailer')

const emailProcess = async (job) => {
  const {email, usersPosts, usersComments} = await job.data

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_LOGIN,
      pass: process.env.GMAIL_PASSWORD
    }
  })

  const allUsers = [...usersPosts, ...usersComments]
  const reportBody = allUsers.reduce((acc, el) => {
    const posts = el.posts ? el.posts.length : 0
    const comments = el.comments ? el.comments.length : 0
    const total = posts + comments / 10
    const tmp = acc.find(({email}) => email === el.email)
    if (tmp) {
      tmp.posts += posts
      tmp.comments += comments
      tmp.total += total
    } else {
      acc.push({nickname: el.nickname, email: el.email, posts, comments, total})
    }
    return acc.sort((a, b) => b.total - a.total)
  }, [])

  const amp = makeHtml(reportBody)
  const mailOptions = {
    from: process.env.GMAIL_LOGIN, // sender address
    to: email,
    subject: 'Report from Apollo Server',
    html: amp
  }

  const result = await sendMail(transporter, mailOptions)
  if (result.error) {
    return {
      success: false,
      message: 'Cant sendMail. Something getting wrong.: ' + result.message
    }
  }

  if (result.accepted.length !== 0) {
    return {
      success: true,
      message: 'Successfully message sent',
      messageId: result.messageId
    }
  }
}


async function sendMail(transporter, mailOptions) {
  try {
    const response = await transporter.sendMail(mailOptions)
    return response
  } catch (e) {
    return {
      error: true,
      message: e.message
    }
  }
}


function makeHtml(arrOfObj) {
  if (arrOfObj.length === 0) return '<p>There is no data for the report</p>'

  const headers = Object.keys(arrOfObj[0])

  const _header = headers.reduce((acc, el) => {
    return acc + '<th>' + '<b>' + el + '</b>' + '</th>'
  }, '')
  const header = '<tr>' + _header + '</tr>'

  let rows = ''
  for (const rowValues of arrOfObj) {
    const values = Object.values(rowValues)
    const row = values.reduce((acc, el) => {
      return acc + '<td>' + el + '</td>'
    }, '')

    rows += '<tr>' + row + '</tr>'
  }


  const styles = `
      .gmail-table {
        border: solid 2px #DDEEEE;
        border-collapse: collapse;
        margin: 25px 0;
        border-spacing: 0;
        font: normal 14px Roboto, sans-serif;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
      }
    
      .gmail-table thead th {
        background-color: #DDEFEF;
        border: solid 1px #DDEEEE;
        color: #336B6B;
        padding: 10px;
        text-align: left;
        text-shadow: 1px 1px 1px #fff;
      }
            
      .gmail-table tbody td {
        border: solid 1px #DDEEEE;
        color: #333;
        padding: 10px;
        text-shadow: 1px 1px 1px #fff;
      }
  `

  const amp = `<!doctype html>
    <html ⚡4email data-css-strict>
    <head>
      <meta charset='utf-8'>
      <script async src='https://cdn.ampproject.org/v0.js'></script>
      <style amp4email-boilerplate>body{visibility:hidden}</style>
      <style amp-custom>
        ${styles}
      </style>
    </head>
     <body>
        <table class='gmail-table'>
          <thead>
            ${header}
          </thead>
          <tbody>
            ${rows} 
          </tbody>
       </table>
     </body>
     </html>
  `

  return amp
}

module.exports = emailProcess
