import Bullet from './bullet.js'
import assets from './assets.js'
import * as gfx from './core/webgl.js'
import * as game from './core/game.js'
import * as vec3 from './core/vector3.js'
import * as mat from './core/matrices.js'

export default class MachineGunBullet extends Bullet {
  constructor (position, direction, speed, owner) {
    super(position, direction, speed, owner)
    this.after(31, () => { this.dead = true })
  }

  draw () {
    for (let i = 0; i < 3; i++) {
      gfx.setShader(assets.shaders.billboard)
      gfx.setTexture(assets.textures.circle)
      game.getScene().camera3D.setUniforms()
      gfx.set('modelMatrix', mat.getTransformation({
        translation: vec3.add(this.position, vec3.multiply(this.direction, i * -8)),
        scale: 8 - i * 1.5
      }))
      gfx.set('color', i === 0 ? [1, 1, 1, 1] : [1, 0, 0, 1])
      gfx.drawBillboard()
    }
  }
}
