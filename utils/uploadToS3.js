require('dotenv').config()
const fs = require('fs')
const {readdir, unlink} = require('fs/promises')
const {renameSync} = require('fs')
const CronJob = require('cron').CronJob
const S3 = require('aws-sdk/clients/s3')

const {User} = require('./../models')

const bucketName = process.env.AWS_BUCKET_NAME
const region = process.env.AWS_BUCKET_REGION
const accessKeyId = process.env.AWS_ACCESS_KEY
const secretAccessKey = process.env.AWS_SECRET_KEY

const s3 = new S3({
  region,
  accessKeyId,
  secretAccessKey
})

const tmpDir = './tmp/'

async function uploadToS3() {
  const doEverySec = new CronJob('*/1 * * * * *', async function() {

    try {
      const files = await readdir(tmpDir)
      for (const file of files) {
        // remove tmp files
        const isTmpFile = checkIsTempFile(file)
        if (isTmpFile) return

        const filePath = tmpDir + file
        const tmpFilePath = tmpDir + 'tmp.' + file

        // rename file, for predicting double converting
        renameSync(filePath, tmpFilePath)
        await uploadFile(tmpFilePath, file)
      }

    } catch (err) {
      console.error(err)
    }
  })

  doEverySec.start()
}

function checkIsTempFile(file) {
  return 'tmp' === file.split('.')[0]
}


const uploadFile = (tmpFilePath, file) => {
  fs.readFile(tmpFilePath, (err, data) => {
    if (err) throw err
    const params = {
      Bucket: bucketName, // pass your bucket name
      Key: file, // file will be saved as testBucket/contacts.csv
      Body: data
    }
    s3.upload(params, async (s3Err, data) => {
      if (s3Err) throw s3Err
      console.log(`File uploaded successfully at ${data.Location}`)
      const userId = file.split('.')[0]
      console.log(userId)
      await User.update({photoUrl: data.Location}, {where: {id: userId}})

      await removeTmpFile(tmpFilePath)
    })
  })
}


async function removeTmpFile(tmpFilePath) {
  try {
    await unlink(tmpFilePath)
    console.info(`File removed ${tmpFilePath}`)
  } catch (e) {
    console.error(e)
  }
}

module.exports = uploadToS3