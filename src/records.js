// Returns the date in the format used for localStorage entries
export function getDateKey(date) {
  // If no date was specified, use current system time
  if (!date) {
    date = new Date()
  }
  return `record_y${date.getFullYear()}_m${date.getMonth()}_d${date.getDate()}`
}

function createEmptyRecord() {
  return {
    highestLevel: -1,
    attempts: 0,
    deaths: 0,
    firstTry: false,
    firstTryDeathless: false,
  }
}

function getRecord(dateKey) {
  return JSON.parse(localStorage.getItem(dateKey)) || createEmptyRecord()
}

// Get the highest level the player has beaten today
export function getHighestLevel(date) {
  const dateKey = getDateKey(date)
  const record = getRecord(dateKey)
  return record.highestLevel
}

// Returns true if the player beat level 15 on their first try
export function getFirstTry(date) {
  const dateKey = getDateKey(date)
  const record = getRecord(dateKey)
  return record.firstTry
}

// Returns true if the player beat level 15 on their first try
export function getFirstTryDeathless(date) {
  const dateKey = getDateKey(date)
  const record = getRecord(dateKey)
  return record.firstTryDeathless
}

// Mark a level as being beaten. If it's today's best, it will be saved.
export function beatLevel(level, date) {
  const dateKey = getDateKey(date)
  let record = getRecord(dateKey)

  // Check if this is the best we've done today
  if (level > record.highestLevel) {
    record.highestLevel = level
  }

  // Check for first try award
  if (level >= 15 && record.attempts <= 1) {
    record.firstTry = true

    // Check for deathless award
    if (record.deaths === 0) {
      record.firstTryDeathless = true
    }
  }

  // Save
  localStorage.setItem(dateKey, JSON.stringify(record))
}

// Mark one attempt. Used to give out First Try awards.
export function countAttempt(date) {
  const dateKey = getDateKey(date)
  const record = getRecord(dateKey)

  // Increment attempts counter
  localStorage.setItem(dateKey, JSON.stringify({...record, attempts: record.attempts + 1}))
}

// Mark one death. Used to give out First Try Deathless awards.
export function countDeath(date) {
  const dateKey = getDateKey(date)
  const record = getRecord(dateKey)

  // Increment deaths counter
  localStorage.setItem(dateKey, JSON.stringify({...record, deaths: record.deaths + 1}))
}

