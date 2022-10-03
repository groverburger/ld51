import {width, height} from "./config.js"
import * as u from "./core/utils.js"
import * as vec2 from "./core/vector2.js"
import * as game from "./core/game.js"
import assets from "./assets.js"
import Thing from "./core/thing.js"

function* Animation() {
  const {ctx, globals} = game

  const time = globals.fastRestart ? 10 : 30
  for (let i=0; i<time; i++) {
    ctx.save()
    ctx.fillStyle = `rgba(0, 0, 0, ${u.map(i, 0, time, globals.fastRestart ? 0.25 : 1, 0, true)})`
    ctx.fillRect(0, 0, width, height)
    ctx.restore()
    yield
  }

  yield "done"
}


export default class LevelStart extends Thing {
  sprite = null
  pauseException = true

  constructor(data) {
    super(data)
    this.anim = Animation()
    game.getScene().paused = true
  }

  update() {
    game.getScene().paused = true
    this.dead = this.anim.next().value == "done"
  }
}
