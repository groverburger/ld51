import Thing from "./core/thing.js"
import Enemy from "./core/thing.js"
import * as game from "./core/game.js"
import * as gfx from "./core/webgl.js"
import * as mat from "./core/matrices.js"
import * as u from "./core/utils.js"
import assets from "./assets.js"
import * as vec3 from "./core/vector3.js"
import * as vec2 from "./core/vector2.js"
import Bullet from "./bullet.js"
import Player from "./player.js"

export default class Turret extends Enemy {
  /*
  texture = assets.textures.turret
  shoot = 0

  constructor(position) {
    super(position)
  }

  behavior() {
    this.shoot += 1
    const player = game.getThing("player")
    if (player && this.shoot >= 60) {
      const dir = vec3.normalize(vec3.subtract(player.position, this.position))
      const bullet = game.getScene().addThing(new Bullet(this.position), dir, 8, this)
      this.shoot = 0
    }
  }
  */
}
