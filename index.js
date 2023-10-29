import {resizeImage, toDataURL} from './image.js'

const fileInputEl = document.querySelector('input[type="file"]')
const imageEl = document.querySelector('.image')
const widthEl = document.querySelector('.width input')
const heightEl = document.querySelector('.height input')
const fileNameEl = document.querySelector('.fileName input')
const resizeBtnEl = document.querySelector('.resize')
const rotateBtnEl = document.querySelector('.rotate')
const downloadBtnEl = document.querySelector('.download')

const LAST_USED_HEIGHT = 'last-used-height'
const LAST_USED_WIDTH = 'last-used-width'

const lastUsedWidth = window.localStorage.getItem(LAST_USED_WIDTH)
const lastUsedHeight = window.localStorage.getItem(LAST_USED_HEIGHT)
widthEl.value = lastUsedWidth
heightEl.value = lastUsedHeight

const getSharedImage = () => {
  return new Promise((resolve) => {
    const onmessage = (event) => {
      if (event.data.action !== 'load-image') {
        return;
      }

      file = event.data.file
      onFileLoad()

      navigator.serviceWorker.removeEventListener('message', onmessage);
      
      resolve()
    };

    navigator.serviceWorker.addEventListener('message', onmessage);

    navigator.serviceWorker.controller?.postMessage('share-ready');
  });
}

navigator.serviceWorker.register("sw.js").then(() => {
  getSharedImage()
})


let file

let ratio = 1

let originalFileName

let rotation = 0


const onFileLoad = () => {
  const src = URL.createObjectURL(file)
  imageEl.hidden = false
  imageEl.src = src
  
  imageEl.addEventListener('load', () => {
    ratio = imageEl.naturalWidth / imageEl.naturalHeight
    if (!lastUsedHeight && !lastUsedWidth) {
      widthEl.value = Math.round(imageEl.naturalWidth)
      heightEl.value = Math.round(imageEl.naturalHeight)
    } else {
      widthEl.value = Math.round(heightEl.value * ratio)
    }
  })

  originalFileName = file.name

  setResizedFileName(getResizedFileName('resized'))
  
  const onNameChange =  event => {
    downloadBtnEl.download = event.target.value
  }
  fileNameEl.removeEventListener('change', onNameChange)
  fileNameEl.addEventListener('change', onNameChange)
}

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

  onFileLoad()
})

const getFileSuffix = (width, height, rotation) => rotation !== 0 ? `resized_${width}x${height}_${rotation}` : `resized_${width}x${height}`
 
widthEl.addEventListener('change', event => {
  heightEl.value = Math.round(event.target.valueAsNumber / ratio)
  downloadBtnEl.href = undefined
  downloadBtnEl.querySelector('button').disabled = true
  setResizedFileName(getResizedFileName(getFileSuffix(event.target.valueAsNumber, heightEl.value, rotation)))
})

heightEl.addEventListener('change', event => {
  widthEl.value = Math.round(event.target.valueAsNumber * ratio)
  downloadBtnEl.href
  downloadBtnEl.querySelector('button').disabled = true
  setResizedFileName(getResizedFileName(getFileSuffix(widthEl.value, event.target.valueAsNumber, rotation)))
})

resizeBtnEl.addEventListener('click', async () => {
  window.localStorage.setItem(LAST_USED_WIDTH, widthEl.value)
  window.localStorage.setItem(LAST_USED_HEIGHT, heightEl.value)
  const resizedImage = await resizeImage(file, widthEl.valueAsNumber,  heightEl.valueAsNumber, rotation)
  const dataUrl = await toDataURL(resizedImage)

  downloadBtnEl.href = dataUrl
  downloadBtnEl.querySelector('button').disabled = false
})

rotateBtnEl.addEventListener('click', async () => {
  rotation = (rotation + 90) % 360
  const currentHeight = heightEl.value
  const currentWidth = widthEl.value
  heightEl.value = currentWidth
  widthEl.value = currentHeight
  imageEl.setAttribute('style', `transform: rotate(${rotation}deg)`) 
  setResizedFileName(getResizedFileName(getFileSuffix(widthEl.value, heightEl.value, rotation)))
  downloadBtnEl.querySelector('button').disabled = true
})
