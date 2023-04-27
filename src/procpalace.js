import { add, scale, subtract, equals } from './core/vector2.js'
import { GeneratorResult, stringToPosition } from './procgeneral.js'
import * as u from './core/utils.js'

const TOWARDS_CHANCE = 0.8
const PALACE_WALL_HEIGHT = 80
const PALACE_SCALE = 3

export function generatePalace (params, pathData) {
  const terrainSmall = {}

  terrainSmall[[0, 0]] = params.palaceFloorHeight
  terrainSmall[[0, 1]] = params.palaceFloorHeight
  terrainSmall[[0, -1]] = params.palaceFloorHeight
  terrainSmall[[1, 0]] = params.palaceFloorHeight
  terrainSmall[[1, 1]] = params.palaceFloorHeight
  terrainSmall[[1, -1]] = params.palaceFloorHeight
  terrainSmall[[-1, 0]] = params.palaceFloorHeight
  terrainSmall[[-1, 1]] = params.palaceFloorHeight
  terrainSmall[[-1, -1]] = params.palaceFloorHeight

  const data = {
    endPoint: [0, 1],
    firstClock: [0, -1],
    firstClockPlaced: false,
    secondClock: [1, 0],
    secondClockPlaced: false,
    thirdClock: [1, 0],
    thirdClockPlaced: false
  }
  const tileData = {}
  palaceAlgorithm(terrainSmall, params.palaceFloorHeight, [1, 0], params, false, 0, data, tileData, pathData)

  // Scale up terrain by a factor of 2
  const types = {}
  const terrain = scaleTerrain(terrainSmall, types, params, tileData)

  const ret = new GeneratorResult()
  ret.terrain = terrain
  ret.types = types
  ret.startPoint = [1, 1]
  ret.endPoint = add(scale(data.endPoint, PALACE_SCALE), [1, 1])
  ret.presetClocks = [scale(data.firstClock, PALACE_SCALE), scale(data.secondClock, PALACE_SCALE), scale(data.thirdClock, PALACE_SCALE)]
  ret.startAngle = Math.PI
  return ret
}

function palaceAlgorithm (terrain, height, pos, params, towards, depth, data, tileData, pathData, flatDistance=0) {
  // Take an action
  const actionNumber = Math.floor(params.random() * 13)
  let action = 'turn' // move forward, turning at a chasm
  if (actionNumber >= 5 && actionNumber <= 10) { action = 'jump' } // move forward, jumping over chasm
  if (actionNumber >= 9 && actionNumber <= 12) { action = 'stair' } // staircase upwards, stopping at chasm

  // Prioritize stairs if we've gone too long without going up
  const extraStairChance = u.map(flatDistance, 4, 16, 0, 0.7, true)
  if (params.random() < extraStairChance) {
    action = 'stair'
  }

  let distance = Math.floor(params.random() * 4) + 2

  if (action === 'stair') {
    distance += 3
  }

  // Determine which direction we're going
  const deltas = [[1, 0], [0, 1], [-1, 0], [0, -1]]
  let direction = deltas[Math.floor(params.random() * 4)]
  if (towards) {
    console.log("TOWARDS")
    if (params.random() < TOWARDS_CHANCE && pos[0] > 0) {
      direction = [-1, 0]
    } else if (params.random() < TOWARDS_CHANCE && pos[0] < 0) {
      direction = [1, 0]
    } else if (params.random() < TOWARDS_CHANCE && pos[1] > 0) {
      direction = [0, -1]
    } else if (params.random() < TOWARDS_CHANCE && pos[1] < 0) {
      direction = [0, 1]
    }
  }

  // Special case: the first carve always goes north
  if (depth === 0) {
    direction = [1, 0]
  }
  console.log("Starting at " + pos + ": " + action + " for " + distance + " spaces in direction " + direction)

  let curPos = pos
  let curHeight = height
  let curTowards = towards
  for (let i = 0; i < distance; i++) {
    // Move perpendicular on the last space
    if (i === distance - 1) {
      direction = [direction[1], direction[0]]
    }

    // Special rules for follow action.
    // Determines direction based on adjacent tiles
    if (action === 'follow') {
      // Track which of the adjacent spaces is the most ledge-like (ledgy?)
      let bestScore = 0
      let bestDir = [0, 1]

      for (const d1 of deltas) {
        const check = add(curPos, d1)
        let score = 0

        // Do not attempt to build on an invalid space
        if (!canBuild(check, terrain, pathData)) {
          continue
        }

        // Loop over spaces adjacent to candidate
        // Score increases with each adjacent space that is lower in height.
        for (const d2 of deltas) {
          const next = add(check, d2)

          score += Math.min(0, curHeight - terrain[next])
        }

        // Track score
        if (score > bestScore) {
          bestScore = score
          bestDir = d1
        }
      }

      // Move in chosen direction
      direction = bestDir
      console.log("Follow, chose direction " + bestDir)
    }

    // Move
    let nextPos = add(curPos, direction)
    let nextHeight = curHeight

    // Move upwards
    if (action === 'stair') {
      nextHeight += 1
    }

    // If the space we're trying to build in is invalid...
    if (!canBuild(nextPos, terrain, pathData)) {
      // If this is a ledge, start following
      if (action === 'turn' && nextHeight > (terrain[nextPos] || 9999999)) {
        // Turn and follow the ledge
        action = 'follow'

        // Add extra distance for the follow action
        distance += 4

        // Check if we crossed back over ourselves
        if (nextHeight - (terrain[nextPos] || 9999999) > 3) {
          curTowards = false
        }

        console.log("Switched to follow mode")

      } else if (action === 'jump' && ((nextHeight - (terrain[nextPos] || 9999999) > 3) || params.random() < 0.3)) {
        // Attempt to jump over the ledge
        // Make sure there is a place we can go a certain distance ahead
        // Check all forward spaces closest first
        for (let j = 1; j <= params.palaceMaxJumpDistance; j ++) {
          const jumpPos = add(nextPos, scale(direction, j))

          // Check if this jump can be built
          if (canBuild(jumpPos, terrain, pathData)) {
            // Check if we crossed back over ourselves
            if (nextHeight - (terrain[nextPos] || 9999999) > 3) {
              curTowards = false
            }

            // Build the jump
            terrain[jumpPos] = nextHeight
            data.endPoint = jumpPos

            // No retaining wall on jump spaces
            tileData[curPos] = { ...tileData[curPos], noRetainingWall: true }
            tileData[jumpPos] = { ...tileData[jumpPos], noRetainingWall: true }

            // Move into new space
            curPos = jumpPos

            // Track distance
            i += j

            // We succeeded, so don't check any more jumps
            console.log("Jumped!")
            break
          }
        }

        // End this step
        console.log("Ended jump")
        distance = i
        break
      }
      else {
        // End this step
        console.log("Ended " + action + " due to invalid space")
        distance = i
        break
      }
    }
    // If the space is valid, build and move into it
    else {
      // Move tile
      terrain[nextPos] = nextHeight
      // Move up endpoint
      data.endPoint = nextPos

      // Mark tile as stair
      if (action === 'stair') {
        tileData[nextPos] = { ...tileData[nextPos], stair: true }
      }

      console.log("Move " + nextPos)

      // Advance value
      curPos = nextPos
      curHeight = nextHeight
    }
  }

  // Clocks are put into the palace at specific points
  if (depth / params.palaceLength > 0.25 && data.firstClockPlaced === false) {
    data.firstClock = curPos
    data.firstClockPlaced = true
  }
  if (depth / params.palaceLength > 0.44 && data.secondClockPlaced === false) {
    data.secondClock = curPos
    data.secondClockPlaced = true
  }
  if (depth / params.palaceLength > 0.62 && data.thirdClockPlaced === false) {
    data.thirdClock = curPos
    data.thirdClockPlaced = true
  }

  // Track how long it's been since we last went up a significant distance
  if (curHeight - height > 4) {
    flatDistance = 0
  }
  else {
    flatDistance = flatDistance + distance
  }

  if (curHeight > height) {
    curTowards = true
  }

  // Prevent infinite recursion by having a chance to give one depth for free
  if (params.random() < 0.003) {
    console.log("free space")
    distance += 1
  }

  // Recurse
  if (depth + distance < params.palaceLength) {
    palaceAlgorithm(terrain, curHeight, curPos, params, curTowards, depth + distance, data, tileData, pathData, flatDistance)
  }
}

