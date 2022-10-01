import {getScene} from "./core/game.js"
import Thing from "./core/thing.js"
import * as gfx from "./core/webgl.js"
import * as mat from "./core/matrices.js"
import * as u from "./core/utils.js"
import * as vec2 from "./core/vector2.js"
import * as vec3 from "./core/vector3.js"
import GeneratorParams, * as proc from "./procgeneral.js"
import * as terrain from "./procterrain.js"
import * as caves from "./proccaves.js"
import assets from "./assets.js"
import SpatialHash from "./core/spatialhash.js"
import Player from "./player.js"
const utils = u

let cache = {
  name: "",
  object: null
}

export default class Terrain extends Thing {
  seaLevel = -256
  heightMap = [-256]
  spatialHash = new SpatialHash()
  texturedMeshes = {}
  texturedVerts = {}
  time = 0
  map = {}

  constructor(data) {
    super(data)
    this.position[2] = 0
    this.setName("terrain")

    for (let i=1; i<=128; i++) {
      this.heightMap[i] = (i-1)*32
    }
    this.heightMap[0] = this.seaLevel
    this.heightMap["undefined"] = this.seaLevel

    // if the scene hasn't changed, load the terrain from cache
    // because generating terrain takes a second
    if (cache.name == getScene().name) {
      for (const field in cache.object) {
        this[field] = cache.object[field]
      }
      this.time = 0
      return
    }
    cache.name = getScene().name
    cache.object = this

    this.generate()
    this.createMesh()
    this.populate()
  }

