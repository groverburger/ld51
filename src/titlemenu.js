import { width, height } from './config.js'
import Thing from './core/thing.js'
import * as game from './core/game.js'
import * as u from './core/utils.js'
import * as records from './records.js'
import Terrain from './terrain.js'
import Settings from './settings.js'
import assets from './assets.js'
import * as music from './music.js'

export default class TitleMenu extends Thing {
  time = 0

  constructor (data) {
    super(data)
    this.setName('title')
    game.getScene().addThing(new Terrain())
    game.getScene().addThing(new Settings())
    game.globals.tutorial = true

    this.selectedDate = new Date(game.globals.date.getTime())
    this.calendarData = this.buildCalendarData()

    music.pauseAllTracks()
  }

  buildCalendarData () {
    // Create empty data
    let ret = {
      monthAward: 'calendar',
      days: [],
    }
    const daysOfTheWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    for (let i = 0; i < 6; i ++) {
      for (let j = 0; j < 7; j ++) {
        ret.days.push(
          {
            day: daysOfTheWeek[j],
            date: 0,
            state: 'hidden',
            level: -1,
            firstTry: false,
            firstTryDeathless: false,
          }
        )
      }
    }

    // Figure out how many days in the month
    const date = this.selectedDate
    const monthDays = [31, (date.getFullYear() % 4 == 0 ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    const numDays = monthDays[date.getMonth()]

    // Figure out the first day of the week
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    let dataIndex = firstDay

    // Loop over days in the month
    let goldDays = 0
    let silverDays = 0
    let bronzeDays = 0
    let attemptedDays = 0
    for (let i = 0; i < numDays; i ++) {
      ret.days[dataIndex].date = i + 1
      ret.days[dataIndex].state = 'calendar'

      // Retrieve record data
      const thisDay = new Date(date.getFullYear(), date.getMonth(), i + 1)
      const best = records.getHighestLevel(thisDay)
      if (best == 0 || best > 0) {
        ret.days[dataIndex].level = best
      }

      // Determine additional awards
      ret.days[dataIndex].firstTry = records.getFirstTry(thisDay)
      ret.days[dataIndex].firstTryDeathless = records.getFirstTryDeathless(thisDay)

      // Determine what tier of plaque this achievement merits
      if (ret.days[dataIndex].level >= 15) {
        ret.days[dataIndex].state = 'gold'
        goldDays ++
      }
      else if (ret.days[dataIndex].level >= 10) {
        ret.days[dataIndex].state = 'silver'
        silverDays ++
      }
      else if (ret.days[dataIndex].level >= 5) {
        ret.days[dataIndex].state = 'bronze'
        bronzeDays ++
      }
      else if (ret.days[dataIndex].level >= 0) {
        ret.days[dataIndex].state = 'attempted'
        attemptedDays ++
      }

      dataIndex ++

    }

    // Set month status
    const dayThreshold = 20
    if (goldDays >= dayThreshold) {
      ret.monthAward = 'gold'
    }
    else if (silverDays + goldDays >= dayThreshold) {
      ret.monthAward = 'silver'
    }
    else if (bronzeDays + silverDays + goldDays >= dayThreshold) {
      ret.monthAward = 'bronze'
    }
    else if (attemptedDays + bronzeDays + silverDays + goldDays >= dayThreshold) {
      ret.monthAward = 'attempted'
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

    if ("ArrowRight" in game.keysPressed) {
      this.selectedDate = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth() + 1)
      this.calendarData = this.buildCalendarData()
    }
    if ("ArrowLeft" in game.keysPressed) {
      this.selectedDate = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth() - 1)
      this.calendarData = this.buildCalendarData()
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
    const margin = 20
    const w = 21
    const h = 17
    const calendarScale = 2
    const tileSize = 32 * calendarScale
    for (const [i, entry] of this.calendarData.days.entries()) {
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
          if (entry.firstTryDeathless) {
            ctx.drawImage(assets.images["calLevel_firstTryDeathless"], x, y, tileSize, tileSize)
          }
          else if (entry.firstTry) {
            ctx.drawImage(assets.images["calLevel_firstTry"], x, y, tileSize, tileSize)
          }
          else {
            ctx.drawImage(assets.images["calLevel_" + (entry.level || 0)], x, y, tileSize, tileSize)
          }
        }

        ctx.restore()
      }
    }

    
    {
      // Month Bar
      let x = width - ((((w-1) * 7) + 0) * calendarScale) - margin
      let y = height - ((((h-1) * 6) + 14) * calendarScale) - margin
      ctx.drawImage(assets.images["calMonthTile_" + this.calendarData.monthAward], x, y, 256*calendarScale, 16*calendarScale)

      // Month text
      x += 43 * calendarScale
      const tex = (this.calendarData.monthAward === 'calendar' ? "calMonth_" : "calMonthAward_") + this.selectedDate.getMonth()
      ctx.drawImage(assets.images[tex], x, y, 32*calendarScale, 16*calendarScale)

      // Year
      x += 18 * calendarScale
      for (let i = 4-1; i >= 0; i --) {
        // Get the digit
        const ub = Math.pow(10, i+1)
        const lb = Math.pow(10, i)
        const year = this.selectedDate.getFullYear()
        const digit = Math.floor((year % ub) / lb)

        // Render the digit
        x += 6 * calendarScale
        const tex = (this.calendarData.monthAward === 'calendar' ? "calYearDigit_" : "calYearDigitAward_") + digit
        ctx.drawImage(assets.images[tex], x, y, 16*calendarScale, 16*calendarScale)
      }
    }

    // Calendar Text
    ctx.save()
    ctx.font = 'bold 22px Courier New'
    ctx.textAlign = 'center'
    ctx.fillStyle = u.colorToString(0.6, 0.6, 0.6, 1)
    ctx.fillText('New Challenge Every Day', width - (margin + ((w-1)*calendarScale*7*0.5)), height - 260)
    ctx.restore()
  }
}
