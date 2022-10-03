import assets from "./assets.js"
import * as gfx from "./core/webgl.js"
import * as game from "./core/game.js"
import * as u from "./core/utils.js"
import * as vec3 from "./core/vector3.js"
import * as mat from "./core/matrices.js"
import TimePickup from "./timepickup.js"

export class ShotgunPickup extends TimePickup {
  texture = assets.textures.shotgunPickup

  onPickup() {
    const { globals } = game
    const sound = assets.sounds.weaponPickup
    sound.currentTime = 0
    sound.play()
    globals.powerup = "shotgun"
  }
}

export class MachinegunPickup extends TimePickup {
  texture = assets.textures.machinegunPickup

  onPickup() {
    const { globals } = game
    const sound = assets.sounds.weaponPickup
    sound.currentTime = 0
    sound.play()
    globals.powerup = "machinegun"
  }
}

export class VisionPickup extends TimePickup {
  texture = assets.textures.visionPickup

  onPickup() {
    const { globals } = game
    const sound = assets.sounds.magic
    sound.currentTime = 0
    sound.play()
    sound.volume = 0.7
    globals.powerup = "vision"
  }
}
