import Thing from "./core/thing.js"
import assets from "./assets.js"
import {getScene, setNextScene, getThing, ctx} from "./core/game.js"
import {
  random,
  colorToString,
  hsvToRgb,
  stringToColor
} from "./core/utils.js"
import * as gfx from "./core/webgl.js"
import * as mat from "./core/matrices.js"
import * as u from "./core/utils.js"
import * as vec3 from "./core/vector3.js"

import LevelWin from "./levelwin.js"

export default class Goal extends Thing {
  time = 0
  visited = false
  aabb = [-Infinity, -Infinity, Infinity, Infinity]

  constructor(data) {
    super(data)
    this.position[2] = getThing("terrain").getGroundHeight(this.position[0], this.position[1]) + 64
  }

  update() {
    this.time += 1
    if (!this.visited && u.distance3d(...this.position, ...getThing("player").position) < 80) {
      getThing("player").deliveredCount += 1
      this.visited = true
      assets.sounds.delivery.currentTime = 0
      assets.sounds.delivery.volume = 0.25
      assets.sounds.delivery.playbackRate = u.random(0.8, 1.2)
      assets.sounds.delivery.play()

      let mailboxes = 0
      for (const thing of getScene().things) {
        if (thing instanceof Goal) {
          mailboxes += 1
        }
      }

      if (getThing("player").deliveredCount >= mailboxes) {
        getScene().addThing(new LevelWin())
      }
    }
  }

  draw() {
    const camera = getScene().camera3D
    gfx.setShader(assets.shaders.animatedBillboard)
    gfx.setTexture(assets.textures.goal)
    gfx.set("cellSize", [1/4, 1])
    if (this.visited) {
      gfx.set("cellIndex", [2, 0])
    } else {
      gfx.set("cellIndex", [this.time%60 < 30 ? 0 : 1, 0])
    }
    camera.setUniforms()

    const boing = this.visited ? 64 : u.map(Math.sin(this.time/30), -1, 1, 64-16, 64+16)
    gfx.set("modelMatrix", mat.getTransformation({
      translation: [this.position[0], this.position[1], this.position[2] - 64 + boing],
      scale: [64, 64, boing]
    }))
    gfx.set("color", [1,1,1,1])
    gfx.drawBillboard()
  }
}