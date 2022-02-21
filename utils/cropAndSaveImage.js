const sharp = require('sharp')
const fs = require('fs')
const IMAGE_SIZE = 300
const promises = []
const allowedExtension = ['jpeg', 'jpg', 'png', 'webp', 'gif', 'avif', 'tiff']


async function cropAndSaveImage(createReadStream, mimetype, user){

  // ignore invalid fails
  const isValidExtension = checkExtension (mimetype)
  if(!isValidExtension) return // TODO need error

  const stream = createReadStream()

  const sharpStream = sharp({failOnError: false})

  const filePath = `./tmp/${user.id}.webp`

  promises.push(
    sharpStream
      .resize(IMAGE_SIZE, IMAGE_SIZE)
      .webp({quality: 60, effort: 6})
      .toFile(filePath)
  )

  stream.pipe(sharpStream)

  Promise.all(promises)
    .then(res => {
      console.log('File compressed!', res)
    })
    .catch(err => {
      console.error('Error processing files, let\'s clean it up', err)
      try {
        fs.unlinkSync(filePath)
      } catch (e) {
      }
    })
}

function checkExtension (mimetype) {
  const fileExtension = mimetype.split('/').pop().toLowerCase()
  return allowedExtension.includes(fileExtension)
}

module.exports = cropAndSaveImage