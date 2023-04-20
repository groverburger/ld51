import Bullet from './bullet.js'
import assets from './assets.js'

export default class TurretBullet extends Bullet {
  canDamagePlayers = true
  canDamageEnemies = false

  onHit (other) {
    other.slowTime = 45
    this.dead = true

    // Sound effect
    const sound = assets.sounds.slowHit
    sound.volume = 1
    sound.currentTime = 0
    sound.play()
  }
}
