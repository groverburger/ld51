import * as proc from "./procgeneral.js"
import * as terr from "./procterrain.js"
import * as basic from "./procbasics.js"

const BIRTH_LIMIT = 3
const DEATH_LIMIT = 2
const LAYER_HEIGHT_DIFFERENCE = 2

export function generateCaves(params) {
  // Get necessary params
  let layers = params.caveLayers
  let wallHeight = params.caveWallHeight

  // Create multiple layers
  // Start by creating an uncarved flat at wall height
  let flatParams = {...params}
  flatParams.height = wallHeight
  let terrain = basic.generateFlat(flatParams)
  // Iterate over cave layers
  for (let i = layers-1; i >= 0; i --) {
    let terrainLayer = terr.generateTerrain(params)
    let spacesLayer = caveAlgorithm(params)
    console.log(spacesLayer)
    for (const key in spacesLayer) {
      if (spacesLayer[key] == false) {
        terrain[key] = terrainLayer[key] + (i * LAYER_HEIGHT_DIFFERENCE)
      }
    }
  }

  return terrain
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
      let samplePos = proc.posAdd(pos, delta)
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