  createMesh() {
    /********************************************************************************
       list all the tile positions in the map
     ********************************************************************************/

    const grid = 64
    const tileSet = new Set()
    for (const tile of Object.keys(this.map)) {
      const [x, y] = tile.split(",").map(Number)
      tileSet.add([x, y])
      tileSet.add([x+1, y])
      tileSet.add([x-1, y])
      tileSet.add([x, y+1])
      tileSet.add([x, y-1])
      tileSet.add([x+1, y+1])
      tileSet.add([x-1, y+1])
      tileSet.add([x+1, y-1])
      tileSet.add([x-1, y-1])
    }
    const tiles = [...tileSet.values()]

    /********************************************************************************
       geometry functions
     ********************************************************************************/

    const offset = (x, y, z=0) => {
      //const f = 0.3
      //x += u.octaveNoise(f*x+102, f*y+102)*32
      //y += u.octaveNoise(f*x, f*y)*32
      return [x, y, z]
    }

    const wallVerts = []
    const floorVerts = []
    const textureScale = 1/256
    const meshMap = {}

    const addWall = (p1, p2, v, height, {texture="stone", flair}={}) => {
      p1 = offset(...p1)
      p2 = offset(...p2)
      const normal = vec2.normalize([p2[1] - p1[1], -1 * (p2[0] - p1[0])])

      const addTriangle = (p1, p2, p3, texture, {xWrap=true, yWrap=true, solid=true, norm=[...normal, 0]}={}) => {
        const points = [p1, p2, p3]
        const zMin = points.reduce((prev, now) => Math.min(prev, now[2]), Infinity)
        const zMax = points.reduce((prev, now) => Math.max(prev, now[2]), 0 - Infinity)
        const utils = u

        for (const [x, y, z] of points) {
          let u, v

          if (Math.abs(normal[1]) <= 0.05) {
            u = -1 * y*textureScale
            v = -1 * z*textureScale
          } else {
            u = -1 * x*textureScale / normal[1]
            v = -1 * z*textureScale
          }

          if (!yWrap) {
            v = utils.map(z, zMin, zMax, 1, 0)
          }

          if (!this.texturedVerts[texture]) {
            this.texturedVerts[texture] = []
          }
          this.texturedVerts[texture].push(
            x,y,z,
            u,v,
            ...norm
          )
        }

        if (solid) this.addToSpatialHash(p1, p2, p3, {material: texture})
      }

      // solid wall
      addTriangle(
        [p1[0], p1[1], height],
        [p2[0], p2[1], height],
        [p1[0], p1[1], v],
        texture
      )
      addTriangle(
        [p2[0], p2[1], v],
        [p1[0], p1[1], v],
        [p2[0], p2[1], height],
        texture
      )

      if (false && flair) {
        addTriangle(
          [p1[0], p1[1], height],
          [p2[0], p2[1], height],
          [p1[0], p1[1], height+256],
          flair,
          {solid: false, yWrap: false, norm: [0, 0, 1]}
        )
        addTriangle(
          [p2[0], p2[1], height+256],
          [p1[0], p1[1], height+256],
          [p2[0], p2[1], height],
          flair,
          {solid: false, yWrap: false, norm: [0, 0, 1]}
        )
      }
    }

    const add3DFloorTri = (p1, p2, p3, texture) => {
      if (vec3.getNormalOf(p1, p2, p3)[2] < 0) {
        [p1, p2] = [p2, p1]
      }
      this.addToSpatialHash(p1, p2, p3, {material: texture})

      const addVert = (x, y, z) => {
        const u = x * textureScale
        const v = y * textureScale
        if (!this.texturedVerts[texture]) {
          this.texturedVerts[texture] = []
        }
        this.texturedVerts[texture].push(x,y,z, u,v, 0,0,1)
      }

      addVert(...p1)
      addVert(...p2)
      addVert(...p3)
    }

    const addFloorTri = (p1, p2, p3, height, texture) => {
      p1 = offset(...p1, height)
      p2 = offset(...p2, height)
      p3 = offset(...p3, height)
      add3DFloorTri(p1, p2, p3, texture)
    }

    /********************************************************************************
       parse tiles into terrain
     ********************************************************************************/

    const meshed = {}
    const greedyMesh = (x, y) => {
      const xMin = x, yMin = y
      const tile = this.getTileAt(x, y)
      const tileType = this.getTileAt(x, y, "TileType")
      while (
        this.getTileAt(x, y) == tile &&
        this.getTileAt(x, y, "TileType") == tileType
      ) {
        meshed[[x,y]] = true
        y += 1
      }
      const yMax = y

      let stop = false
      while (!stop) {
        for (let y=yMin; y<=yMax; y++) {
          if (
            this.getTileAt(x, y) != tile ||
            this.getTileAt(x, y, "TileType") != tileType
          ) {
            stop = true
            break
          }
          meshed[[x,y]] = true
        }
        x += 1
      }
      const xMax = x

      return [xMin, yMin, xMax, yMax]
    }

    const getFloorTexture = (tileType) => {
      return tileType ? (["grass", "sand"])[tileType-1] : "grass"
    }

    const getWallTexture = (tileType) => {
      return tileType ? (["stone", "sand"])[tileType-1] : "stone"
    }

    const getFlairTexture = (tileType) => {
      return tileType ? (["grassSide", undefined])[tileType-1] : "grassSide"
    }

    const isSlope = (tileType) => {
      return tileType ? ([true, true])[tileType-1] : false
    }

    const cos = what => Math.round(Math.cos(what))
    const sin = what => Math.round(Math.sin(what))
    const pi = Math.PI
    const tau = Math.PI*2
    const seaLevel = this.seaLevel
    for (let [x, y] of tiles) {
      const tile = this.getTileAt(x, y)
      if (!tile) continue
      const height = this.heightMap[tile]

      if (!meshed[[x,y]]) {
        const greedy = greedyMesh(x, y).map(v => v*grid)
        addFloorTri(
          [greedy[0], greedy[1]],
          [greedy[2], greedy[1]],
          [greedy[0], greedy[3]],
          height,
          getFloorTexture(this.getTileAt(x, y, "TileType"))
        )
        addFloorTri(
          [greedy[2], greedy[3]],
          [greedy[2], greedy[1]],
          [greedy[0], greedy[3]],
          height,
          getFloorTexture(this.getTileAt(x, y, "TileType"))
        )
      }

      x *= grid
      y *= grid

      const cx = x+grid/2
      const cy = y+grid/2
      const center = [cx, cy]

      const heightAt = (x, y) => this.heightMap[this.getTileAtWorld(x, y)]

      // deal with sloped floors
      if (isSlope(this.getTileAtWorld(x, y, "TileType"))) {
        const slopeDistance = height == 0 ? grid*10 : grid*1.5

        for (let i=0; i<tau; i+=tau/4) {
          const normal = [cos(i), sin(i)]
          const coord = [cx + normal[0]*64, cy + normal[1]*64]
          const otherHeight = heightAt(...coord)
          const otherTiletype = this.getTileAtWorld(...coord)
          if (otherHeight >= height) continue
          const turn = [cos(i+pi/2), sin(i+pi/2)]

          add3DFloorTri(
            [
              center[0] + normal[0]*grid/2 + turn[0]*grid/2,
              center[1] + normal[1]*grid/2 + turn[1]*grid/2,
              height
            ],

            [
              center[0] + normal[0]*grid/2 - turn[0]*grid/2,
              center[1] + normal[1]*grid/2 - turn[1]*grid/2,
              height
            ],

            [
              center[0] + normal[0]*slopeDistance + turn[0]*grid/2,
              center[1] + normal[1]*slopeDistance + turn[1]*grid/2,
              otherHeight
            ],

            getFloorTexture(this.getTileAtWorld(x, y, "TileType"))
          )

          add3DFloorTri(
            [
              center[0] + normal[0]*grid/2 - turn[0]*grid/2,
              center[1] + normal[1]*grid/2 - turn[1]*grid/2,
              height
            ],

            [
              center[0] + normal[0]*slopeDistance - turn[0]*grid/2,
              center[1] + normal[1]*slopeDistance - turn[1]*grid/2,
              otherHeight
            ],

            [
              center[0] + normal[0]*slopeDistance + turn[0]*grid/2,
              center[1] + normal[1]*slopeDistance + turn[1]*grid/2,
              otherHeight
            ],

            getFloorTexture(this.getTileAtWorld(x, y, "TileType"))
          )
        }

        // deal with corners
        for (let i=0; i<tau; i+=tau/4) {
          const normal = [cos(i), sin(i)]
          const turn = [cos(i+pi/2), sin(i+pi/2)]
          const coord = [cx + normal[0]*64 + turn[0]*64, cy + normal[1]*64 + turn[1]*64]
          const otherHeight = heightAt(...coord)
          if (otherHeight >= height) continue

          add3DFloorTri(
            [
              center[0] + normal[0]*grid/2 + turn[0]*grid/2,
              center[1] + normal[1]*grid/2 + turn[1]*grid/2,
              height
            ],

            [
              center[0] + normal[0]*grid/2 + turn[0]*slopeDistance,
              center[1] + normal[1]*grid/2 + turn[1]*slopeDistance,
              otherHeight
            ],

            [
              center[0] + normal[0]*slopeDistance + turn[0]*grid/2,
              center[1] + normal[1]*slopeDistance + turn[1]*grid/2,
              otherHeight
            ],

            getFloorTexture(this.getTileAtWorld(x, y, "TileType"))
          )
        }

        continue
      }

      for (let i=0; i<tau; i+=tau/4) {
        const normal = [cos(i), sin(i)]
        const coord = [cx + normal[0]*64, cy + normal[1]*64]
        if (heightAt(...coord) >= height) continue
        const turn = [cos(i+pi/2), sin(i+pi/2)]

        // double diagonals
        if (false && !meshMap[[coord]]) {
          const n1 = [
            coord[0] + turn[0]*64,
            coord[1] + turn[1]*64,
          ]

          const n2 = [
            coord[0] - turn[0]*64,
            coord[1] - turn[1]*64,
          ]

          const n3 = [
            coord[0] - turn[0]*64 - normal[0]*64,
            coord[1] - turn[1]*64 - normal[1]*64,
          ]

          // diagonals
          if (heightAt(...n1) == height && heightAt(...n2) == heightAt(...coord) && heightAt(...n3) == height) {
            meshMap[coord] = height
            meshMap[n2] = height

            addWall(
              [
                center[0] + normal[0]*grid*3/2 + turn[0]*grid/2,
                center[1] + normal[1]*grid*3/2 + turn[1]*grid/2,
              ],
              [
                n3[0] + normal[0]*grid/2 + turn[0]*grid/-2,
                n3[1] + normal[1]*grid/2 + turn[1]*grid/-2,
              ],
              -256,
              height
            )

            addFloorTri(
              [
                center[0] + normal[0]*grid*3/2 + turn[0]*grid/2,
                center[1] + normal[1]*grid*3/2 + turn[1]*grid/2,
              ],
              [
                center[0] + normal[0]*grid/2 + turn[0]*grid/2,
                center[1] + normal[1]*grid/2 + turn[1]*grid/2,
              ],
              [
                center[0] + normal[0]*grid/2 + turn[0]*grid/-2,
                center[1] + normal[1]*grid/2 + turn[1]*grid/-2,
              ],
              height,
              getFloorTexture(this.getTileAtWorld(x, y, "TileType"))
            )
          }
        }

        // diagonals
        if (!meshMap[[coord]]) {
          const n1 = [
            coord[0] + turn[0]*64,
            coord[1] + turn[1]*64,
          ]

          if (heightAt(...n1) == height) {
            let powerIndex = Math.round(i*4/tau)
            meshMap[coord] = meshMap[coord] | 2**powerIndex
            meshMap[coord] = meshMap[coord] | 2**((powerIndex+1)%4)
            meshMap[coord] = meshMap[coord] | 2**((powerIndex+2)%4)
            meshMap[coord] = meshMap[coord] | 2**((powerIndex+3)%4)
            meshMap[coord] = meshMap[coord] | 2**((powerIndex+4)%4)

            addWall(
              [
                center[0] + normal[0]*grid*3/2 + turn[0]*grid/2,
                center[1] + normal[1]*grid*3/2 + turn[1]*grid/2,
              ],
              [
                center[0] + normal[0]*grid/2 + turn[0]*grid/-2,
                center[1] + normal[1]*grid/2 + turn[1]*grid/-2,
              ],
              -256,
              height,
              {
                texture: getWallTexture(this.getTileAtWorld(x, y, "TileType")),
                flair: getFlairTexture(this.getTileAtWorld(x, y, "TileType"))
              }
            )

            addFloorTri(
              [
                center[0] + normal[0]*grid*3/2 + turn[0]*grid/2,
                center[1] + normal[1]*grid*3/2 + turn[1]*grid/2,
              ],
              [
                center[0] + normal[0]*grid/2 + turn[0]*grid/2,
                center[1] + normal[1]*grid/2 + turn[1]*grid/2,
              ],
              [
                center[0] + normal[0]*grid/2 + turn[0]*grid/-2,
                center[1] + normal[1]*grid/2 + turn[1]*grid/-2,
              ],
              height,
              getFloorTexture(this.getTileAtWorld(x, y, "TileType"))
            )
          }
        }
      }

      for (let i=0; i<tau; i+=tau/4) {
        const normal = [cos(i), sin(i)]
        const coord = [cx + normal[0]*64, cy + normal[1]*64]
        if (heightAt(...coord) >= height) continue
        const turn = [cos(i+pi/2), sin(i+pi/2)]
        //if (meshMap[coord] & 2**Math.round(i*4/tau)) continue
        addWall(
          [
            center[0] + normal[0]*grid/2 + turn[0]*grid/2,
            center[1] + normal[1]*grid/2 + turn[1]*grid/2,
          ],
          [
            center[0] + normal[0]*grid/2 + turn[0]*grid/-2,
            center[1] + normal[1]*grid/2 + turn[1]*grid/-2,
          ],
          -256,
          height,
          {
            texture: getWallTexture(this.getTileAtWorld(x, y, "TileType")),
            flair: getFlairTexture(this.getTileAtWorld(x, y, "TileType"))
          }
        )
      }
    }

    for (const texture in this.texturedVerts) {
      this.texturedMeshes[texture] = gfx.createMesh(this.texturedVerts[texture])
    }
  }

