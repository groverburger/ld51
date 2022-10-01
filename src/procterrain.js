import * as proc from "./procgeneral.js"

const ROUGHNESS_CONSTANT = 0.5
const BELL_ITERATIONS = 9
const SMOOTHING_ITERATIONS = 3

export function generateTerrain(width, length, height, variance, roughness, roughnessMode) {
  // Determine how big of a grid we'll need for the requested size
  let greater = Math.max(width, length)
  let size = 2
  while (size + 1 < greater) {
    size *= 2
  }
  size += 1

  // Build the initial object
  let terrain = {}
  terrain[[0, 0]] = diamondSquareRandomize(roughness, roughnessMode)
  terrain[[0, size-1]] = diamondSquareRandomize(roughness, roughnessMode)
  terrain[[size-1, 0]] = diamondSquareRandomize(roughness, roughnessMode)
  terrain[[size-1, size-1]] = diamondSquareRandomize(roughness, roughnessMode)
  
  // Run the algorithm
  let moveDistance = (size-1)/2
  let roughnessFactor = roughness
  while (moveDistance > 1) {
    diamondSquareIterate(terrain, size, moveDistance, roughnessFactor, roughnessMode, 1)
    moveDistance /= 2
    roughnessFactor *= variance
    diamondSquareIterate(terrain, size, moveDistance, roughnessFactor, roughnessMode, 0)
  }

  // TODO: Cut the output down to correct size

  // Round all terrain heights to integers and add base height
  for (const key in terrain) {
    terrain[key] = Math.ceil(terrain[key]) + height
  }

  // Smoothing step to prevent one-tile holes
  smooth(terrain, SMOOTHING_ITERATIONS)

  return terrain
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
      let samplePos = proc.posAdd(pos, delta)
      
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

function diamondSquareIterate(terrain, size, moveDistance, roughness, roughnessMode, mode) {
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
          let samplePos = proc.posAdd(pos, proc.posScale(delta, deltaScale))
          if (samplePos in terrain) {
            count += 1
            total += terrain[samplePos]
          }
        }
        
        // Average the four (or fewer) samples and add the random value
        if (count > 0) {
          let value = total/count + diamondSquareRandomize(roughness, roughnessMode)
          terrain[pos] = value
        }
      }
    }
  }
}

function diamondSquareRandomize(roughness, roughnessMode) {
  if (roughnessMode == 0) {
    return (Math.random() - 0.5) * roughness * ROUGHNESS_CONSTANT
  }
  else if (roughnessMode == 1) {
    let val = 0
    for (let i = 0; i < BELL_ITERATIONS; i ++) {
      val += (Math.random() - 0.5) * roughness * ROUGHNESS_CONSTANT
    }
    val /= ROUGHNESS_CONSTANT
    return val
  }
}
