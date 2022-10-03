import { add, scale, subtract } from "./core/vector2.js"
import { GeneratorResult, stringToPosition } from "./procgeneral.js"

const PALACE_LENGTH = 80
const TOWARDS_CHANCE = 0.8
const PALACE_WALL_HEIGHT = 80
const PALACE_FLOOR_HEIGHT = 20
const PALACE_JUMP_LENGTH = 4

export function generatePalace(params) {
  let terrainSmall = {}
  terrainSmall[[0,0]] = PALACE_FLOOR_HEIGHT
  terrainSmall[[0,1]] = PALACE_FLOOR_HEIGHT
  terrainSmall[[0,-1]] = PALACE_FLOOR_HEIGHT
  terrainSmall[[1,0]] = PALACE_FLOOR_HEIGHT
  terrainSmall[[1,1]] = PALACE_FLOOR_HEIGHT
  terrainSmall[[1,-1]] = PALACE_FLOOR_HEIGHT
  terrainSmall[[-1,0]] = PALACE_FLOOR_HEIGHT
  terrainSmall[[-1,1]] = PALACE_FLOOR_HEIGHT
  terrainSmall[[-1,-1]] = PALACE_FLOOR_HEIGHT

  let data = {
    endPoint: [0, 1],
    firstClock: [0, -1],
    firstClockPlaced: false,
    secondClock: [1, 0],
    secondClockPlaced: false,
  }
  palaceAlgorithm(terrainSmall, PALACE_FLOOR_HEIGHT, [0,0], params, false, 0, data)

  // Scale up terrain by a factor of 2
  let types = {}
  let terrain = scaleTerrain(terrainSmall, types, params)

  let ret = new GeneratorResult()
  ret.terrain = terrain
  ret.types = types
  ret.startPoint = [0,0]
  ret.endPoint = scale(data.endPoint, 2)
  ret.presetClocks = [scale(data.firstClock, 2), scale(data.secondClock, 2)]
  return ret
}

function palaceAlgorithm(terrain, height, pos, params, towards, depth, data) {
  // Take an action
  let actionNumber = Math.floor(params.random() * 13)
  let action = "turn" // move forward, turning at a chasm
  if (5 <= actionNumber && actionNumber <= 6) {action = "jump"} // move forward, jumping over chasm
  if (7 <= actionNumber && actionNumber <= 12) {action = "stair"} // staircase upwards, stopping at chasm

  let distance = Math.floor(params.random() * 4) + 2

  if (action == "stair") {
    distance += 3
  }

  // Determine which direction we're going
  let deltas = [[1,0],[0,1],[-1,0],[0,-1]]
  let direction = deltas[Math.floor(params.random() * 4)]
  if (towards) {
    if (params.random() < TOWARDS_CHANCE && pos[0] > 0) {
      direction = [-1,0]
    }
    else if (params.random() < TOWARDS_CHANCE && pos[0] < 0) {
      direction = [1,0]
    }
    else if (params.random() < TOWARDS_CHANCE && pos[1] > 0) {
      direction = [0,-1]
    }
    else if (params.random() < TOWARDS_CHANCE && pos[1] < 0) {
      direction = [0,1]
    }
  }

  // Special case: the first carve always goes north
  if (depth == 0) {
    direction = [-1, 0]
  }

  let curTowards = towards
  let curPos = pos
  let curHeight = height
  for (let i = 0; i < distance; i ++) {
    // Move perpendicular on the last space
    if (i == distance-1) {
      direction = [direction[1], direction[0]]
    }

    if (action == "follow") {
      // Track which of these spaces is the most ledge-like (ledgy?)
      let bestScore = 0
      let bestSpace = add(curPos, [0,1])

      for (const d1 of deltas) {
        let check = add(curPos, d1)
        let score = 0

        // Do not attempt any space that's already carved
        if (terrain[check]) {
          continue
        }

        // Loop over spaces adjacent to candidate
        for (const d2 of deltas) {
          let next = add(check, d2)
          
          if (terrain[next] < curHeight) {score += 1}
        }

        // Track score
        if (score > bestScore) {
          bestScore = score
          bestSpace = check
        }
      }

      // Move to chosen space
      curPos = bestSpace
    }
    else {
      // Move in this direction
      curPos = add(curPos, direction)
    }

    // Move upwards
    if (action == "stair") {
      curHeight += 1
    }

    // Check if this space was already carved
    if (curPos in terrain) {
      // If this is a ledge, start following 
      if (action == "turn" && terrain[curPos] < curHeight) {
        // Turn and follow the ledge
        action = "follow"
        distance += 3
        curPos = subtract(curPos, direction)
        direction = [direction[1], direction[0]]
      }
      else if (action == "stair") {
        // Stairs end here
        curPos = subtract(curPos, direction)
        curHeight -= 1
        distance = i
        break
      }
      else {
        // Attempt to jump over the ledge

        // Make sure there is a place we can go a certain distance ahead
        let jumpPos = add(curPos, scale(direction, PALACE_JUMP_LENGTH))
        if (jumpPos in terrain) {
          curPos = subtract(curPos, direction)
          distance = i
          break
        }
        curTowards = false
      }
    } else {
      // Carve
      terrain[curPos] = curHeight
      // Move up endpoint
      data.endPoint = curPos
    } 
  }

  // If we've gone back up, turn towards the start
  if (action == "stair") {
    curTowards = true
  }

  // Clocks are put at 1/4 and 1/2 points
  if (depth / PALACE_LENGTH > 0.25 && data.firstClockPlaced == false) {
    data.firstClock = curPos
    data.firstClockPlaced = true
  }
  if (depth / PALACE_LENGTH > 0.5 && data.secondClockPlaced == false) {
    data.secondClock = curPos
    data.secondClockPlaced = true
  }

  // Recurse
  if (depth + distance < PALACE_LENGTH) {
    palaceAlgorithm(terrain, curHeight, curPos, params, curTowards, depth + distance, data)
  }
}

function scaleTerrain(terrain, types, params) {
  let floorDeltas = [[0,0],[0,1],[1,0],[1,1]]
  let wallDeltas = [
    [-1,-1],[-1,0],[-1,1],[-1,2],
    [0,2],[1,2],[2,2],
    [2,1],[2,0],[2,-1],
    [1,-1],[0,-1]
  ]
  let terrainRet = {}

  for (const pos in terrain) {
    let p = stringToPosition(pos)
    let p2 = scale(p, 2)

    for (const delta of floorDeltas) {
      let pf = add(delta, p2)
      terrainRet[pf] = terrain[p]
      types[pf] = 4
    }

    if (params.palaceIndoors) {
      for (const delta of wallDeltas) {
        let pf = add(delta, p2)
        if (!(pf in terrainRet)) {
          terrainRet[pf] = PALACE_WALL_HEIGHT
          types[pf] = 4
        }
      }
    }
  }

  return terrainRet
}

