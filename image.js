export const resizeImage = (file, maxWidth, maxHeight, rotation) => new Promise((res, rej) => {
  const fileType = file.type

  const reader = new FileReader()

  reader.addEventListener("loadend", (e) => {
    const image = new Image();

    image.addEventListener("load", () => {
      let imageWidth = image.width
      let imageHeight = image.height

      if (imageWidth > imageHeight) {
        if (imageWidth > maxWidth) {
          imageHeight *= maxWidth / imageWidth;
          imageWidth = maxWidth;
        }
      }
      else {
        if (imageHeight > maxHeight) {
          imageWidth *= maxHeight / imageHeight;
          imageHeight = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      // document.querySelector('#canvas-debug').appendChild(canvas)

      const isRotated = [1,3].includes(Math.round(rotation / 90))
      if (isRotated) {
        canvas.width = imageHeight;
        canvas.height = imageWidth;
      } else {
        canvas.width = imageWidth;
        canvas.height = imageHeight;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return rej(new Error("no canvas context"))
      }
      

      if (isRotated) {
        ctx.translate(canvas.width/2,canvas.height/2);
        ctx.rotate(rotation * Math.PI / 180);
        // ctx.rotate(Math.PI/2);image.height
        ctx.drawImage(image,-imageWidth/2,-imageHeight/2, imageWidth, imageHeight);
      } else {
        ctx.drawImage(image, 0, 0, imageWidth, imageHeight);
      }

      // The resized file ready for upload
      canvas.toBlob((blob) => {
        if (!blob) {
          throw new Error("failed blog conversion")
        }

        const resizedFile = new File([blob], file.name, { type: file.type })
        res(resizedFile)

      }, fileType)
      // .toDataURL(fileType);



    })

    if (typeof reader.result !== 'string') {
      throw new Error("reader result is not a string")
    }

    image.src = reader.result;
  });

  reader.readAsDataURL(file)
})

export const toDataURL = (file) => new Promise((res, rej) => {
  const reader = new FileReader()

  reader.addEventListener("loadend", (e) => {
    res(reader.result);
  });

  reader.readAsDataURL(file)
})
