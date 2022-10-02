import assets from "./assets.js"
import * as gfx from "./core/webgl.js"
import * as game from "./core/game.js"
import * as u from "./core/utils.js"
import * as vec3 from "./core/vector3.js"
import * as mat from "./core/matrices.js"
import Pickup from "./pickup.js"

export default class TimePickup extends Pickup {
  texture = assets.textures.timePickup

  onPickup() {
    const sound = assets.sounds.timePickup
    sound.currentTime = 0
    sound.play()
    this.player.time += 5*60
  }
}