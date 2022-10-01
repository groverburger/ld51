import Thing from "./core/thing.js"
import * as game from "./core/game.js"
import * as gfx from "./core/webgl.js"
import * as mat from "./core/matrices.js"
import * as u from "./core/utils.js"
import assets from "./assets.js"
import * as vec3 from "./core/vector3.js"
import * as vec2 from "./core/vector2.js"

export default class Enemy extends Thing {
  height = 48

  constructor(position) {
    super()
    this.position = position
    this.groundHeight = game.getThing("terrain").getGroundHeight(this.position[0], this.position[1])
    this.position[2] = this.groundHeight + this.height
  }

  update() {
    const player = game.getThing("player")
    const accel = vec2.angleToVector(
      u.angleTowards(this.position[0], this.position[1], player.position[0], player.position[1]),
      0.5
    )
    this.speed[0] += accel[0]
    this.speed[1] += accel[1]

    const friction = 0.85
    this.speed[0] *= friction
    this.speed[1] *= friction

    super.update()
  }

  draw() {
    gfx.setShader(assets.shaders.billboard)
    gfx.setTexture(assets.textures.enemy)
    game.getScene().camera3D.setUniforms()
    gfx.set("modelMatrix", mat.getTransformation({
      translation: this.position,
      scale: 32
    }))
    gfx.set("color", [1,1,1,1])
    gfx.drawBillboard()
  }

  checkCollision(x=this.position[0], y=this.position[1]) {
    return (
      super.checkCollision(x, y) ||
      game.getThing("terrain").getGroundHeight(x, y) != this.groundHeight
    )
  }
}
