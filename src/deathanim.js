import {width, height} from "./config.js"
import * as u from "./core/utils.js"
import * as vec2 from "./core/vector2.js"
import * as game from "./core/game.js"
import assets from "./assets.js"
import Thing from "./core/thing.js"

function* DeathAnimation() {
  const {ctx, globals} = game
  globals.lives -= 1

  let i = 0
  while (true) {
    ctx.fillStyle = `rgba(0, 0, 0, ${u.map(i, 0, 10, 0, 0.25, true)})`
    ctx.fillRect(0, 0, width, height)

    ctx.save()
    ctx.translate(width/2, height/3)
    //ctx.fillStyle = "rgba(0, 0, 0, ${u.map(i, 0, 10, 0, 1, true)})"
    ctx.fillStyle = "red"
    ctx.font = "italic 64px Times New Roman"
    ctx.textAlign = "center"
    ctx.fillText(globals.lives ? "You died" : "Game Over", 0, 0)
    ctx.restore()

    if (Object.keys(game.keysDown).length || game.mouse.button) {
      break
    }

    i += 1
    yield
  }

  if (globals.lives <= 0) {
    delete globals.level
    delete globals.lives
    delete globals.parameterBuilder
    delete globals.generated
  }
  game.resetScene()
}

export default class DeathAnim extends Thing {
  pauseException = true
  sprite = null

  constructor(data) {
    super(data)
    assets.sounds.music.pause()
    this.anim = DeathAnimation()
  }

  update() {
    game.getScene().paused = true
  }

  guiDraw() {
    if (this.anim.next().value == "dead") {
      //this.dead = true
    }
  }
}
