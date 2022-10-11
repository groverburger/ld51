import { getScene, mouse, keysDown, getThing } from './core/game.js'
import Thing from './core/thing.js'
import * as gfx from './core/webgl.js'
import * as mat from './core/matrices.js'
import * as u from './core/utils.js'
import assets from './assets.js'
import * as vec3 from './core/vector3.js'
import * as vec2 from './core/vector2.js'

export default class Screenshader extends Thing {
  sprite = null

  constructor (data) {
    super(data)

    const fb = gfx.createFramebuffer()
    const square = gfx.createMesh([
      -1, -1, 0, 0, 0, 0, 0, 0,
      1, -1, 0, 1, 0, 0, 0, 0,
      -1, 1, 0, 0, 1, 0, 0, 0,
      1, 1, 0, 1, 1, 0, 0, 0,
      1, -1, 0, 1, 0, 0, 0, 0,
      -1, 1, 0, 0, 1, 0, 0, 0
    ])
    const identity = mat.getIdentity()

    getScene().addHook('predraw', () => {
      gfx.setFramebuffer(fb)
    })

    getScene().addHook('postdraw', () => {
      gfx.setFramebuffer(null)
      gfx.setTexture(fb.texture, 0)
      gfx.setTexture(assets.textures.palette, 1)
      gfx.setShader(assets.shaders.palette)
      gfx.set('original', 0, 'int')
      gfx.set('map', 1, 'int')
      gfx.set('projectionMatrix', identity)
      gfx.set('viewMatrix', identity)
      gfx.set('modelMatrix', identity)
      gfx.drawMesh(square)
    })
  }
}
