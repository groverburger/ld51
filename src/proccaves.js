import * as proc from "./procgeneral.js"

const BIRTH_LIMIT = 3
const DEATH_LIMIT = 2
const INITIAL_CHANCE = .22
const STEPS = 7

export function generateCaves(width, length, floorHeight, wallHeight) {
  let spaces = {}

  // Create the initial array
  for (let i = 0; i < width; i ++) {
    for (let j = 0; j < length; j ++) {
      spaces[[i,j]] = Math.random() < INITIAL_CHANCE
    }
  }

  // Iterate the algorithm
  for (let i = 0; i < STEPS; i ++) {
    console.log(spaces)
    caveIterate(spaces)
  }

  // Convert into terrain
  let terrain = {}
  for (const key in spaces) {
    if (spaces[key] == true) {
      terrain[key] = wallHeight
    }
    else {
      terrain[key] = floorHeight
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
