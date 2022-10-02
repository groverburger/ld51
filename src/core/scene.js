import {width, height, isWebglEnabled} from "../config.js"
import {ctx} from "./game.js"
import assets from "../assets.js"
import SpatialHash from "./spatialhash.js"
import * as gfx from "./webgl.js"
import * as u from "./utils.js"
import * as vec2 from "./vector2.js"
import * as mat from "./matrices.js"
import * as vec3 from "./vector3.js"

export default class Scene {
  things = []
  layers = {}
  layerOrder = []
  paused = false
  camera = {
    position: [width/2, height/2],
    rotation: 0,
    scale: [1, 1],
  }
  camera3D = {
    width,
    height,
    position: [0, 0, 0],
    yaw: 0,
    pitch: 0,
    fov: 2,
    viewMatrix: mat.getView(),
    projectionMatrix: mat.getPerspective(),
    lookVector: [1, 0, 0],
    setUniforms() {
      gfx.set("viewMatrix", this.viewMatrix)
      gfx.set("projectionMatrix", this.projectionMatrix)
    }
  }
  map = null
  spatialHash = null
  screenShake = {vector: [0, 0], amount: 0, strength: 2}

  // things can assign themselves to this object
  // so that other things in the scene can reference them by name
  // things are automatically culled from this object when they die
  namedThings = {}

  constructor(name) {
    this.name = name
    const mapData = assets.scenes[name]
    this.map = loadMap(JSON.parse(mapData))
    this.spatialHash = new SpatialHash()

    // for use when any things want to have random values
    // that are consistent across scene resets
    this.random = u.randomizer()
  }

  init() {
    const order = (thing) => {
      for (const field of thing.fieldInstances) {
        if (field.__identifier == "updatePriority") {
          return field.__value
        }
      }
      return 0
    }
    this.map.things.sort((a, b) => order(b) - order(a))

    for (const thing of this.map.things) {
      this.addThing(new assets.things[thing.__identifier](thing))
    }
  }

  update() {
    const paused = this.paused
    this.paused = false

    // update all things in the scene
    let i = 0
    while (i < this.things.length) {
      const thing = this.things[i]
      const previousDepth = thing.depth
      const [xLast, yLast] = thing.position

      if (!thing.dead && (!paused || thing.pauseException)) thing.update()

      if (thing.dead) {
        // this thing died, so remove it from depth layers, spatial hash, and list
        thing.onDeath()
        const layer = this.layers[Math.round(previousDepth) || 0]
        if (layer) layer.splice(layer.indexOf(thing), 1)
        this.spatialHash.remove(thing)

        // we don't have to increment the index, as the other things "fall into"
        // this thing's current slot
        this.things.splice(i, 1)
      } else {
        // if depth changed, update render order
        if (previousDepth != thing.depth) this.updateDepth(thing, previousDepth)

        // if position changed, update spatial hash
        if (xLast != thing.position[0] || yLast != thing.position[1]) {
          this.spatialHash.update(thing, ...thing.aabbSpatialHash())
        }

        i++
      }
    }

    // make sure all named things are still alive
    // otherwise remove them from the object
    for (const name in this.namedThings) {
      if (this.namedThings[name].dead) {
        delete this.namedThings[name]
      }
    }

    // handle screenshake
    if (this.screenShake.amount > 0) {
      this.screenShake.amount -= 1
      if (this.screenShake.amount == 0) {
        this.screenShake.vector = [0, 0]
      } else {
        this.screenShake.vector = vec2.angleToVector(u.random(0, Math.PI*2), this.screenShake.strength)
      }
    }
  }

  draw() {
    const camera = this.camera
    ctx.save()

    // draw screenshake, and black offscreen border to cover up gaps
    if (this.screenShake.amount > 0) {
      ctx.translate(...this.screenShake.vector)
      ctx.fillStyle = "black"
      const s = this.screenShake.strength + 4
      ctx.fillRect(-s, -s, width+s*2, s)
      ctx.fillRect(-s, height, width+s*2, s)
      ctx.fillRect(-s, 0, s, height)
      ctx.fillRect(width, 0, s, height)
    }

    ctx.translate(width/2, height/2)
    ctx.scale(...camera.scale)
    ctx.rotate(camera.rotation)
    ctx.translate(-camera.position[0], -camera.position[1])

    for (const level of this.map.levels) {
      if (level.visuals && level.isVisible) {
        ctx.drawImage(level.visuals, level.aabb[0], level.aabb[1])
      }
    }

    const layerOrder = Object.keys(this.layers).map(Number).sort((a, b) => a - b)
    for (const layer of layerOrder) {
      for (const thing of this.layers[layer]) {
        thing.draw()
      }
    }

    ctx.restore()

    for (const layer of layerOrder) {
      for (const thing of this.layers[layer]) {
        thing.guiDraw()
      }
    }
  }

