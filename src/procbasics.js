export function generateFlat(params) {
  let width = params.width
  let length = params.length
  let height = params.height

  let terrain = {}

  for (let i = 0; i < width; i ++) {
    for (let j = 0; j < length; j ++) {
      terrain[[i,j]] = height
    }
  }

  return terrain
}
