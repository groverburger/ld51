export function crossProduct(a, b) {
  return [
    a[1]*b[2] - a[2]*b[1],
    a[2]*b[0] - a[0]*b[2],
    a[0]*b[1] - a[1]*b[0],
  ]
}

export function dotProduct(a, b) {
  return a[0]*b[0] + a[1]*b[1] + a[2]*b[2]
}

export function add(a, b) {
  return [
    a[0] + b[0],
    a[1] + b[1],
    a[2] + b[2],
  ]
}

export function subtract(a, b) {
  return [
    a[0] - b[0],
    a[1] - b[1],
    a[2] - b[2],
  ]
}

export function normalize(vector) {
  const magnitude = Math.sqrt(vector[0]**2 + vector[1]**2 + vector[2]**2)

  // prevent dividing by 0 and causing NaNs by ORing with 1
  return [
    vector[0] / (magnitude || 1),
    vector[1] / (magnitude || 1),
    vector[2] / (magnitude || 1),
  ]
}

export function toLength(vector, length) {
  const magnitude = Math.sqrt(vector[0]**2 + vector[1]**2 + vector[2]**2)

  // prevent dividing by 0 and causing NaNs by ORing with 1
  return [
    vector[0] * length / (magnitude || 1),
    vector[1] * length / (magnitude || 1),
    vector[2] * length / (magnitude || 1),
  ]
}

export function magnitude(vector) {
  return Math.sqrt(vector[0]**2 + vector[1]**2 + vector[2]**2)
}

export function multiply(vector, scalar) {
  return [
    vector[0] * scalar,
    vector[1] * scalar,
    vector[2] * scalar
  ]
}

export function distance(a, b) {
  return Math.sqrt((a[0]-b[0])**2 + (a[1]-b[1])**2 + (a[2]-b[2])**2)
}

// modifies vector in-place
export function changeLength(vector, delta) {
  const length = magnitude(vector)
  const newLength = length + delta
  vector[0] * newLength / length
  vector[1] * newLength / length
  vector[2] * newLength / length
}

export function getNormalOf(v1, v2, v3) {
  return normalize(crossProduct(
    subtract(v2, v1),
    subtract(v3, v2)
  ))
}

export function areaOfTriangle(v1, v2, v3) {
  return 0.5 * magnitude(crossProduct(
    subtract(v2, v1),
    subtract(v3, v2)
  ))
}

export function lerp(v1, v2, t) {
  return [
    (1-t)*v1[0] + t*v2[0],
    (1-t)*v1[1] + t*v2[1],
    (1-t)*v1[2] + t*v2[2],
  ]
}

export function anglesToVector(direction, pitch) {
  return normalize([
    Math.cos(direction) * Math.max(Math.cos(pitch), 0.001),
    Math.sin(direction) * Math.max(Math.cos(pitch), 0.001),
    Math.sin(pitch)
  ])
}

export function vectorToAngles(vector) {
  return [
    Math.atan2(vector[1], vector[0]),
    Math.asin(vector[2])
  ]
}

export function isInsideTriangle(p1, p2, p3, normal, position) {
  const edge1 = crossProduct(subtract(p2, p1), subtract(position, p1))
  const edge2 = crossProduct(subtract(p3, p2), subtract(position, p2))
  const edge3 = crossProduct(subtract(p1, p3), subtract(position, p3))

  return (
    (
      dotProduct(edge1, normal) >= 0 &&
      dotProduct(edge2, normal) >= 0 &&
      dotProduct(edge3, normal) >= 0
    ) ||
    (
      dotProduct(edge1, normal) < 0 &&
      dotProduct(edge2, normal) < 0 &&
      dotProduct(edge3, normal) < 0
    )
  )
}

export function distanceToTriangle(p1, normal, position) {
  return dotProduct(position, normal) - dotProduct(p1, normal)
}

export function getPointOnPlane(r1, rayDir, p1, normal) {
  const dist = distanceToTriangle(p1, normal, r1)
  const dot = dotProduct(rayDir, normal)

  // don't divide by zero!
  if (dot >= 0) {
    return null
  }

  return add(r1, multiply(rayDir, Math.abs(dist / dot)))
}

export function rayTriangleIntersection(r1, rayDir, p1, p2, p3, normal) {
  const point = getPointOnPlane(r1, rayDir, p1, normal)
  if (!point) return point
  return isInsideTriangle(p1, p2, p3, normal, point) ? point : null
}

export function findMostSimilarVector(vector, list) {
  let bestDot = -1 * Infinity
  let bestVector = null

  for (const thing of list) {
    const dot = dotProduct(thing, vector)
    if (dot > bestDot) {
      bestDot = dot
      bestVector = thing
    }
  }

  return bestVector
}

export function raySphere(ray, sphere, radius) {
  const sphereProjection = dot(ray, sphere)
  const testPoint = [
    ray[0] + sphereProjection,
    ray[1] + sphereProjection,
    ray[2] + sphereProjection,
  ]

  const dist = distance(testPoint, sphere)
  if (dist < radius) {
    return testPoint
  }
}
