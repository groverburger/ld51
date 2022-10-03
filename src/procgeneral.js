import { add, lerp, distance } from "./core/vector2.js"
import * as utils from "./core/utils.js"
import * as cave from "./proccaves.js"
import * as room from "./procroom.js"
import * as palace from "./procpalace.js"
import * as feature from "./procfeature.js"

const PLAYER_JUMP_HEIGHT = 4
const ABSOLUTE_HEIGHT_DIFFERENCE_MAX = 10
const RANDOM_POINT_ITERATIONS = 50
const WORLD_HEIGHT = 40
const CARVE_PROXIMITY_WEIGHT = 30
const BELL_CURVE_SAMPLES = 8
const PATH_LOOK = 5

export class GeneratorParams {
  // General
  random = () => {return 4}
  stage = 0
  maxPathLength = 73
  caveLayers = 1
  
  constructor(seed) {
    // Set up randomizer
    if (typeof seed != "number") {
      seed = Math.floor(Math.random() * 100000)
    }
    this.random = utils.randomizer(seed)
    console.log("Level Seed: " + seed)

    this.randomize()
  }

  randomize() {
    // General
    this.width = this.bellRandom(40, 10, true)
    this.length = this.bellRandom(70, 10, true)
    this.height = 20

    // Caves
    this.caveSteps = this.bellRandom(7, 1, true)
    this.caveInitialChance = this.bellRandom(0.3, 0.01, false)
    this.caveLayerSpacing = 2
    this.caveMode = 0

    // Terrain
    this.terrainVariance = this.bellRandom(15, 10, true)
    this.terrainRoughness = 0.4

    // Rooms
    this.roomMaxSize = this.bellRandom(7, 5, true)
    this.roomMinSize = this.bellRandom(3, 2, true)
    this.roomWallHeight = this.bellRandom(8, 7, true)
    this.room1Position = this.random()*0.9 + 0.1
    this.room2Position = this.random()*0.9 + 0.1

    // Palace
    this.palaceIndoors = false
    this.palaceLength = 80

    // Misc
    this.favoriteFeature = Math.floor(this.random() * 100)
    this.levelFeature = 0
  }

  advance() {
    // Advance to the next stage
    this.stage ++
    
    // Level-based advancements
    if (this.stage == 5) {
      this.caveMode = 13
      this.palaceIndoors = false
      this.palaceLength = 80
    }
    else if (this.stage == 10) {
      this.caveMode = 13
      this.palaceIndoors = true
      this.palaceLength = 65
    }
    /*else if (this.stage == 15) {
      this.caveMode = 13
      this.palaceIndoors = false
      this.palaceLength = 100
    }*/
    else if (0 < this.stage && this.stage <= 2) {
      this.caveMode = 0
    }
    else if (2 < this.stage && this.stage <= 7) {
      this.caveMode = Math.floor(this.random() * 3)
    }
    else {
      this.caveMode = Math.floor(this.random() * 2) + 1
    }

    if (this.width < 45) {
      this.width += 3
    }
    if (this.length < 90) {
      this.length += 3
    }

    if (this.maxPathLength < 102) {
      this.maxPathLength += 3
    }
    
    this.terrainVariance += 3
    this.roomMaxSize += 1
    this.levelFeature = Math.floor(this.random() * 100)

    // Increase number of layers
    if (this.stage %2 == 0 && this.caveLayers < 15) {this.caveLayers += 1;}

    // Reroll
    if (this.random() < 0.3) { this.caveSteps = this.bellRandom(7, 3, true) }
    if (this.random() < 0.3) { this.caveInitialChance = this.bellRandom(0.3, 0.01, false) }
    if (this.random() < 0.3) { this.roomWallHeight = this.bellRandom(8, 7, true) }
    if (this.random() < 0.3) { this.favoriteFeature = Math.floor(this.random() * 100) }
    if (this.random() < 0.4) { this.room1Position = this.random() }
    if (this.random() < 0.4) { this.room2Position = this.random() }
  }

  bellRandom(center, radius, truncate) {
    let total = 0
    for (let i = 0; i < BELL_CURVE_SAMPLES; i ++) {
      total += this.random()
    }
    let bell = ((total / BELL_CURVE_SAMPLES) * 2) - 1
    bell *= radius
    bell += center
    if (truncate) {
      bell = Math.floor(bell)
    }
    return bell
  }
}

