import Thing from "./core/thing.js"
import * as game from "./core/game.js"
import * as gfx from "./core/webgl.js"
import * as mat from "./core/matrices.js"
import * as u from "./core/utils.js"
import assets from "./assets.js"
import * as vec3 from "./core/vector3.js"
import * as vec2 from "./core/vector2.js"
import Bullet from "./bullet.js"
import Player from "./player.js"

export default class Enemy extends Thing {
  height = 64
  angle = 0
  time = 0

  constructor(position) {
    super()
    this.position = position
    this.groundHeight = game.getThing("terrain").getGroundHeight(this.position[0], this.position[1])
    this.position[2] = this.groundHeight + this.height
    this.speed[2] = 0
    this.after(60, () => this.angleUpdate())
  }

  update() {
    this.time += 1

    // fall down when above ground
    this.groundHeight = game.getThing("terrain").getGroundHeight(this.position[0], this.position[1])
    if (this.position[2] > this.groundHeight + this.height) {
      this.speed[2] -= 1
    } else if (this.speed[2] < 0) {
      this.speed[2] = 0
      this.position[2] = this.groundHeight + this.height
    }

    // step up when below ground
    if (this.position[2] < this.groundHeight + this.height) {
      this.position[2] += 4
    }

    // move towards player
    const player = game.getThing("player")
    if (u.distance2d(player.position[0], player.position[1], this.position[0], this.position[1]) < 64*16) {
      const accel = vec2.angleToVector(this.angle, 0.85)
      this.speed[0] += accel[0]
      this.speed[1] += accel[1]
    }

    const friction = 0.85
    this.speed[0] *= friction
    this.speed[1] *= friction

    for (const thing of this.getAllThingCollisions()) {
      if (thing instanceof Bullet && Math.abs(thing.position[2] - this.position[2]) <= this.height/2 + 8) {
        this.dead = true
        thing.dead = true
        break
      }

      if (thing instanceof Player) {
        thing.death()
      }
    }

    super.update()
    this.position[2] += this.speed[2]
  }

  draw() {
    gfx.setShader(assets.shaders.animatedBillboard)
    gfx.set("cellSize", [1/2, 1])
    gfx.set("cellIndex", [this.time%60 < 30 ? 0 : 1, 0])
    gfx.setTexture(assets.textures.enemy)
    game.getScene().camera3D.setUniforms()
    gfx.set("modelMatrix", mat.getTransformation({
      translation: this.position,
      scale: 64
    }))
    gfx.set("color", [1,1,1,1])
    gfx.drawBillboard()
  }

  checkCollision(x=this.position[0], y=this.position[1]) {
    return (
      super.checkCollision(x, y) ||
      game.getThing("terrain").getGroundHeight(x, y) >= this.groundHeight + 96
    )
  }

  angleUpdate() {
    this.after(60, () => this.angleUpdate())
    const player = game.getThing("player")
    this.angle = u.angleTowards(this.position[0], this.position[1], player.position[0], player.position[1])
    this.angle += u.random(-0.5, 0.5)
  }
}
