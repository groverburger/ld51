import * as proc from "./procgeneral.js"
import * as terr from "./procterrain.js"

const BIRTH_LIMIT = 3
const DEATH_LIMIT = 2

export function generateCaves(params) {
  // Get necessary params
  let width = params.width
  let length = params.length
  let floorHeight = params.height
  let wallHeight = params.caveWallHeight

  // Calculate initialChance and steps
  let initialChanceParam = ((1-params.caveSpaciousness) + (params.caveOpenness)) / 2
  let stepsParam = ((1-params.caveSpaciousness) + (1-params.caveOpenness)) / 2
  let initialChance = initialChanceParam * 0.1 + 0.2
  let steps = stepsParam * 5 + 2

  // Create the initial array
  let spaces = {}
  for (let i = 0; i < width; i ++) {
    for (let j = 0; j < length; j ++) {
      spaces[[i,j]] = Math.random() < initialChance
    }
  }

  // Iterate the algorithm
  for (let i = 0; i < steps; i ++) {
    caveIterate(spaces)
  }

  // Convert into terrain
  let terrain = terr.generateTerrain(params)
  for (const key in spaces) {
    if (spaces[key] == true) {
      terrain[key] = wallHeight
    }
  }

  return terrain
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
