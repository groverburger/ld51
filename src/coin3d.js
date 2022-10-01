import Thing from "./core/thing.js"
import assets from "./assets.js"
import {getScene, getThing, ctx} from "./core/game.js"
import {
  random,
  colorToString,
  hsvToRgb,
  stringToColor
} from "./core/utils.js"
import * as gfx from "./core/webgl.js"
import * as mat from "./core/matrices.js"
import * as u from "./core/utils.js"
import * as vec3 from "./core/vector3.js"

export default class Coin3D extends Thing {
  time = u.random(0, 100)
  color = [1,1,1,1]//u.stringToColor("#fbf236")

  constructor(data) {
    super(data)
    this.position[2] = getThing("terrain").getGroundHeight(this.position[0], this.position[1]) + 48
  }

  update() {
    this.time += 1
    this.position[2] += Math.sin(this.time/16)/4

    if (u.distance3d(...this.position, ...getThing("player").position) < 32) {
      this.dead = true
    }
  }

  draw() {
    gfx.setShader(assets.shaders.billboard)
    gfx.setTexture(assets.textures.coin)
    getScene().camera3D.setUniforms()

    gfx.set("modelMatrix", mat.getTransformation({
      translation: this.position,
      scale: 32
    }))
    gfx.set("color", this.color)
    gfx.drawBillboard()

    this.drawShadow()
  }

  drawShadow(radius=16) {
    gfx.setShader(assets.shaders.default)
    getScene().camera3D.setUniforms()
    gfx.setTexture(assets.textures.circle)
    gfx.set("color", [0, 0, 0, 0.5])
    gfx.set("modelMatrix", mat.getTransformation({
      translation: [this.position[0], this.position[1], getThing("terrain").getGroundHeight(...this.position) + 1],
      scale: radius
    }))
    gfx.drawQuad(
      -1, -1, 0,
       1, -1, 0,
      -1,  1, 0,
       1,  1, 0,
    )
  }
}
