import {resizeImage, toDataURL} from './image.js'

const fileInputEl = document.querySelector('input[type="file"]')
const imageEl = document.querySelector('.image')
const widthEl = document.querySelector('.width input')
const heightEl = document.querySelector('.height input')
const fileNameEl = document.querySelector('.fileName input')
const resizeBtnEl = document.querySelector('.resize')
const downloadBtnEl = document.querySelector('.download')

let file

let ratio = 1

let originalFileName

const getResizedFileName = (suffix) => {
  const fileNameParts = originalFileName.split('.')
  return `${fileNameParts[0]}_${suffix}.${fileNameParts[1]}`
}

const setResizedFileName = (resizedFileName) => {
  fileNameEl.value = resizedFileName
  downloadBtnEl.download = resizedFileName
}

fileInputEl.addEventListener('change', async event => {
  file = event.target.files && event.target.files[0]
  if (!file) {
    throw new Error('No image file')
  }

  const src = URL.createObjectURL(file)
  imageEl.hidden = false
  imageEl.src = src
  
  imageEl.addEventListener('load', () => {
    widthEl.value = imageEl.naturalWidth
    heightEl.value = imageEl.naturalHeight
    ratio = imageEl.naturalWidth / imageEl.naturalHeight
  })

  originalFileName = file.name

  setResizedFileName(getResizedFileName('resized'))
  
  const onNameChange =  event => {
    downloadBtnEl.download = event.target.value
  }
  fileNameEl.removeEventListener('change', onNameChange)
  fileNameEl.addEventListener('change', onNameChange)
})

widthEl.addEventListener('change', event => {
  heightEl.value = Math.round(event.target.valueAsNumber / ratio)
  downloadBtnEl.href = undefined
  downloadBtnEl.querySelector('button').disabled = true
  setResizedFileName(getResizedFileName(`resized_${event.target.valueAsNumber}x${heightEl.value}`))
})

heightEl.addEventListener('change', event => {
  widthEl.value = Math.round(event.target.valueAsNumber * ratio)
  downloadBtnEl.href
  downloadBtnEl.querySelector('button').disabled = true
  setResizedFileName(getResizedFileName(`resized_${widthEl.value}x${event.target.valueAsNumber}`))
})

resizeBtnEl.addEventListener('click', async () => {
  const resizedImage = await resizeImage(file, widthEl.valueAsNumber,  heightEl.valueAsNumber)
  const dataUrl = await toDataURL(resizedImage)

  downloadBtnEl.href = dataUrl
  downloadBtnEl.querySelector('button').disabled = false
})
