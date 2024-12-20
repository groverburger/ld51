export function lerp (a, b, t) {
  return (1 - t) * a + t * b
}

export function clamp (n, min, max) {
  if (min < max) {
    return Math.min(Math.max(n, min), max)
  }

  return Math.min(Math.max(n, max), min)
}

export function map (n, start1, stop1, start2, stop2, withinBounds = false) {
  const newval = (n - start1) / (stop1 - start1) * (stop2 - start2) + start2

  if (!withinBounds) {
    return newval
  }

  return clamp(newval, start2, stop2)
}

export function distance2d (x1, y1, x2, y2) {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
}

export function distance3d (x1, y1, z1, x2, y2, z2) {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2 + (z1 - z2) ** 2)
}

export function sign (x) {
  return x && (x > 0 ? 1 : -1)
}

export function angleTowards (x1, y1, x2, y2) {
  return Math.atan2(y2 - y1, x2 - x1)
}

export function range (start, end, iter = 1) {
  const array = []
  for (let i = start; i <= end; i += iter) {
    array.push(i)
  }
  return array
}

function* randomGenerator(seed = 0) {
  const m = BigInt(4294967296); // 2^32
  const a = BigInt(1664525);
  const c = BigInt(1013904223);

  let currentSeed = BigInt(seed);

  while (true) {
    currentSeed = (a * currentSeed + c) % m;
    yield Number(currentSeed) / Number(m);
  }
}

export function randomizer(seed = 0) {
  const r = randomGenerator(seed)
  return function(low = 0, high = 1) {
    return r.next().value * (high - low) + low
  }
}

export const random = randomizer()

export function choose (...things) {

  const index = Math.floor(random(0, things.length - 0.001))
  const result = things[index]
  return result
}

export function chooseSeeded (rand, ...things) {

  const index = Math.floor(rand(0, things.length - 0.001))
  const result = things[index]
  return result
}

export function weightedChoose(rand, list) {
  // Figure out what the total weight of all items is
  let totalWeight = 0;
  list.forEach((item) => {
    totalWeight += item.weight;
  })

  // Pick a number within that range
  let randomVal = Math.trunc(rand() * totalWeight);

  // Select item based on that
  for (let i = 0; i < list.length; i ++) {
    randomVal -= list[i].weight;
    if (randomVal < 0) {
      return list[i].value;
    }
  }
  return list[0].value;
}

export function rgbToHsv (r, g, b) {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const v = max
  const d = max - min
  let h
  let s

  if (max === min) {
    h = 0 // achromatic
  } else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }

    h /= 6
  }

  return [h, s, v]
}

export function hsvToRgb (h, s, v) {
  let r, g, b

  const i = Math.floor(h * 6)
  const f = h * 6 - i
  const p = v * (1 - s)
  const q = v * (1 - f * s)
  const t = v * (1 - (1 - f) * s)

  switch (i % 6) {
    case 0: r = v; g = t; b = p; break
    case 1: r = q; g = v; b = p; break
    case 2: r = p; g = v; b = t; break
    case 3: r = p; g = q; b = v; break
    case 4: r = t; g = p; b = v; break
    case 5: r = v; g = p; b = q; break
  }

  return [r, g, b]
}

export function colorToString (r, g, b, a = 1) {
  r = Math.floor(r * 255)
  g = Math.floor(g * 255)
  b = Math.floor(b * 255)
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

export function stringToColor (hex, mod = []) {
  mod[0] = parseInt(hex.slice(1, 3), 16) / 255
  mod[1] = parseInt(hex.slice(3, 5), 16) / 255
  mod[2] = parseInt(hex.slice(5, 7), 16) / 255
  mod[3] = hex.length > 7 ? parseInt(hex.slice(7, 9), 16) / 255 : 1
  return mod
}

// TODO: currently broken!
const color1 = []
const color2 = []
const colorOut = []
export function interpolateColor (c1, c2, t) {
  stringToColor(c1, color1)
  stringToColor(c2, color2)
  colorOut[0] = lerp(color1[0], color2[0], t)
  colorOut[1] = lerp(color1[1], color2[1], t)
  colorOut[2] = lerp(color1[2], color2[2], t)
  colorOut[3] = lerp(color1[3], color2[3], t)
  return colorOut
}

export function noise (x, y = 0, z = 0) {
  const random = (x, y) => {
    const angle = (
      Math.sin(x * 1074 + y * 210) +
      Math.sin(y * 2321 + z * 302) +
      Math.sin(z * 543 + x * 3043) +
      Math.sin(z * 1003)
    )
    return Math.sin(angle * 512)
  }

  const fx = Math.floor(x)
  const fy = Math.floor(y)
  const fz = Math.floor(z)

  const v1 = lerp(random(fx, fy, fz), random(fx + 1, fy, fz), x % 1)
  const v2 = lerp(random(fx, fy + 1, fz), random(fx + 1, fy + 1, fz), x % 1)
  const v3 = lerp(v1, v2, y % 1)

  if (z % 1 !== 0) {
    // interpolate between different z levels, if a z is specified
    const v4 = lerp(random(fx, fy, fz + 1), random(fx + 1, fy, fz + 1), x % 1)
    const v5 = lerp(random(fx, fy + 1, fz + 1), random(fx + 1, fy + 1, fz + 1), x % 1)
    const v6 = lerp(v4, v5, y % 1)
    return lerp(v3, v6, z % 1)
  }

  // otherwise just return 2D noise
  return v3
}

export function octaveNoise (x, y = 0, z = 0, octaves = 4) {
  let value = 0
  let total = 0

  for (let o = 1; o <= octaves; o += 1) {
    const f = Math.pow(0.5, o)
    value /= 2
    total /= 2
    value += noise(x * f, y * f, z * f)
    total += 1
  }

  return value / total
}

// give time in seconds
export function toTimeString (time, precision = 1) {
  const seconds = time % 60
  const minutes = time / 60 | 0
  return minutes + (seconds < 10 ? ':0' : ':') + seconds.toFixed(precision)
}

export function shuffle (array, rand) {
  let currentIndex = array.length
  let randomIndex
  if (!rand) { rand = random }

  // While there remain elements to shuffle.
  while (currentIndex !== 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(rand() * currentIndex)
    currentIndex -= 1

    // And swap it with the current element.
    ;[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]]
  }

  return array
}

// Returns an integer representing a unique seed for the date
export function getDateSeed(date) {
  if (!date) {
    throw new Error('Must specify date')
  }
  return  date.getDate()*11 +
          date.getMonth()*11*31 +
          (date.getFullYear()%100)*11*31*13
}
