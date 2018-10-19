const YEARSCOUNT = 50

const generate = (n) => {
    let years = []
    for( let i = 0; i < n; i++) {
        years.push(getYearInfo(1984 + i))
    }
    return years
}

const getYearInfo = (year) => {
    return {
        year,
        water: (genInt(12) / genInt(12)).toFixed(2),
    }
}

const genInt = (
    length,
    min = Math.pow(10, length - 1) - 1,
    max = Math.pow(10, length) - 1
  ) => Math.floor(Math.random() * (max - min + 1)) + min

let test = generate(YEARSCOUNT)
let absolute_maximums = {}
let ABSOLUTE = 0

test.map((val) => {
    absolute_maximums[val.year] = 0
})

for(let i = 0; i < 1000; i++) {
    let t = generate(YEARSCOUNT)
    t.map((val) => {
        absolute_maximums[val.year] = Math.max(absolute_maximums[val.year], val.water)
    })
    
    const ABSOLUTE = {
        year: 0,
        water: 0,
    }
    
    for(let year in absolute_maximums) {
        ABSOLUTE.year = Math.max()
    }
    
}



console.log(absolute_maximums)
console.log(`max water level ${ABSOLUTE}m`)