export class GeneratorResult {
  // General
  terrain = {}
  types = {}
  startPoint = [0, 0]
  startAngle = 0
  endPoint = [0, 0]
  presetClocks = []
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

export function guaranteePath(terrain, startPoint, endPoint, params) {
  // Create the list of accessible points from start
  let startAccessibleSet = getAccessibleSpaces(terrain, startPoint, false)

  // Exit out if end point is already accessible from end
  if (startAccessibleSet.has(endPoint.toString())) {
    return
  }

  // Create a list of accessible points from end
  let startAccessible = [...startAccessibleSet]
  let endAccessible = [...getAccessibleSpaces(terrain, endPoint, true)]

  // Find a random point from startAccessible and from endAccessible who are somewhat close
  let closestDist = 1000000
  let closestPoint1 = [0,0]
  let closestPoint2 = [0,0]
  for (let i = 0; i < RANDOM_POINT_ITERATIONS; i ++) {
    // Pick a random point from each set
    let startInd = Math.floor(params.random() * startAccessible.length)
    let pos1 = stringToPosition(startAccessible[startInd])
    let endInd = Math.floor(params.random() * endAccessible.length)
    let pos2 = stringToPosition(endAccessible[endInd])

    // Check their dist
    let dist = distance(pos1, pos2)

    // Weight against putting the path too close to the start or end point
    if (distance(pos1, startPoint) < CARVE_PROXIMITY_WEIGHT) {
      dist += CARVE_PROXIMITY_WEIGHT - distance(pos1, startPoint)
    }
    if (distance(pos2, endPoint) < CARVE_PROXIMITY_WEIGHT) {
      dist += CARVE_PROXIMITY_WEIGHT - distance(pos2, endPoint)
    }

    // Weigh against the points being too close together (and creating a staircase too steep to climb)
    if (dist < Math.abs(terrain[pos1] - terrain[pos2]) * 2) {
      dist += 30
    }

    if (dist < closestDist) {
      closestPoint1 = pos1
      closestPoint2 = pos2
      closestDist = dist
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
        // Make sure we're not navigating past world height
        if (!isExtreme(terrain[adj])) {
          collected.add(adj.toString())
          collected = getAccessibleSpacesRecurse(terrain, adj, backwards, collected)
        }
      }
    }
  }
  return collected
}

export function carveHallway(terrain, pos1, pos2) {
  pos1 = stringToPosition(pos1)
  pos2 = stringToPosition(pos2)

  let dist = distance(pos1, pos2)
  if (dist <= 1) {
    return
  }

  let height1 = terrain[pos1]
  let height2 = terrain[pos2]

  // Iterate over hallway
  for (let i = -1; i <= dist+1; i += 1) {
    let frac = i/dist
    let newPos = lerp(pos1, pos2, frac)
    newPos[0] = Math.round(newPos[0])
    newPos[1] = Math.round(newPos[1])
    let newHeight = Math.floor(((1-frac) * height1) + (frac * height2))

    terrain[newPos] = newHeight
    cave.carvePoint(terrain, newPos)
  }
}

export function findPath(terrain, types, start, end) {
  start = stringToPosition(start)
  end = stringToPosition(end)
  let deltas = [[0, 1], [1, 0], [0, -1], [-1, 0]]
  let queue = [{
    pos: start,
    dist: 0
  }]
  let prev = {}
  prev[start] = start

  // Run search algorithm to find shortest path to the flag
  while (queue.length > 0) {
    let cur = queue.shift()
    for (const delta of deltas) {
      // Get the adjacent space
      let adj = add(cur.pos, delta)
      cur.pos = stringToPosition(cur.pos)
      adj = stringToPosition(adj)
      // Make sure this space hasn't already been collected
      if (!(adj in prev)) {
        // check if the height difference of the adjacent space is at most jump height
        let heightDifference = (terrain[adj] - terrain[cur.pos])
        let absoluteHeightDifference = Math.abs(terrain[cur.pos] - terrain[adj])
        absoluteHeightDifference = 0
        if (heightDifference <= PLAYER_JUMP_HEIGHT) {
          if (absoluteHeightDifference <= ABSOLUTE_HEIGHT_DIFFERENCE_MAX) {
            // Make sure we're not navigating past world height
            if (!isExtreme(terrain[adj])) {
              prev[adj] = cur.pos
              queue.push({
                pos: adj,
                dist: cur.dist + 1
              })
            }
          }
        }
      }
    }
  }

  // Retrace shortest path
  if (!(end in prev)) {
    // debug
    let ret = []

    for (const reached in prev) {
      ret.push(stringToPosition(reached))
    }

    return ret
  }
  let retrace = end;
  let path = [end]
  while (prev[retrace].toString() != retrace.toString()) {
    retrace = prev[retrace]
    path.push(retrace)
  }
  return path
}

