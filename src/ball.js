import Thing from "./core/thing.js"
import assets from "./assets.js"
import {getScene, getThing} from "./core/game.js"
import {
  colorToString,
  hsvToRgb,
  stringToColor
} from "./core/utils.js"
import * as gfx from "./core/webgl.js"
import * as mat from "./core/matrices.js"
import * as u from "./core/utils.js"
import * as vec3 from "./core/vector3.js"

export default class Ball extends Thing {
  random = getScene().random
  shadowOffset = 0
  shadowOffset = 0
  pattern = null
  time = 0
  leaves = []

  constructor(data) {
    super(data)
    this.height = this.random(128, 200)
    this.radius = this.random(64, 64)
    this.rootPosition = [...this.position]
    const groundHeight = getThing("terrain").getGroundHeight(...this.position) ?? 0
    this.rootPosition[2] = groundHeight
    this.position[2] = groundHeight + this.height
    this.shadowOffset = groundHeight + this.random(1,4)

    for (let i=0; i<5; i++) {
      const yaw = this.random(0, Math.PI*2)
      const pitch = this.random(Math.PI*-0.5, Math.PI*0.5)
      const length = this.random(0, 128)
      const vector = vec3.anglesToVector(yaw, pitch)
      vector[0] *= 64
      vector[1] *= 64
      vector[2] *= 32
      this.leaves.push({
        position: vec3.add(this.position, vector),
        color: hsvToRgb(this.random(0.2, 0.4), 0.8, 0.7)
      })
    }
  }

  update() {
    this.time += 1
    //this.position[0] += Math.sin(this.time/50) * this.position[2]/800
    super.update()
  }

  draw() {
    const camera = getScene().camera3D
    gfx.setShader(assets.shaders.billboard)
    gfx.setTexture(assets.textures.circle)
    camera.setUniforms()

    for (const leaf of this.leaves) {
      gfx.set("modelMatrix", mat.getTransformation({
        translation: leaf.position,
        scale: this.radius
      }))
      gfx.set("color", [...leaf.color, 1])
      gfx.drawBillboard()
      //gfx.drawMesh(assets.models.sphere)
    }

    gfx.setShader(assets.shaders.default)
    gfx.setTexture(assets.textures.square)
    camera.setUniforms()
    gfx.setTexture(assets.textures.circle)
    gfx.set("color", [0, 0, 0, 0.5])
    gfx.set("modelMatrix", mat.getTransformation({
      translation: [this.position[0], this.position[1], this.shadowOffset],
      scale: this.radius
    }))
    gfx.drawQuad(
      -1, -1,  0,
       1, -1,  0,
      -1,  1,  0,
       1,  1,  0
    )

    gfx.setTexture(assets.textures.square)
    gfx.set("color", stringToColor("#341d19"))
    gfx.set("modelMatrix", mat.getTransformation())
    gfx.drawLine(this.rootPosition, this.position, 4)
  }
}
