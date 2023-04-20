import * as game from './core/game.js'
import * as u from './core/utils.js'
import assets from './assets.js'
import * as vec3 from './core/vector3.js'
import Enemy from './enemy.js'
import TurretBullet from './turretbullet.js'

export default class EnemyTurret extends Enemy {
  texture = assets.textures.turret
  height = 64
  attackPeriod = 20
  sightTime = 33
  attackTime = this.sightTime

  behavior () {
    // Dead check
    if (this.dead) {
      return
    }

    // Laser attack
    this.friction = 0.60
    const player = game.getThing('player')

    // Distance Check
    if (player && u.distance2d(player.position[0], player.position[1], this.position[0], this.position[1]) < 64 * 12) {
      // Line of sight check
      if (!vec3.rayTrace(this.position, player.position)) {
        this.friction = 0

        // If it is ready to fire, show itself as attacking
        if (this.attackTime < this.attackPeriod) {
          this.attackActive = true
        }

        // Bullet
        this.attackTime--
        if (this.attackTime < 0) {
          this.attackTime = this.attackPeriod

          const dir = vec3.normalize(vec3.subtract(player.position, this.position))
          game.getScene().addThing(new TurretBullet(this.position, dir, 20, this))

          // Sound effect
          const sound = assets.sounds.slowRay
          sound.volume = 1
          sound.currentTime = 0
          sound.play()
        }
      }
    } else {
      this.attackTime = this.sightTime
      this.attackActive = false
    }

    super.behavior()
  }
}