export function paintPath(types, path, params) {
  let deltas = [[0, 0], [0, 1], [1, 0], [0, -1], [-1, 0], [1, 1], [-1, 1], [1, -1], [-1, -1]]
  
  for (const space of path) {
    for (const delta of deltas) {
      if (params.random() < 0.5) {
        let newSpace = add(delta, space)
        // Make sure we don't paint over other painted tiles
        if (!(newSpace in types) || types[newSpace] == 0) {
          types[newSpace] = 3
        }
      }
    }
  }  
}

function buildAlongPath(terrain, types, path, params) {
  if (path.length < 2) {
    return
  }

  // Determine build locations
  let build1 = path[Math.floor(path.length * params.room1Position)]
  let build2 = path[Math.floor(path.length * params.room2Position)]

  // Build the rooms
  room.insertRoom(terrain, types, build1, {
    ...params,
    height: terrain[build1]
  })
  room.insertRoom(terrain, types, build2, {
    ...params,
    height: terrain[build2]
  })

  // Build doorways
  
  for (let i = 0; i < path.length; i ++) {
    let pos = path[i]
    // If wall...
    if (types[pos] == 2) {
      // Carve doorway
      makeDoorway(terrain, types, pos)
    }
  }
}

function isExtreme(height) {
  if (height >= WORLD_HEIGHT) {
    return true
  }
  if (height <= 0) {
    return true
  }
  return false
}

function makeDoorway(terrain, types, pos) {
  let deltas = [[0, 0], [0, 1], [1, 0], [0, -1], [-1, 0], [1, 1], [-1, 1], [1, -1], [-1, -1]]

  // Find average ground height
  let total = 0
  let count = 0
  for (const delta of deltas) {
    let newPos = add(pos, delta)
    if (types[newPos] != 2 && !isExtreme(terrain[newPos])) {
      count += 1
      total += terrain[newPos]
    }
  }
  let average = Math.floor(total/count)

  // Carve doorway
  for (const delta of deltas) {
    let newPos = add(pos, delta)
    terrain[newPos] = average
  }
}

export function generateEverything(params) {
  // Bonus levels
  if (params.caveMode == 13) {
    
    let res = cave.generateCaves(params)
    let res2 = palace.generatePalace(params)

    let pt = [-15, -35]

    let final = new GeneratorResult()

    mergeTerrain(final.terrain, res.terrain, pt)
    mergeTerrain(final.types, res.types, pt)

    mergeTerrain(final.terrain, res2.terrain, [0, 0])
    mergeTerrain(final.types, res2.types, [0, 0])

    final.startAngle = res2.startAngle
    final.startPoint = res2.startPoint
    final.endPoint = res2.endPoint
    final.presetClocks = res2.presetClocks

    return final
  }

  // Generate caves
  let gen = cave.generateCaves(params)

  // Make sure it is possible to complete the level
  guaranteePath(gen.terrain, gen.startPoint, gen.endPoint, params)

  // Create the path and the buildings on it
  let path = findPath(gen.terrain, gen.types, gen.startPoint, gen.endPoint)
  paintPath(gen.types, path, params)
  buildAlongPath(gen.terrain, gen.types, path, params)

  // If the path is too long, shorten it
  if (path.length > params.maxPathLength) {
    gen.endPoint = path[path.length - params.maxPathLength]
    cave.carvePoint(gen.terrain, gen.endPoint)

    console.log("Path length: " + params.maxPathLength)
  }
  else {
    console.log("Path length: " + path.length)
  }

  // Set the player's starting rotation so that they look towards the path
  if (path.length > PATH_LOOK + 2) {
    let point1 = path[path.length-1]
    let point2 = path[path.length - PATH_LOOK]

    let angle = utils.angleTowards(point2[0], point2[1], point1[0], point1[1])
    gen.startAngle = angle
  }

  // Do another guarantee pass
  guaranteePath(gen.terrain, gen.startPoint, gen.endPoint, params)

  return gen

}