function scaleTerrain (terrain, types, params, tileData) {
  const floorDeltas = [
    [0, 0], [0, 1], [0, 2],
    [1, 0], [1, 1], [1, 2],
    [2, 0], [2, 1], [2, 2]
  ]
  const wallDeltas = [
    [-1, -1], [-1, 0], [-1, 1], [-1, 2], [-1, 3],
    [0, 3], [1, 3], [2, 3], [3, 3],
    [3, 2], [3, 1], [3, 0], [3, -1],
    [2, -1], [1, -1], [0, -1]
  ]
  const terrainRet = {}

  for (const pos in terrain) {
    const p = stringToPosition(pos)
    const p2 = scale(p, PALACE_SCALE)

    for (const delta of floorDeltas) {
      const pf = add(delta, p2)
      terrainRet[pf] = terrain[p]
      types[pf] = "floor2"
    }

    for (const delta of wallDeltas) {
      const pf = add(delta, p2)
      if (!(pf in terrainRet)) {
        if (params.palaceIndoors) {
          terrainRet[pf] = PALACE_WALL_HEIGHT
          types[pf] = "wall2"
        } else {
          // Make sure this space wasn't marked as not having a retaining wall
          if (!(tileData[p] && tileData[p].noRetainingWall)) {
            // Determine if this is a junction
            let xPaths = 0
            let yPaths = 0
            if (Math.abs(terrain[add(p, [1, 0])] - terrain[p]) <= 1) { xPaths++ }
            if (Math.abs(terrain[add(p, [-1, 0])] - terrain[p]) <= 1) { xPaths++ }
            if (Math.abs(terrain[add(p, [0, 1])] - terrain[p]) <= 1) { yPaths++ }
            if (Math.abs(terrain[add(p, [0, -1])] - terrain[p]) <= 1) { yPaths++ }

            if (xPaths === 1 || yPaths === 1) {
              const isStair = tileData[p] && tileData[p].stair
              terrainRet[pf] = terrain[p] + (isStair ? 3 : 2)
              types[pf] = "wall2"
            }
          }
        }
      }
    }
  }

  return terrainRet
}

function canBuild (pos, terrain, pathData) {
  // Don't build over lower parts of the structure
  if (pos in terrain) {
    return false
  }
  // Don't build over the path or any tiles directly adjacent
  const adjacent = [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]
  if (pathData) {
    for (const tile of pathData.path) {
      for (const adj of adjacent) {
        // Get position of the tile relative to the tower
        const newTile = subtract(add(tile, adj), pathData.offset)

        // Divide tile position to get position after scaling
        const nx = Math.floor(newTile[0] / PALACE_SCALE)
        const ny = Math.floor(newTile[1] / PALACE_SCALE)
        const divTile = [nx, ny]

        // Check if they overlap
        if (equals(pos, divTile)) {
          return false
        }
      }
    }
  }
  return true
}
