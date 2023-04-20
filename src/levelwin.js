import * as game from './core/game.js'
import { width, height } from './config.js'
import * as u from './core/utils.js'
import Thing from './core/thing.js'

function * LevelWinAnim () {
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

  // Fade to black
  for (let i = 0; i < 30; i++) {
    ctx.fillStyle = `rgba(0, 0, 0, ${u.map(i, 0, 30, 0, 1, true)})`
    ctx.fillRect(0, 0, width, height)
    yield
  }

  // Level transition screen
  let i = 0
  while (true) {
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

    // Exit this screen if the player presses any key
    if ((Object.keys(game.keysPressed).length || game.mouse.button) && i > 10) {
      break
    }

    i += 1
    yield
  }

  // Move to next level
  globals.level += 1
  globals.parameterBuilder.setParametersForLevel(globals.level)
  delete globals.generated
  game.resetScene()

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

function * TowerWinAnim () {
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
  for (let i = 0; i < 30; i++) {
    ctx.fillStyle = `rgba(0, 0, 0, ${u.map(i, 0, 30, 0, 1, true)})`
    ctx.fillRect(0, 0, width, height)
    player.speed[2] = 50
    player.position[2] = 500
    yield
  }

  // Level transition screen
  let i = 0
  while (true) {
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

    // Exit this screen if the player presses any key
    if ((Object.keys(game.keysPressed).length || game.mouse.button) && i > 10) {
      break
    }

    i += 1
    yield
  }

  // Move to next level
  globals.level += 1
  globals.parameterBuilder.setParametersForLevel(globals.level)
  delete globals.generated
  game.resetScene()

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

function * GameWinAnim () {
  const { globals, ctx } = game

  const player = game.getThing('player')
  if (player) player.showGui = false

  globals.showLevelIntro = true
  delete globals.fastRestart

  for (let i = 0; i < 20; i++) {
    ctx.fillStyle = 'rgba(100, 200, 0, 0.35)'
    ctx.fillRect(0, 0, width, height)
    yield
  }

  for (let i = 0; i < 30; i++) {
    ctx.fillStyle = `rgba(0, 0, 0, ${u.map(i, 0, 30, 0, 1, true)})`
    ctx.fillRect(0, 0, width, height)
    yield
  }

  let i = 0
  while (true) {
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

    i += 1
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
      this.anim = GameWinAnim()
    }
    // else if (globals.level % 5 == 0) {
    //   this.anim = TowerWinAnim()
    // }
    else {
      this.anim = LevelWinAnim()
    }
    // this.anim = TowerWinAnim()
  }

  update () {
    game.getScene().paused = true
    this.anim.next()
  }
}
