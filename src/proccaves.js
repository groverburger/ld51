import * as proc from "./procgeneral.js"
import * as terr from "./procterrain.js"
import * as basic from "./procbasics.js"
import { add } from "./core/vector2.js"

const BIRTH_LIMIT = 3
const DEATH_LIMIT = 2
const LAYER_HEIGHT_DIFFERENCE = 2

export function generateCaves(params) {
  // Get necessary params
  let layers = params.caveLayers
  let wallHeight = params.caveWallHeight

  // Start by creating an uncarved flat at wall height
  let flatParams = {...params}
  flatParams.height = wallHeight
  let terrain = basic.generateFlat(flatParams)

  // Iterate over cave layers
  let startPoint = [0, 0]
  let endPoint = [0, 0]
  for (let i = layers-1; i >= 0; i --) {
    // Generate the terrain
    let terrainLayer = terr.generateTerrain(params).terrain
    let spacesLayer = caveAlgorithm(params)

    // If this is layer 0, set the start and end points
    if (i == 0) {
      let sneResult = determineStartAndEndPoint(spacesLayer)
      startPoint = sneResult[0]
      endPoint = sneResult[1]
      carvePoint(spacesLayer, startPoint)
      carvePoint(spacesLayer, endPoint)
    }

    // Merge the cave-gen with the terrain-gen
    for (const key in spacesLayer) {
      if (spacesLayer[key] == false) {
        terrain[key] = terrainLayer[key] + (i * LAYER_HEIGHT_DIFFERENCE)
      }
    }
  }

  // Return
  let ret = new proc.GeneratorResult()
  ret.terrain = terrain
  ret.startPoint = startPoint
  ret.endPoint = endPoint
  return ret
}

function caveAlgorithm(params) {
  // Init spaces
  let spaces = {}

  // Get necessary params
  let width = params.width
  let length = params.length
  let layers = params.caveLayers

  // Calculate initialChance and steps
  let initialChanceParam = ((1-params.caveSpaciousness) + (params.caveOpenness)) / 2
  let stepsParam = ((1-params.caveSpaciousness) + (1-params.caveOpenness)) / 2
  let initialChance = (initialChanceParam * 0.1) + 0.2 + (layers * .01)
  let steps = (stepsParam * 5) + 2

  // Iterate
  for (let i = 0; i < width; i ++) {
    for (let j = 0; j < length; j ++) {
      spaces[[i,j]] = Math.random() < initialChance
    }
  }

  // Iterate the algorithm
  for (let i = 0; i < steps; i ++) {
    caveIterate(spaces)
  }

  return spaces
}

function caveIterate(spaces) {
  let deltas = [[0, 1], [1, 0], [0, -1], [-1, 0], [1, 1], [-1, 1], [1, -1], [-1, -1]]
  let newSpaces = {}

  for (const key in spaces) {
    // Look through adjacent spaces
    let count = 0
    let pos = proc.stringToPosition(key);
    for (const delta of deltas) {
      let samplePos = add(pos, delta)
      if (samplePos in spaces) {
        if (spaces[samplePos] == true) {
          count += 1
        }
      }
      else {
        count += 1
      }
    }

    // Set new space based on count
    if (spaces[pos] == true) {
      if (count < DEATH_LIMIT) {
        newSpaces[pos] = false;
      }
      else {
        newSpaces[pos] = true;
      }
    }
    else {
      if (count > BIRTH_LIMIT) {
        newSpaces[pos] = true;
      }
      else {
        newSpaces[pos] = false;
      }
    }
  }

  // Save iteration
  for (const key in newSpaces) {
    spaces[key] = newSpaces[key]
  }
}

function determineStartAndEndPoint(spaces) {
  let deltas = [[0, 1], [1, 0], [0, -1], [-1, 0], [1, 1], [-1, 1], [1, -1], [-1, -1]]
  let candidates = []

  for (const key in spaces) {
    // If this is an open space
    if (spaces[key] == false) {
      // Look through adjacent spaces
      let count = 0
      let pos = proc.stringToPosition(key);
      for (const delta of deltas) {
        let samplePos = add(pos, delta)
        if (samplePos in spaces) {
          if (spaces[samplePos] == true) {
            count += 1
          }
        }
        else {
          count += 1
        }
      }

      // If this is a corner alcove, add this as a candidate
      if (count >= 5) {
        candidates.push(pos)
      }
    }
  }

  
  // Randomly whittle candidates down to seven
  // Adds some RNG and limits the time complexity of the next step
  while (candidates.length > 7) {
    let remove = Math.floor(Math.random() * candidates.length)
    candidates.splice(remove, 1)
  }

  // Find the two candidates that are furthest apart
  let maxDistance = 0
  let maxPos1 = [0,0]
  let maxPos2 = [0,0]
  for (let i = 0; i < candidates.length; i ++) {
    for (let j = i+1; j < candidates.length; j ++) {
      // Determine the distance between the two candidates
      let pos1 = candidates[i]
      let pos2 = candidates[j]
      let distance = Math.pow(pos1[0] - pos2[0], 2) + Math.pow(pos1[1] - pos2[1], 2)

      // Track the max distance pair
      if (distance > maxDistance) {
        maxPos1 = pos1
        maxPos2 = pos2
        maxDistance = distance
      }
    }
  }

  // Return
  return [maxPos1, maxPos2]
}

export function carvePoint(terrain, startPoint) {
  // Make sure the start point and end point exist
  if (!(startPoint in terrain)) {
    console.error("Carved point is not a valid space")
    return
  }

  // Carve out a 3x3 space at each point
  let startHeight = terrain[startPoint]
  let deltas = [[0, 1], [1, 0], [0, -1], [-1, 0], [1, 1], [-1, 1], [1, -1], [-1, -1]]
  for (const delta of deltas) {
    let startAdj = add(startPoint, delta)
    terrain[startAdj] = startHeight
  }
}
