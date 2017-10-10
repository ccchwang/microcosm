const { Microcosm, update } = require('../build')
const CompareTree = require('../build/addons/compare-tree')

let advance = (x, y) => ({ x, y })

let SAMPLES = [25, 50, 100, 200]
let WRITES = 50

let results = SAMPLES.map(function(SIZE) {
  let repo = new Microcosm()
  let tree = new CompareTree()
  let stats = {}

  repo.addDomain('pixels', {
    getInitialState() {
      return {}
    },
    rotateHue(n) {
      return isNaN(n) ? 0 : n + 5
    },
    advance(state, { x, y }) {
      return update(state, [x, y], this.rotateHue)
    },
    register() {
      return {
        [advance]: this.advance
      }
    }
  })

  repo.on('change', tree.update, tree)

  global.gc()

  var memoryBefore = process.memoryUsage().heapUsed

  var then = process.hrtime()
  for (let x = 0; x < SIZE; x++) {
    for (let y = 0; y < SIZE; y++) {
      tree.on(`pixels.${x}.${y}`, hue => {})
    }
  }

  stats['Dimensions'] = `${SIZE}² = ${SIZE * SIZE}`

  stats['Prep'] = (process.hrtime(then)[1] / 1000000).toFixed() + 'ms'

  then = process.hrtime()
  for (var i = 0; i < WRITES; i++) {
    let x = Math.floor(Math.random() * SIZE)
    let y = Math.floor(Math.random() * SIZE)

    repo.push(advance, x, y)
  }

  stats[`Writes (${WRITES})`] =
    (process.hrtime(then)[1] / 1000000).toFixed() + 'ms'

  stats['Memory'] =
    ((process.memoryUsage().heapUsed - memoryBefore) / 100000).toFixed(2) + 'mb'

  return stats
})

require('console.table')

console.log()
console.table(results)
