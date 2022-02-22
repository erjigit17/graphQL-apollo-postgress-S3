require('dotenv').config()
const S3 = require('aws-sdk/clients/s3')
const sharp = require('sharp')

const IMAGE_SIZE = 300
const allowedExtension = ['jpeg', 'jpg', 'png', 'webp', 'gif', 'avif', 'tiff']

const bucketName = process.env.AWS_BUCKET_NAME
const region = process.env.AWS_BUCKET_REGION
const accessKeyId = process.env.AWS_ACCESS_KEY
const secretAccessKey = process.env.AWS_SECRET_KEY

const s3 = new S3({
  region,
  accessKeyId,
  secretAccessKey
})


// Main function
async function cropAndUploadToS3(createReadStream, newFileName) {

  const buffer = await downloadFile(createReadStream)
  const convertedImage = await cropAndConvertImage(buffer)
  const resultOfUploadingToS3 = await uploadToS3(convertedImage, newFileName)

  return resultOfUploadingToS3
}


async function downloadFile(createReadStream) {
  const stream = createReadStream()

  function handleErrorResponse(stream) {
    return new Promise((resolve, reject) => {
      const chunks = []
      stream.on('data', chunk => chunks.push(chunk))
      stream.on('error', streamError => reject(streamError))
      stream.on('end', () => resolve(Buffer.concat(chunks)))
    })
  }

  const buffer = await handleErrorResponse(stream)
  return buffer
}

async function cropAndConvertImage(buffer) {
  const convertedImage = await sharp(buffer)
    .resize(IMAGE_SIZE, IMAGE_SIZE, {
      fit: sharp.fit.inside,
      withoutEnlargement: true
    })
    .webp({quality: 60, effort: 6})
    .toBuffer()

  return convertedImage
}

async function uploadToS3(convertedImage, newFileName) {
  const params = {
    Bucket: bucketName, // pass your bucket name
    Key: newFileName, // file will be saved as testBucket/contacts.csv
    Body: convertedImage
  }

  const response = s3.upload(params).promise()

  return response.then(data => {
    return {
      success: true,
      message: 'Successfully file uploaded: ' + data.Location,
      location: data.Location
    }
  }).catch(err => {
    return {
      success: false,
      message: 'When uploadToS3. Something gating wrong(( ' + err.message
    }
  })
}

function checkExtension(mimetype) {
  const fileExtension = mimetype.split('/').pop().toLowerCase()
  if (!allowedExtension.includes(fileExtension)) throw new Error('Extension should be in ' + allowedExtension.join(', '))
}

module.exports = {cropAndUploadToS3, checkExtension}