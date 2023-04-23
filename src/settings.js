import Thing from './core/thing.js'
import * as u from './core/utils.js'
import InputHandler from './core/inputs.js'
import {
  ctx,
  globals,
} from './core/game.js'

export default class Settings extends Thing {
  displayTime = 0
  settingChanged = "DEFAULT"
  displayDuration = 200

  constructor (data) {
    super(data)
    this.setName('settings')

    // Initialize settings
    if (!globals.mouseSensitivity) {
      globals.mouseSensitivity = 5
    }

    this.inputs = new InputHandler({
      sensDown (keys, mouse, gamepad) {
        return keys.Minus || keys.NumpadSubtract
      },
      sensUp (keys, mouse, gamepad) {
        return keys.Equal || keys.NumpadAdd
      },
    })
  }

  update () {
    super.update()
    this.inputs.update()
    this.displayTime -= 1
    this.pauseException = true

    // Key presses
    if (this.inputs.pressed('sensDown')) {
      globals.mouseSensitivity = u.clamp(globals.mouseSensitivity - 1, 1, 10)
      this.settingChanged = "Sensitivity: " + globals.mouseSensitivity
      this.displayTime = this.displayDuration
    }
    if (this.inputs.pressed('sensUp')) {
      globals.mouseSensitivity = u.clamp(globals.mouseSensitivity + 1, 1, 10)
      this.settingChanged = "Sensitivity: " + globals.mouseSensitivity
      this.displayTime = this.displayDuration
    }


  }

  draw () {
    // Settings changes
    ctx.save()
    ctx.font = 'italic 32px Times New Roman'
    ctx.translate(32, 48)
    {
      const str = this.settingChanged
      ctx.fillStyle = u.colorToString(0.2, 0, 0, u.map(this.displayTime, 0, 40, 0, 1, true))
      ctx.fillText(str, 0, 0)
      ctx.fillStyle = u.colorToString(1, 1, 1, u.map(this.displayTime, 0, 40, 0, 1, true))
      ctx.fillText(str, 4, -4)
    }
    ctx.restore()
  }
}