  clearScreen() {
    const bgColor = this.getLevelAt(...this.camera.position)?.bgColor || "#4488ff"
    if (isWebglEnabled) {
      // webgl is enabled, so fill color on the webgl canvas instead of the 2d canvas
      const { gl } = gfx
      gl.clearColor(
        parseInt(bgColor.slice(1,3), 16)/255,
        parseInt(bgColor.slice(3,5), 16)/255,
        parseInt(bgColor.slice(5,7), 16)/255,
        1
      )
      gl.clearDepth(1.0)
      gl.enable(gl.DEPTH_TEST)
      gl.depthFunc(gl.LEQUAL)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
      gl.enable(gl.BLEND)
      gl.blendEquation(gl.FUNC_ADD)
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

      // update 3D camera matrix and look vector
      this.camera3D.viewMatrix = mat.getView({
        position: this.camera3D.position,
        target: vec3.add(this.camera3D.position, this.camera3D.lookVector)
      })
      this.camera3D.projectionMatrix = mat.getPerspective({
        aspect: width/height
      })
      this.camera3D.lookVector = vec3.anglesToVector(
        this.camera3D.yaw,
        this.camera3D.pitch
      )

      // clear the 2d canvas
      ctx.clearRect(0, 0, width, height)
    } else {
      // no webgl, fill the 2d canvas with background color
      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, width, height)
    }
  }

  // returns which level contains this world coordinate
  getLevelAt(x, y) {
    for (const level of this.map.levels) {
      if (level.aabb[0] <= x && level.aabb[2] > x &&
          level.aabb[1] <= y && level.aabb[3] > y) {
        return level
      }
    }
  }

  // returns map tile at world coordinates
  getTileAtWorld(x, y, layer="Main") {
    const size = this.map.gridSize
    return this.map.tileLayers[layer][Math.floor(x/size) + "," + Math.floor(y/size)]
  }

  // returns map tile at tile coordinates
  getTileAt(x, y, layer="Main") {
    return this.map.tileLayers[layer][Math.floor(x) + "," + Math.floor(y)]
  }

  // adds the given object instance to the thing list
  addThing(thing) {
    this.things.push(thing)
    this.spatialHash.add(thing, ...thing.aabbSpatialHash())
    this.updateDepth(thing)
    return thing
  }

  shakeScreen(amount=6) {
    this.screenShake.amount = amount
  }

  // update the depth of a thing from one depthSet to another
  updateDepth(thing, previousDepth=0) {
    const depth = Math.round(thing.depth) || 0

    previousDepth = Math.round(previousDepth)
    if (previousDepth != depth) {
      this.layers[previousDepth] = this.layers[previousDepth] || []
      this.layers[previousDepth].splice(this.layers[previousDepth].indexOf(thing), 1)
      if (this.layers[previousDepth].length == 0) {
        delete this.layers[previousDepth]
      }
    }

    this.layers[depth] = this.layers[depth] || []
    this.layers[depth].push(thing)
  }
}

function loadMap(mapData) {
  // get a tileset's image from its uid
  const uidToTileset = {}
  for (const tileset of mapData.defs.tilesets) {
    uidToTileset[tileset.uid] = tileset.identifier
  }
  const getTileset = (uid) => assets.images[uidToTileset[uid]]

  const map = {
    levels: [],
    tileLayers: {},
    things: [],
    gridSize: null,
  }

  // start parsing all the levels in the mapdata
  for (const levelData of mapData.levels) {
    const level = {
      ...levelData,
      isVisible: true,
      aabb: [
        levelData.worldX,
        levelData.worldY,
        levelData.worldX + levelData.pxWid,
        levelData.worldY + levelData.pxHei
      ],
    }

    const getLevelData = (name) => {
      for (const field of levelData.fieldInstances) {
        if (field.__identifier == name) {
          return field.__value
        }
      }
    }

    const drawTiles = (layerInstance, which) => {
      if (getLevelData("noVisuals")) return

      if (!level.visuals) {
        level.visuals = document.createElement("canvas")
        level.visuals.width = levelData.pxWid
        level.visuals.height = levelData.pxHei
      }

      const ctx = level.visuals.getContext("2d")
      const tileset = getTileset(layerInstance.__tilesetDefUid)
      for (const tile of layerInstance[which]) {
        ctx.drawImage(tileset, ...tile.src, 64, 64, ...tile.px, 64, 64)
      }
    }

    for (const layerInstance of levelData.layerInstances) {
      if (layerInstance.__type == "IntGrid") {
        if (map.gridSize == null) {
          map.gridSize = layerInstance.__gridSize
        } else if (map.gridSize != layerInstance.__gridSize) {
          throw new Error(`Grid size mismatch with layer ${layerInstance.__identifier}!`)
        }

        map.tileLayers[layerInstance.__identifier] = map.tileLayers[layerInstance.__identifier] || {}
        const tileLayer = map.tileLayers[layerInstance.__identifier]

        let i = 0
        for (const tile of layerInstance.intGridCsv) {
          const x = i%layerInstance.__cWid
          const y = Math.floor((i - x)/layerInstance.__cWid)
          const wx = x + Math.floor(levelData.worldX/layerInstance.__gridSize)
          const wy = y + Math.floor(levelData.worldY/layerInstance.__gridSize)

          tileLayer[wx + "," + wy] = tile
          i += 1
        }
        continue
      }

      if (layerInstance.__type == "Entities") {
        for (const thing of layerInstance.entityInstances) {
          thing.position = [
            thing.px[0] + level.aabb[0],
            thing.px[1] + level.aabb[1],
          ]
          map.things.push(thing)
        }
        continue
      }

      if (layerInstance.__type == "Tiles") drawTiles(layerInstance, "gridTiles")
      if (layerInstance.__type == "AutoLayer") drawTiles(layerInstance, "autoLayerTiles")
    }

    map.levels.push(level)
  }

  // make the gridSize big if it doesn't exist
  // to optimize tile-based collision detection
  if (map.gridSize == null) {
    map.gridSize = 1024
  }

  return map
}
