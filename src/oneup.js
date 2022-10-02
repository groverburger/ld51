import assets from "./assets.js"
import * as gfx from "./core/webgl.js"
import * as game from "./core/game.js"
import * as u from "./core/utils.js"
import * as vec3 from "./core/vector3.js"
import * as mat from "./core/matrices.js"
import TimePickup from "./timepickup.js"

export default class OneUp extends TimePickup {
  texture = assets.textures.oneUp

  onPickup() {
    const { globals } = game
    const sound = assets.sounds.oneUp
    sound.currentTime = 0
    sound.play()
    globals.lives += 1
  }
}
