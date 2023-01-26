import assets from './assets.js'
import * as gfx from './core/webgl.js'
import * as game from './core/game.js'
import * as mat from './core/matrices.js'
import Pickup from './pickup.js'

export class ShotgunPickup extends Pickup {
  model = assets.models.shotgun
  texture = assets.textures.shotgun

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
      scale: 6
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
