import {width, height} from "./config.js"
import assets from "./assets.js"
import Thing from "./core/thing.js"
import * as gfx from "./core/webgl.js"
import * as game from "./core/game.js"
import * as u from "./core/utils.js"
import * as vec3 from "./core/vector3.js"
import * as mat from "./core/matrices.js"
import Terrain from "./terrain.js"

export default class TitleMenu extends Thing {
  time = 0

  constructor(data) {
    super(data)
    this.setName("title")
    game.getScene().addThing(new Terrain())
  }

  update() {
    super.update()
    this.time += 1
    const cam = game.getScene().camera3D
    cam.yaw = Math.PI*2 * 5/8
    cam.pitch = 0.2
    cam.position = [0, 0, 64*18]
    //game.getScene().camera3D.pitch += 0.02

    if ((Object.keys(game.keysPressed).length || game.mouse.button)) {
      delete game.globals.generated
      game.mouse.lock()
      game.setNextScene()
    }
  }

  draw() {
    const {ctx} = game
    ctx.save()
    //ctx.fillStyle = "white"
    ctx.font = "italic bold 96px Times New Roman"
    ctx.fillStyle = "black"
    ctx.fillText("Space Escape", 100, 150)
    ctx.fillStyle = u.colorToString(...u.hsvToRgb(this.time/300, 1, 1))
    ctx.fillText("Space Escape", 100+8, 150-8)
    ctx.restore()

    ctx.save()
    ctx.fillStyle = "white"
    ctx.font = "32px Times New Roman"
    ctx.fillText("Press any button to start!", 100, height - 96)
    ctx.restore()
  }
}
