export function posAdd(pos1, pos2) {
  return [parseInt(pos1[0]) + parseInt(pos2[0]), parseInt(pos1[1]) + parseInt(pos2[1])]
}

export function posScale(pos1, scale) {
  return [parseInt(pos1[0]) * parseInt(scale), parseInt(pos1[1]) * parseInt(scale)]
}

// Pass in a position in either string format or list format and it will convert it to list format
export function stringToPosition(p) {
  let ret = p
  if (typeof p == "string") {
    let coords = ret.split(',')
    let px = parseInt(coords[0])
    let py = parseInt(coords[1])
    ret = [px, py]
  }
  return ret
}

export function mergeTerrain(terrain, merge, position) {
  let p = stringToPosition(position)

  for (const key in merge) {
    let value = merge[key]
    let coords = key.split(',')
    let x = parseInt(coords[0])
    let y = parseInt(coords[1])
    terrain[[x + p[0], y + position[1]]] = value
  }
}
