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
    firstTry: false,
    firstTryDeathless: false,
    firstTryDeathlessAllKills: false,
  }
}

// Mark a level as being beaten. If it's today's best, it will be saved.
export function beatLevel(level, date) {
  const dateKey = getDateKey(date)
  const record = JSON.parse(localStorage.getItem(dateKey)) || createEmptyRecord()
  if (level > record.highestLevel) {
    localStorage.setItem(dateKey, JSON.stringify({...record, highestLevel: level}))
  }
}

// Get the highest level we've achieved today
export function getHighestLevel(date) {
  const record = JSON.parse(localStorage.getItem(getDateKey(date)))
  const highest = record?.highestLevel
  if (highest === null) {
    return -1
  }
  return highest
}

