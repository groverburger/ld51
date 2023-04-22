import * as game from './core/game.js'
import { width, height } from './config.js'
import * as u from './core/utils.js'
import * as vec3 from './core/vector3.js'
import * as vec2 from './core/vector2.js'
import Thing from './core/thing.js'

function getTerrainCenterOfMass() {
  const t = game.getThing('terrain').map
  const coords = u.shuffle(Object.keys(t))
  let totalX = 0
  let totalY = 0
  let count = 0
  for (let i = 0; (i < 40 && i < coords.length); i ++) {
    const coord = coords[i].split(',')
    count ++
    totalX += coord[0] * 64
    totalY += coord[1] * 64
  }
  return [totalX/count, totalY/count, -200]
}

function * LevelWinAnim (overlook=false, win=false) {
  const { globals, ctx } = game

  const player = game.getThing('player')
  if (player) player.showGui = false

  globals.showLevelIntro = true
  delete globals.fastRestart

  // Victory Flash
  for (let i = 0; i < 20; i++) {
    ctx.fillStyle = 'rgba(100, 200, 0, 0.35)'
    ctx.fillRect(0, 0, width, height)
    yield
  }

  // Fade to black while spiraling into the sky
  const fadeDuration = overlook ? 210 : 30
  const fadeStart = overlook ? fadeDuration - 50 : 0

  // Set up camera interpolation
  const cam = game.getScene().camera3D
  let desiredLook = vec3.vectorToAngles(vec3.normalize(vec3.subtract(cam.position, getTerrainCenterOfMass())))
  let startLook = [cam.yaw, cam.pitch]

  for (let i = 0; i < fadeDuration; i++) {
    ctx.fillStyle = `rgba(0, 0, 0, ${u.map(i, fadeStart, fadeDuration, 0, 1, true)})`
    ctx.fillRect(0, 0, width, height)

    if (overlook) {
      // Ease in
      const switchPoint = 0.25
      const speedArea = (switchPoint/2) + (1-switchPoint)
      let speedFac = u.map(i, 0, fadeDuration*switchPoint, 0, 1/speedArea, true)

      // Move camera up
      cam.position[2] += 6 * speedFac

      // Move camera backwards
      const dir = vec3.normalize(vec3.anglesToVector(cam.yaw, cam.pitch)) // Get look normal
      const move = vec3.multiply(dir, 13*speedFac) // Scale by speed
      cam.position = vec3.add(cam.position, move) // Move cam

      // Face camera towards center of mass of terrain
      ;[cam.yaw, cam.pitch] = vec3.lerpAngles(startLook, desiredLook, Math.pow(i/fadeDuration, 1.5))
    }
    yield
  }

  // Level transition screen
  let i = 0
  while (true) {
    if (win) {
      ctx.fillStyle = 'black'
      ctx.fillRect(0, 0, width, height)

      const string = 'You Win!'
      ctx.save()
      ctx.textAlign = 'center'
      ctx.font = 'italic bold 64px Times New Roman'
      const bob = Math.sin(i / 25) * 10 - 16
      const scale = u.map(i, 0, 12, 15, 1, true)
      ctx.translate(width / 2, height / 2 + bob)
      ctx.scale(scale, scale)
      ctx.fillStyle = u.colorToString(...u.hsvToRgb(i / 300, 1, 1))
      ctx.fillText(string, 0, 0)
      ctx.restore()

      ctx.save()
      ctx.translate(width / 2, height / 2 + 64)
      ctx.textAlign = 'center'
      ctx.font = 'italic 32px Times New Roman'
      ctx.fillStyle = u.colorToString(1, 1, 1, u.map(i, 15, 30, 0, 0.75, true))
      ctx.fillText('Thank you for playing!', 0, 0)
      ctx.fillText('Game created by Groverburger and ZungryWare', 0, 64)
      ctx.restore()
    }
    else {
      ctx.fillStyle = 'black'
      ctx.fillRect(0, 0, width, height)
      const string = `Level ${globals.level} Complete`
      ctx.save()
      ctx.textAlign = 'center'
      ctx.font = 'italic bold 64px Times New Roman'
      const bob = Math.sin(i / 25) * 10 - 16
      ctx.translate(width / 2, height / 2 + bob)
      ctx.fillStyle = u.colorToString(...u.hsvToRgb(i / 300, 1, 1).slice(0, 3), u.map(i, 0, 10, 0, 1, true))
      ctx.fillText(string, 0, 0)
      ctx.restore()

      ctx.save()
      ctx.translate(width / 2, height / 2 + 64)
      ctx.textAlign = 'center'
      ctx.font = 'italic 32px Times New Roman'
      ctx.fillStyle = u.colorToString(1, 1, 1, u.map(i, 15, 30, 0, 0.75, true))
      const left = 15 - globals.level
      ctx.fillText(left + (left > 1 ? ' levels remain...' : ' level remains...'), 0, 0)
      ctx.restore()

      ctx.save()
      ctx.translate(width - 64, height - 64)
      ctx.textAlign = 'right'
      ctx.fillStyle = `rgba(255, 255, 255, ${u.map(i, 10, 30, 0, 0.5, true)})`
      ctx.font = '32px Times New Roman'
      ctx.fillText('Press any button to continue', 0, 0)
      ctx.restore()
    }

    // Exit this screen if the player presses any key
    if ((Object.keys(game.keysPressed).length || game.mouse.button) && i > 10) {
      break
    }

    i += 1
    yield
  }

  if (win) {
    delete globals.level
    delete globals.lives
    delete globals.parameterBuilder
    delete globals.generated
    game.setScene('title')
  }
  else {
    // Move to next level
    globals.level += 1
    globals.parameterBuilder.setParametersForLevel(globals.level)
    delete globals.generated
    game.resetScene()
  }



  // Black screen while loading next level
  // Can we just change this to while(true)?
  for (let i = 0; i < 30; i++) {
    ctx.save()
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, width, height)
    ctx.restore()
    yield
  }
}

export default class LevelWin extends Thing {
  pauseException = true
  sprite = null

  constructor (data) {
    super(data)
    const { globals } = game
    if (globals.level >= 15) {
      this.anim = LevelWinAnim(true, true)
    }
    else if (globals.level === 5) {
      this.anim = LevelWinAnim(true)
    }
    else {
      this.anim = LevelWinAnim()
    }

    // Save best attempt to records
    const dateKey = u.getDateKey()
    const todaysBest = localStorage.getItem(dateKey) || -1
    if (game.globals.level > todaysBest) {
      localStorage.setItem(dateKey, game.globals.level)
    }
  }

  update () {
    game.getScene().paused = true
    this.anim.next()
  }
}
