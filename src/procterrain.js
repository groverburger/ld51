import * as proc from "./procgeneral.js"
import { add, scale } from "./core/vector2.js"

const ROUGHNESS_CONSTANT = 0.5
const BELL_ITERATIONS = 9
const SMOOTHING_ITERATIONS = 3

export function generateTerrain(params) {
  let width = params.width
  let length = params.length
  let height = params.height
  let roughness = params.terrainRoughness
  let variance = params.terrainVariance
  let varianceMode = 0

  // Determine how big of a grid we'll need for the requested size
  let greater = Math.max(width, length)
  let size = 2
  while (size + 1 < greater) {
    size *= 2
  }
  size += 1

  // Build the initial object
  let terrain = {}
  terrain[[0, 0]] = diamondSquareRandomize(variance, varianceMode)
  terrain[[0, size-1]] = diamondSquareRandomize(variance, varianceMode)
  terrain[[size-1, 0]] = diamondSquareRandomize(variance, varianceMode)
  terrain[[size-1, size-1]] = diamondSquareRandomize(variance, varianceMode)
  
  // Run the algorithm
  let moveDistance = (size-1)/2
  let varianceFactor = variance
  while (moveDistance > 1) {
    diamondSquareIterate(terrain, size, moveDistance, varianceFactor, varianceMode, 1)
    moveDistance /= 2
    varianceFactor *= roughness
    diamondSquareIterate(terrain, size, moveDistance, varianceFactor, varianceMode, 0)
  }

  // Cut the terrain down to size
  let cutTerrain = {}
  for (let i = 0; i < width; i ++) {
    for (let j = 0; j < length; j ++) {
      if ([i,j] in terrain) {
        cutTerrain[[i,j]] = terrain[[i,j]]
      }
    }
  }
  terrain = cutTerrain

  // Round all terrain heights to integers and add base height
  for (const key in terrain) {
    terrain[key] = Math.ceil(terrain[key]) + height
  }

  // Smoothing step to prevent one-tile holes
  smooth(terrain, SMOOTHING_ITERATIONS)

  // Return
  let ret = new proc.GeneratorResult()
  ret.terrain = terrain
  return ret
}

function smooth(terrain, iterations) {
  for (let i = 0; i < iterations; i ++) {
    smoothIteration(terrain)
  }
}

function smoothIteration(terrain) {
  let deltas = [[0, 1], [1, 0], [0, -1], [-1, 0]]

  for (const key in terrain) {
    // Count the number of adjacent spaces with greater height
    let count = 0
    let lowest = 0
    let pos = proc.stringToPosition(key);
    for (const delta of deltas) {
      let samplePos = add(pos, delta)
      
      if (samplePos in terrain) {
        let here = terrain[pos];
        let there = terrain[samplePos];
        
        if (there > here) {
          // Count spaces
          count += 1
          // Determine lowest adjacent space that's greater
          if (there > lowest) {
            lowest = there
          }
        }
      }
    }

    // If this is a gap, fill it
    if (count >= 3) {
      terrain[pos] = lowest
    }
  }
}

function diamondSquareIterate(terrain, size, moveDistance, variance, varianceMode, mode) {
  // Create delta pattern
  let deltas = []
  let deltaScale = 0;
  // diamond
  if (mode == 0) {
    deltas = [[0, 1], [1, 0], [0, -1], [-1, 0]]
    deltaScale = moveDistance
  }
  // square
  else {
    deltas = [[1, 1], [-1, 1], [1, -1], [-1, -1]]
    deltaScale = Math.floor(moveDistance/2)
  }

  // Loop over the terrain pattern
  for (let i = 0; i < size-1; i += moveDistance) {
    for (let j = 0; j < size-1; j += moveDistance) {
      let pos = [i + deltaScale, j + deltaScale]
      // Make sure this point hasn't already been set
      if (!(pos in terrain)) {
        let count = 0
        let total = 0
        
        // Collect the four parent points for the average
        for (const delta of deltas) {
          let samplePos = add(pos, scale(delta, deltaScale))
          if (samplePos in terrain) {
            count += 1
            total += terrain[samplePos]
          }
        }
        
        // Average the four (or fewer) samples and add the random value
        if (count > 0) {
          let value = total/count + diamondSquareRandomize(variance, varianceMode)
          terrain[pos] = value
        }
      }
    }
  }
}

function diamondSquareRandomize(variance, varianceMode) {
  if (varianceMode == 0) {
    return (Math.random() - 0.5) * variance * ROUGHNESS_CONSTANT
  }
  else if (varianceMode == 1) {
    let val = 0
    for (let i = 0; i < BELL_ITERATIONS; i ++) {
      val += (Math.random() - 0.5) * variance * ROUGHNESS_CONSTANT
    }
    val /= ROUGHNESS_CONSTANT
    return val
  }
}
