import { width, height } from './config.js'
import Thing from './core/thing.js'
import * as game from './core/game.js'
import * as u from './core/utils.js'
import Terrain from './terrain.js'
import assets from './assets.js'

export default class TitleMenu extends Thing {
  time = 0

  constructor (data) {
    super(data)
    this.setName('title')
    game.getScene().addThing(new Terrain())
    game.globals.tutorial = true
    this.calendarData = this.buildCalendarData()

    const { music1, music2, music3 } = assets.sounds
    for (const music of [music1, music2, music3]) {
      music.pause()
    }
  }

  buildCalendarData () {
    // Create empty data
    let ret = []
    const daysOfTheWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    for (let i = 0; i < 6; i ++) {
      for (let j = 0; j < 7; j ++) {
        ret.push(
          {
            day: daysOfTheWeek[j],
            date: 0,
            state: 'hidden',
            level: -1,
            firstTry: false,
          }
        )
      }
    }

    // Figure out how many days in the month
    const date = new Date()
    const monthDays = [31, (date.getFullYear() % 4 == 0 ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    const numDays = monthDays[date.getMonth()]

    // Figure out the first day of the week
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    let dataIndex = firstDay

    // Loop over days in the month
    for (let i = 0; i < numDays; i ++) {
      ret[dataIndex].date = i + 1
      ret[dataIndex].state = 'calendar'

      // Retrieve record data
      const thisDay = new Date(date.getFullYear(), date.getMonth(), i + 1)
      const dateKey = u.getDateKey(thisDay)
      const record = localStorage.getItem(dateKey)
      if (record == 0 || record > 0) {
        ret[dataIndex].level = record
      }

      // Determine what tier of plaque this achievement merits
      if (ret[dataIndex].level >= 15) {
        ret[dataIndex].state = 'gold'
      }
      else if (ret[dataIndex].level >= 10) {
        ret[dataIndex].state = 'silver'
      }
      else if (ret[dataIndex].level >= 5) {
        ret[dataIndex].state = 'bronze'
      }
      else if (ret[dataIndex].level >= 0) {
        ret[dataIndex].state = 'attempted'
      }

      dataIndex ++

    }

    // Return
    return ret
  }

  update () {
    super.update()
    this.time += 1
    const cam = game.getScene().camera3D
    cam.pitch = 0.2
    const a = this.time / 200 + Math.PI * 2 * 5 / 8
    const r = 30 * 64
    cam.position = [Math.sin(a) * r + 15 * 64, Math.cos(a) * r + 35 * 64, 64 * 18]
    cam.yaw = -a + Math.PI / 2
    // game.getScene().camera3D.pitch += 0.02

    if (this.time > 30 && ("Space" in game.keysPressed)) {
      delete game.globals.level
      delete game.globals.lives
      delete game.globals.parameterBuilder
      delete game.globals.generated
      game.mouse.lock()
      game.setNextScene()
    }
  }

  draw () {
    const { ctx } = game
    ctx.save()
    const name = 'Starshot'
    // ctx.fillStyle = "white"
    ctx.font = 'italic bold 96px Times New Roman'
    // ctx.font = "bold 96px Courier New"
    ctx.fillStyle = 'black'
    ctx.translate(120, 200)
    ctx.fillText(name, 0, 0)
    ctx.fillStyle = u.colorToString(...u.hsvToRgb(this.time / 300, 1, 1))
    ctx.translate(8, -8)
    ctx.fillText(name, 0, 0)
    ctx.restore()

    // Press Button Prompt
    ctx.save()
    ctx.fillStyle = u.colorToString(1, 1, 1, u.map(this.time, 60, 90, 0, 1, true))
    ctx.font = '32px Times New Roman'
    ctx.fillText('Press space to start!', 120, height - 120)
    ctx.restore()

    // Calendar
    const margin = 15
    const w = 21
    const h = 17
    const calendarScale = 2
    const tileSize = 32 * calendarScale
    for (const [i, entry] of this.calendarData.entries()) {
      // Draw tile
      if (entry.state !== 'hidden') {
        ctx.save()

        const xs = i % 7
        const ys = Math.floor(i / 7)

        const x = width - (((w-1) * (7-xs)) * calendarScale) - margin
        const y = height - (((h-1) * (6-ys)) * calendarScale) - margin

        // Border
        ctx.drawImage(assets.images.calBorder, x, y, tileSize, tileSize)

        // Background tile
        ctx.drawImage(assets.images["calTile_" + entry.state], x, y, tileSize, tileSize)

        // Date
        if (entry.state === 'calendar') {
          ctx.drawImage(assets.images["calDate_" + entry.date], x, y, tileSize, tileSize)
          ctx.drawImage(assets.images["calWeekday_" + entry.day], x, y, tileSize, tileSize)
        }
        // Level
        else {
          if (entry.firstTry) {
            ctx.drawImage(assets.images["calLevel_firstTry"], x, y, tileSize, tileSize)
          }
          else {
            ctx.drawImage(assets.images["calLevel_" + (entry.level || 0)], x, y, tileSize, tileSize)
          }
        }

        ctx.restore()
      }
    }

    // Calendar Text
    ctx.save()
    ctx.font = 'bold 22px Courier New'
    ctx.fillStyle = u.colorToString(0.6, 0.6, 0.6, 1)
    ctx.fillText('New Challenge Each Day', width - 300, height - 230)
    ctx.restore()
  }
}