  update() {
    this.time += 1
  }

  draw(_ctx) {
    gfx.setShader(assets.shaders.defaultShaded)
    gfx.set("modelMatrix", mat.getIdentity())
    getScene().camera3D.setUniforms()
    gfx.set("color", [1,1,1,1])
    //const {gl} = gfx
    //gl.enable(gl.CULL_FACE)
    //gl.cullFace(gl.FRONT)

    /*
    gfx.setTexture(assets.textures.grass)
    gfx.drawMesh(this.floors)

    gfx.setTexture(assets.textures.stone)
    gfx.drawMesh(this.walls)
    */

    for (const texture in this.texturedMeshes) {
      gfx.setTexture(assets.textures[texture])
      gfx.drawMesh(this.texturedMeshes[texture])
    }

    // draw skybox without writing to depth buffer
    gfx.gl.depthMask(false)
    gfx.setShader(assets.shaders.default)
    getScene().camera3D.setUniforms()
    gfx.set("color", [1,1,1,1])
    gfx.setTexture(assets.textures.skybox)
    gfx.set("modelMatrix", mat.getTransformation({
      translation: [
        getScene().camera3D.position[0],
        getScene().camera3D.position[1],
        getScene().camera3D.position[2] - 400
      ],
      scale: 10000,
    }))
    gfx.drawMesh(assets.models.cylinder)
    gfx.gl.depthMask(true)

    // draw a few layers of increasingly
    // opaque blue quads under the water surface
    gfx.setTexture(assets.textures.square)
    gfx.set("color", u.stringToColor("#5B6EE188"))
    for (let i=0; i<3; i++) {
      gfx.set("modelMatrix", mat.getTransformation({
        translation: [
          getScene().camera3D.position[0],
          getScene().camera3D.position[1],
          u.map(i, 0, 3, -256, -64) + 48
        ],
        scale: 10000,
      }))
      gfx.drawQuad(
       -1, -1, 0,
        1, -1, 0,
       -1, 1, 0,
        1, 1, 0,
      )
    }

    // draw ocean surface
    gfx.setShader(assets.shaders.scrolling)
    getScene().camera3D.setUniforms()
    gfx.setTexture(assets.textures.water)
    gfx.set("color", [1,1,1,0.5])
    gfx.set("scale", 0.001)
    gfx.set("offset", [this.time/1000, 0])
    gfx.set("cutoff", 0)
    gfx.set("modelMatrix", mat.getTransformation({
      translation: [
        getScene().camera3D.position[0],
        getScene().camera3D.position[1],
        -16
      ],
      scale: 10000,
    }))
    gfx.drawQuad(
      -1, -1, 0,
      1, -1, 0,
      -1, 1, 0,
      1, 1, 0,
    )

    // draw clouds
    gfx.setShader(assets.shaders.clouds)
    getScene().camera3D.setUniforms()
    gfx.setTexture(assets.textures.perlin)
    gfx.set("color", [1,1,1,1])
    gfx.set("scale", 0.00001)
    gfx.set("offset", [this.time/100000, 0])
    gfx.set("cutoff", 0.65)
    gfx.set("modelMatrix", mat.getTransformation({
      translation: [
        getScene().camera3D.position[0],
        getScene().camera3D.position[1],
        4096
      ],
      scale: 100000,
    }))
    gfx.drawQuad(
      -1, -1, 0,
      1, -1, 0,
      -1, 1, 0,
      1, 1, 0,
    )
  }

