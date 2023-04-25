import assets from './assets.js'
import * as gfx from './core/webgl.js'
import * as game from './core/game.js'
import * as mat from './core/matrices.js'
import Thing from './core/thing.js'
import { ItemParticle } from './particle.js'

export class Deco extends Thing {
  height = 0
  model = assets.models.shotgun
  texture = assets.textures.shotgun
  scale = 4
  angle = Math.random() * Math.PI*2

  constructor (position, model) {
    super()
    this.position = position
    this.groundHeight = game.getThing('terrain').getGroundHeight(this.position[0], this.position[1])
    this.position[2] = this.groundHeight + this.height

    this.model = assets.models[model]
    this.texture = assets.textures[model]
  }

  draw () {
    gfx.setShader(assets.shaders.defaultFog)
    game.getScene().camera3D.setUniforms()
    gfx.set('modelMatrix', mat.getTransformation({
      translation: this.position,
      rotation: [Math.PI/2, 0, this.angle],
      scale: 6 * this.scale
    }))
    gfx.setTexture(this.texture)
    gfx.drawMesh(this.model)
  }
}
