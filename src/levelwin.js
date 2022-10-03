import {
  ctx,
  globals,
  getScene,
  getThing,
  setNextScene,
  resetScene,
  keysDown,
  mouse,
  gamepads,
  keysPressed,
  saveData
} from "./core/game.js"
import {width, height} from "./config.js"
import * as u from "./core/utils.js"
import * as vec2 from "./core/vector2.js"
import assets from "./assets.js"
import InputHandler from "./core/inputs.js"
import Thing from "./core/thing.js"

function* LevelWinAnim() {
  const player = getThing("player")
  if (player) player.showGui = false
  globals.showLevelIntro = true
  delete globals.fastRestart

  for (let i=0; i<20; i++) {
    ctx.fillStyle = `rgba(100, 200, 0, 0.35)`
    ctx.fillRect(0, 0, width, height)
    yield
  }


  for (let i=0; i<30; i++) {
    ctx.fillStyle = `rgba(0, 0, 0, ${u.map(i, 0, 30, 0, 1, true)})`
    ctx.fillRect(0, 0, width, height)
    yield
  }


  let i = 0
  while (true) {
    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, width, height)
    const string = `Level ${globals.level} Complete`
    ctx.save()
    ctx.fillStyle = "rgba(0, 0, 0, 0.25)"
    ctx.fillRect(0, 0, width, height)
    ctx.textAlign = "center"
    ctx.font = "italic bold 64px Times New Roman"
    const bob = Math.sin(i/25)*10 - 16
    ctx.translate(width/2, height/2 + bob)
    const scale = u.map(i, 0, 15, 25, 1, true)
    ctx.scale(scale, scale)
    //const alpha = u.map(i, 100, 120, 1, 0, true)
    ctx.fillStyle = "black"
    ctx.fillText(string, 6, 6)
    ctx.fillStyle = u.colorToString(...u.hsvToRgb(i/300, 1, 1))
    ctx.fillText(string, 0, 0)
    ctx.restore()


    const button = gamepads[0]?.buttons[0].pressed || mouse.button
    if (button && i > 5) break

    if (gamepads[0]?.buttons[1].pressed || keysDown.KeyR) {
      resetScene()
    }

    i += 1
    yield
  }

  /*
  for (let i=0; i<30; i++) {
    ctx.fillStyle = `rgba(0, 0, 0, ${u.map(i, 0, 30, 0.25, 0, true)})`
    ctx.fillRect(0, 0, width, height)
    yield
  }
  */

  //setNextScene()
  globals.level += 1
  globals.parameterBuilder.advance()
  delete globals.generated
  resetScene()

  for (let i=0; i<30; i++) {
    ctx.save()
    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, width, height)
    ctx.restore()
    yield
  }
}

export default class LevelWin extends Thing {
  pauseException = true
  sprite = null

  constructor(data) {
    super(data)
    assets.sounds.music.pause()
    this.anim = LevelWinAnim()
  }

  update() {
    getScene().paused = true
    this.anim.next()
  }
}
