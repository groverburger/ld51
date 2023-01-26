import assets from './assets.js'
import * as gfx from './core/webgl.js'
import * as game from './core/game.js'
import * as mat from './core/matrices.js'
import Pickup from './pickup.js'

export class ShotgunPickup extends Pickup {
  model = assets.models.shotgun
  texture = assets.textures.shotgun
  scale = 1

  onPickup () {
    const { globals } = game
    const sound = assets.sounds.weaponPickup
    sound.currentTime = 0
    sound.play()
    globals.powerup = 'shotgun'
  }

  draw () {
    gfx.setShader(assets.shaders.defaultShaded)
    gfx.setTexture(assets.textures.square)
    game.getScene().camera3D.setUniforms()
    gfx.set('modelMatrix', mat.getTransformation({
      translation: this.position,
      rotation: [Math.PI*0.5, 0, this.time / 30],
      scale: 6 * this.scale
    }))
    gfx.setTexture(this.texture)
    gfx.drawMesh(this.model)
  }
}

export class MachinegunPickup extends ShotgunPickup {
  model = assets.models.machinegun
  texture = assets.textures.machinegun

  onPickup () {
    const { globals } = game
    const sound = assets.sounds.weaponPickup
    sound.currentTime = 0
    sound.play()
    globals.powerup = 'machinegun'
  }
}

export class RiflePickup extends ShotgunPickup {
  model = assets.models.rifle
  texture = assets.textures.rifle

  onPickup () {
    const { globals } = game
    const sound = assets.sounds.weaponPickup
    sound.currentTime = 0
    sound.play()
    globals.powerup = 'rifle'
  }
}

export class TimePickup extends ShotgunPickup {
  model = assets.models.clock
  texture = assets.textures.clock
  scale = 3

  onPickup () {
    const sound = assets.sounds.timePickup
    sound.currentTime = 0
    sound.volume = 0.5
    sound.play()
    this.player.time += 5 * 60
    this.player.after(15, () => {}, 'timeBonus')
  }
}

export class OneUp extends ShotgunPickup {
  model = assets.models.oneup
  texture = assets.textures.oneup
  scale = 4

  onPickup () {
    const { globals } = game
    const sound = assets.sounds.oneUp
    sound.currentTime = 0
    sound.play()
    globals.lives += 1
  }
}

export class VisionPickup extends Pickup {
  onPickup () {
    const { globals } = game
    const sound = assets.sounds.magic
    sound.currentTime = 0
    sound.play()
    sound.volume = 0.7
    globals.powerup = 'vision'
  }
}
