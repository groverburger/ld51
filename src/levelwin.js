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
  player.showGui = false
  globals.showLevelIntro = true
  const rankList = [480, 600, 900, 1200, 2000]
  let rank = 0
  while (player.time > rankList[rank]) {
    rank += 1
  }

  for (let i=0; i<10; i++) {
    ctx.fillStyle = `rgba(0, 0, 0, ${u.map(i, 0, 10, 0, 0.25, true)})`
    ctx.fillRect(0, 0, width, height)
    yield
  }

  let i = 0
  while (true) {
    if (i == 3) {
      assets.sounds.win.play()
    }
    const string = "Level Complete!"
    ctx.save()
    ctx.fillStyle = "rgba(0, 0, 0, 0.25)"
    ctx.fillRect(0, 0, width, height)
    ctx.textAlign = "center"
    ctx.font = "italic bold 100px Arial"
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

    const timeTime = 60
    if (i > timeTime) {
      const str = "Time: " + u.toTimeString(player.time / 60)
      ctx.save()
      ctx.translate(width/2 - 300, height/2 + 100)
      const scale = u.map(i, timeTime, timeTime+5, 2, 1, true)
      ctx.scale(scale, scale)
      ctx.font = "italic bold 30px Arial"
      ctx.fillStyle = "darkBlue"
      ctx.fillText(str, 0, 0)
      ctx.fillStyle = "white"
      ctx.translate(4, -4)
      ctx.fillText(str, 0, 0)

      {
        const str = "Best Time: " + u.toTimeString(0)//saveData.levelTimes[level][0])
        ctx.save()
        ctx.translate(0, 32)
        ctx.fillStyle = "darkBlue"
        ctx.fillText(str, 0, 0)
        ctx.fillStyle = "cornflowerBlue"
        ctx.translate(4, -4)
        ctx.fillText(str, 0, 0)
        ctx.restore()
      }

      ctx.restore()
    }

    const rankTime = 80
    if (i > rankTime) {
      ctx.save()
      ctx.textAlign = "right"
      ctx.translate(width/2 + 240, height/2 + 100)

      {
        const str = "Rank:"
        ctx.save()
        const scale = u.map(i, rankTime, rankTime+10, 2, 1, true)
        ctx.translate(-20, 0)
        ctx.scale(scale, scale)
        ctx.font = "italic bold 30px Arial"
        ctx.fillStyle = "darkBlue"
        ctx.fillText(str, 0, 0)
        ctx.fillStyle = "white"
        ctx.translate(4, -4)
        ctx.fillText(str, 0, 0)
        ctx.restore()
      }

      if (i == rankTime+39) {
        assets.sounds.rank.play()
      }
      if (i >= rankTime+30) {
        const scale = u.map(i, rankTime+30, rankTime+40, 10, 1, true)
        ctx.save()
        ctx.translate(50, 0)
        ctx.scale(scale, scale)
        const str = ["S", "A", "B", "C", "D", "F"][rank]
        //ctx.textAlign = "center"
        ctx.font = "bold 90px Times New Roman"
        ctx.fillStyle = "darkBlue"
        ctx.fillText(str, 0, 0)
        ctx.fillStyle = "white"
        ctx.translate(4, -4)
        ctx.fillText(str, 0, 0)
        ctx.restore()
      }
      ctx.restore()
    }

    if (i >= 120) {
      ctx.save()
      ctx.translate(width - 64, height - 96)
      ctx.scale(scale, scale)
      const str = (gamepads[0] ? "Press A" : "Click") + " to continue"
      ctx.font = "italic bold 30px Arial"
      ctx.textAlign = "right"
      ctx.fillStyle = "darkBlue"
      ctx.fillText(str, 0, 0)
      ctx.fillStyle = "cornflowerBlue"
      ctx.translate(4, -4)
      ctx.fillText(str, 0, 0)
      {
        const str = (gamepads[0] ? "Press B" : "Press R") + " try again"
        ctx.save()
        ctx.translate(0, 32)
        ctx.fillStyle = "darkBlue"
        ctx.fillText(str, 0, 0)
        ctx.fillStyle = "pink"
        ctx.translate(4, -4)
        ctx.fillText(str, 0, 0)
        ctx.restore()
      }
      ctx.restore()
    }

    const button = gamepads[0]?.buttons[0].pressed || mouse.button
    if (button && i > 100) break

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

  for (let i=0; i<30; i++) {
    ctx.save()
    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, width, height)
    ctx.restore()
    yield
  }

  //setNextScene()
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
  }

  guiDraw() {
    if (this.anim.next().value == "dead") {
      //this.dead = true
    }
  }
}
