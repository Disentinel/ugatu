function randomExponential(rate) {
    return -Math.log(Math.random()) / rate;
    }

function randomExpTime(min) {
    return randomExponential(1 / min)
}

// Вариант 12

let yearsMaxes = []
for (let year = 0; year < 1000; year++) {
    let year = []
    for (let day = 0; day < 50; day++) {
        const waterlevel = parseFloat(randomExponential(12).toFixed(1))
        year.push(+waterlevel)
    }
//    console.log(year)
    const max = Math.max(...year)
    yearsMaxes.push(max)
}

const absoluteMax = Math.max(...yearsMaxes)
const absoluteMin = Math.min(...yearsMaxes)

console.log(`Абсолютный максимум за 50 лет: `, absoluteMax)
console.log(`Абсолютный минимум за 50 лет: `, absoluteMin)

function getScale(N, min, max) {
    var scale = []
    const delta = max - min
    const step = delta / N

    for (let i = 0; i < N; i++) {
        scale.push({
            from: +((min + step * (i)).toFixed(1)),
            to: +((min + step * (i + 1)).toFixed(1))
        })
    }
    return scale
}

function getHisto(values, scale) {
    return scale.map(range => {
        const match = values.filter(val => {
            return parseFloat(val.toFixed(5)) >= +(range.from) && val <= +(range.to)
        })
        return (match.length / values.length)
    })
}

var horizontalScale = getScale(10, absoluteMin, absoluteMax)

const histo = getHisto(yearsMaxes, horizontalScale)

// console.log('Деления горизонтальной шкалы', horizontalScale)
console.log('Гистограмма:', histo)

const E = 0.001
var sum = 0
var alpha = 0.95
const iterMax = 200
var counter = 0
var interval = -1
while (sum < alpha && counter++ < iterMax) {
    const variety = histo[histo.length - counter]
    sum += variety
    console.log(`V: ${variety}, SUM: ${sum}`)
    interval++
}

var previousScale = getScale(2, horizontalScale[interval - 1].from, horizontalScale[interval].to)

while (Math.abs(sum - alpha) > E && counter++ < iterMax) {
    
    const target = previousScale[1]
  //  console.log(`previous scale`, previousScale)

    const subHisto = getHisto(yearsMaxes, previousScale)
   
    
   // console.log(newScale)
   // console.log(subHisto)

    previousScale = getScale(2, target.from, target.to)

    if(sum > alpha) {
        sum -= subHisto[1]
    } 
    if(sum < alpha) {
        sum += subHisto[0]
    }
    // console.log('sum', sum)
    interval = 0
}

const height = previousScale[0].to
console.log(`Высота`, height)

const N = horizontalScale.reduce((acc, val, idx) => {
    const middle = ((val.to - val.from) / 2) + val.from
    const value = histo[idx] * middle
    return +acc + +value
}, 0)

console.log(`Мат.ожидание`, N.toFixed(2))

function getP(height, m2){ 
    var e = 2.718281828459045; 
    var result = Math.pow(e, -(Math.pow(e, (-(height - m2) / 12)))); 
    return result
}

console.log(getP(height, Math.pow(N,2)) * 2.5)