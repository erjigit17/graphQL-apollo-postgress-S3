const {readdir, unlink, stat} = require('fs/promises')
const {renameSync} = require('fs')
const sharp = require('sharp')

const inputDir = './inputFiles/'
const outputDir = './outputFiles/'
const allowedExtension = ['jpeg', 'jpg', 'png', 'webp', 'gif', 'avif', 'tiff']

const CronJob = require('cron').CronJob

async function cropAndCompressImage() {
  const doEverySec = new CronJob('*/1 * * * * *', async function() {

    try {
      const files = await readdir(inputDir)
      for (const file of files) {
        // ignore invalid fails
        const isValidExtension = checkExtension (file)
        if(!isValidExtension) return

        // remove tmp files
        const isTmpFile = checkIsTempFile (file)
        if (isTmpFile) {
          await removeTmpFile(file)
          return
        }

        const fromPath = inputDir + file
        const tmpFilePath = inputDir + 'tmp.' + file
        const toPath = outputDir + file.split('.')[0] + '.webp'

        // rename file, for predicting double converting
        renameSync(fromPath, tmpFilePath)
        await cropAndCompress(tmpFilePath, toPath)
      }

    } catch (err) {
      console.error(err)
    }
  })

  doEverySec.start()
}



function checkIsTempFile (file) {
  return 'tmp' === file.split('.')[0]
}

function checkExtension (file) {
  const fileExtension = file.split('.').pop().toLowerCase()
  return allowedExtension.includes(fileExtension)
}

async function cropAndCompress(tmpFilePath, toPath) {
  try {
    await sharp(tmpFilePath)
      .resize(300)
      .webp({quality: 70, effort: 6})
      .toFile(toPath)
    console.info(`File compressed ${toPath}`)
  } catch (e) {
    console.error(e)
  }
}

async function removeTmpFile (file) {
  const tmpFilePath = inputDir + file
  const toPath = outputDir + file.split('.')[1] + '.webp'
  //TODO logger and remove withOut checking

  const compressedFileStat = await stat(toPath)
  if (compressedFileStat.size) { // check is file converted
    try {
      await unlink(tmpFilePath)
      console.info(`File removed ${tmpFilePath}`)
    } catch (e) {
      console.error(e)
    }
  }
}

module.exports = cropAndCompressImage