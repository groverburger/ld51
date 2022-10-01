import { add, lerp, distance } from "./core/vector2.js"
import * as cave from "./proccaves.js"

const PLAYER_JUMP_HEIGHT = 3
const ABSOLUTE_HEIGHT_DIFFERENCE_MAX = 10
const RANDOM_POINT_ITERATIONS = 20

export class GeneratorParams {
  // General
  width = 5 // How wide on the x axis to make the structure
  length = 5 // How long on the y axis to make the structure
  height = 1 // The height of the floor

  // Caves
  caveWallHeight = 20 // How tall the bounding walls are
  caveSpaciousness = 0.5 // How much space vs walls
  caveOpenness = 0.5 // High values make the cave open to move around, low values make it snakey and linear
  caveLayers = 3 // How many layers of terrain to make

  // Terrain
  terrainVariance = 9 // How jagged the terrain is
  terrainRoughness = 0.4 // How steep the hills can be
}

export class GeneratorResult {
  // General
  terrain = {}
  types = {}
  startPoint = [0, 0]
  endPoint = [0, 0]
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

export function guaranteePath(terrain, startPoint, endPoint) {
  // Create the list of accessible points from start
  let startAccessibleSet = getAccessibleSpaces(terrain, startPoint, false)

  // Exit out if end point is already accessible from end
  if (startAccessibleSet.has(endPoint.toString())) {
    return
  }
  console.log("CARVING")

  // Create a list of accessible points from end
  let startAccessible = [...startAccessibleSet]
  let endAccessible = [...getAccessibleSpaces(terrain, endPoint, true)]

  // Find a random point from startAccessible and from endAccessible who are somewhat close
  let closestdist = 1000000
  let closestPoint1 = [0,0]
  let closestPoint2 = [0,0]
  for (let i = 0; i < RANDOM_POINT_ITERATIONS; i ++) {
    // Pick a random point from each set
    let startInd = Math.floor(Math.random() * startAccessible.length)
    let pos1 = startAccessible[startInd]
    let endInd = Math.floor(Math.random() * endAccessible.length)
    let pos2 = endAccessible[endInd]

    // Check their dist
    let dist = Math.pow(pos1[0] - pos2[0], 2) + Math.pow(pos1[1] - pos2[1], 2)
    if (dist < closestdist) {
      closestPoint1 = pos1
      closestPoint2 = pos2
      closestdist = dist
    }
  }

  // Carve linear hallway between the two points
  carveHallway(terrain, closestPoint1, closestPoint2)
}

function getAccessibleSpaces(terrain, startPoint, backwards) {
  let result = getAccessibleSpacesRecurse(terrain, startPoint, backwards, new Set())
  return result
}

function getAccessibleSpacesRecurse(terrain, pos, backwards, collected) {
  let deltas = [[0, 1], [1, 0], [0, -1], [-1, 0]]

  for (const delta of deltas) {
    // Get the adjacent space
    let adj = add(pos, delta)
    // Make sure this space hasn't already been collected
    if (!collected.has(adj.toString())) {
      // check if the height difference of the adjacent space is at most jump height
      let heightDifference = backwards ? (terrain[pos] - terrain[adj]) : (terrain[adj] - terrain[pos])
      let absoluteHeightDifference = Math.abs(terrain[pos] - terrain[adj])
      if (heightDifference <= PLAYER_JUMP_HEIGHT && absoluteHeightDifference <= ABSOLUTE_HEIGHT_DIFFERENCE_MAX) {
        collected.add(adj.toString())
        collected = getAccessibleSpacesRecurse(terrain, adj, backwards, collected)
      }
    }
  }
  return collected
}

function carveHallway(terrain, pos1, pos2) {
  pos1 = stringToPosition(pos1)
  pos2 = stringToPosition(pos2)

  let dist = distance(pos1, pos2)
  console.log(dist)
  if (dist <= 1) {
    return
  }

  let height1 = terrain[pos1]
  let height2 = terrain[pos2]

  // Iterate over hallway
  for (let i = -1; i <= dist+1; i += 1) {
    let frac = i/dist
    let newPos = lerp(pos1, pos2, frac)
    let newHeight = ((1-frac) * height1) + ((frac) * height2)

    terrain[newPos] = newHeight
    cave.carvePoint(terrain, newPos)
  }
}