  addToSpatialHash(p1, p2, p3, {material}={}) {
    const x = [p1, p2, p3].reduce((prev, now) => Math.min(prev, now[0]), Infinity)
    const y = [p1, p2, p3].reduce((prev, now) => Math.min(prev, now[1]), Infinity)
    const w = [p1, p2, p3].reduce((prev, now) => Math.max(prev, now[0]-x), 1)
    const h = [p1, p2, p3].reduce((prev, now) => Math.max(prev, now[1]-y), 1)

    let normal = vec3.getNormalOf(p1, p2, p3)
    if (normal[2] > 0.99) {
      normal = [0, 0, 1]
    }

    let midpoint = vec3.multiply(vec3.add(vec3.add(p1, p2), p3), 1/3)

    const tri = {
      points: [p1, p2, p3],
      midpoint,
      normal,
      material
    }

    this.spatialHash.add(tri, x, y, w, h)

    return tri
  }

  getGroundHeight(x, y, z=Infinity) {
    return this.spatialHash.query(x-16, y-16, 32, 32).reduce((prev, now) => {
      if (now.points[0][2] > z) return prev

      if (vec3.isInsideTriangle(...now.points, [0, 0, 1], [x, y, 0])) {
        return Math.max(prev, now.points[0][2])
      }

      return prev
    }, -256)
  }

  query(x, y, w, h) {
    return this.spatialHash.query(x, y, w, h)
  }

  getTileAt(x, y, what) {
    if (what == "TileType") { return undefined }
    return this.map[[x,y]]
  }

  getTileAtWorld(x, y, what) {
    return this.getTileAt(Math.floor(x/64), Math.floor(y/64), what)
  }

  generate() {
    for (let x=-5; x<5; x++) {
      for (let y=-5; y<5; y++) {
        this.map[[x, y]] = Math.floor(u.random(1, 1))
      }
    }

    //proc.mergeTerrain(this.map, terrain.generateTerrain(10, 10, 4, 0.4, 9, 0), [0, 0])

    let genParams = new GeneratorParams()
    genParams.width = 70
    genParams.length = 30
    genParams.height = 4
    genParams.caveWallHeight = 40
    genParams.caveSpaciousness = -1
    genParams.caveOpenness = -1
    genParams.terrainVariance = 40

    proc.mergeTerrain(this.map, caves.generateCaves(genParams), [-1, -1])

  }

  populate() {
    const p = getScene().addThing(new Player())
    p.position[2] = 3000
  }
}
