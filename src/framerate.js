import Thing from "./core/thing.js"
import {ctx, getFramerate} from "./core/game.js"

export default class Framerate extends Thing {
  sprite = null

  guiDraw(ctx) {
    ctx.fillStyle = "white"
    ctx.font = "48px Arial"
    ctx.fillText(frameRate.toString(), 64, 64)
  }
}
