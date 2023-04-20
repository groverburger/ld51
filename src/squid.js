import * as game from './core/game.js'
import * as u from './core/utils.js'
import assets from './assets.js'
import * as vec3 from './core/vector3.js'
import Enemy from './enemy.js'

export default class EnemySquid extends Enemy {
  texture = assets.textures.squid
  friction = 0.91
}
