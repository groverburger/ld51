import {getScene} from "./core/game.js"
import Thing from "./core/thing.js"
import * as gfx from "./core/webgl.js"
import * as mat from "./core/matrices.js"
import * as u from "./core/utils.js"
import assets from "./assets.js"

export default class Spider extends Thing {
  angle = 0

  constructor(data) {
    super(data)
    this.position[2] = 32
  }

  update() {
  }

  draw(ctx) {
    const camera = getScene().camera3D
    gfx.setShader(assets.shaders.default)
    gfx.setTexture(assets.textures.square)
    camera.setUniforms()
    gfx.set("color", [0,0,0,1])
    gfx.set("modelMatrix", mat.getTransformation({
      translation: this.position,
      scale: 32
    }))
    gfx.drawMesh(assets.models.sphere)

    let headRadius = 32
    gfx.set("modelMatrix", mat.getTransformation({
      translation: [
        this.position[0] + Math.cos(this.angle)*headRadius,
        this.position[1] + Math.sin(this.angle)*headRadius,
        this.position[2] + 8,
      ],
      scale: 24
    }))
    gfx.drawMesh(assets.models.sphere)

    for (let i=-1; i<=1; i+=2) {
      const amount = 0.15
      gfx.set("color", [1,0,0,1])
      gfx.set("modelMatrix", mat.getTransformation({
        translation: [
          this.position[0] + Math.cos(this.angle + i*amount)*(headRadius+24),
          this.position[1] + Math.sin(this.angle + i*amount)*(headRadius+24),
          this.position[2] + 8,
        ],
        scale: 4
      }))
      gfx.drawMesh(assets.models.sphere)
    }

    gfx.setShader(assets.shaders.default)
    gfx.setTexture(assets.textures.square)
    gfx.set("color", [0,0,0,1])
    gfx.set("modelMatrix", mat.getTransformation())
    let r = 48
    for (let i=-1; i<=1; i+=2) {
      for (let c=0; c<4; c++) {
        const a = u.map(c, 0, 3, i*Math.PI*0.2, i*Math.PI*0.8)
        gfx.drawLine(
          this.position,
          [this.position[0] + Math.cos(a)*r, this.position[1] + Math.sin(a)*r, 0],
          4
        )
      }
    }
  }
}
