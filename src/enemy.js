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
  health = 1

  constructor(position) {
    super()
    this.position = position
    this.groundHeight = game.getThing("terrain").getGroundHeight(this.position[0], this.position[1])
    this.position[2] = this.groundHeight + this.height
    this.speed[2] = 0
    this.after(60, () => this.angleUpdate())
  }

  update() {
    this.updateTimers()
    if (this.timer("hurt")) return
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
    if (player && u.distance2d(player.position[0], player.position[1], this.position[0], this.position[1]) < 64*16) {
      const accel = vec2.angleToVector(this.angle, 0.85)
      this.speed[0] += accel[0]
      this.speed[1] += accel[1]
    }

    const friction = 0.85
    this.speed[0] *= friction
    this.speed[1] *= friction

    this.dead = this.dead || (!this.timer("hurt") && this.health <= 0)

    for (const thing of this.getAllThingCollisions()) {
      if (
        thing instanceof Bullet
        && Math.abs(thing.position[2] - this.position[2]) <= this.height/2 + 32
        && !thing.dead
        && !this.timer("hurt")
      ) {
        this.health -= 1
        thing.dead = true
        this.after(15, () => {}, "hurt")

        const sound = u.choose(assets.sounds.enemyHurt1, assets.sounds.enemyHurt2)
        sound.playbackRate = u.random(0.9, 1.1)
        sound.currentTime = 0
        sound.play()

        break
      }

      if (this.health > 0 && thing instanceof Player && Math.abs(thing.position[2] - this.position[2]) <= this.height/2 + 24) {
        thing.dead = true
      }
    }

    this.move()
    this.position[2] += this.speed[2]
    this.dead = this.dead || this.position[2] < 64
  }

  draw() {
    gfx.setShader(assets.shaders.animatedBillboard)
    gfx.set("cellSize", [1/4, 1])
    if (this.timer("hurt")) {
      gfx.set("cellIndex", [2, 0])
    } else {
      gfx.set("cellIndex", [this.time%60 < 30 ? 0 : 1, 0])
    }
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
    if (!player) return
    this.angle = u.angleTowards(this.position[0], this.position[1], player.position[0], player.position[1])
    this.angle += u.random(-0.5, 0.5)
  }
}
