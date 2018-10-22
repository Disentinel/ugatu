function randI(min, max) {
    var rand = min - 0.5 + Math.random() * (max - min + 1)
    rand = Math.round(rand);
    return rand;
  }

// Константы
const T1 = 40
const T1diff = 8
const T2 = 40
const T3 = 80
const T4 = 60
const S1 = 500
const S2 = 220
const S3 = 7
const S4 = 4
const S5 = 7
const T2minus = 0
const T3minus = 0
const T4minus = 0

// Фактическая длительность
const T2fact = T2 - T2minus
const T3fact = T3 - T3minus
const T4fact = T4 - T4minus

// Фактическая стоимость
const S1fact = S1 - (T2minus * S3) - (T3minus * S4)
const S2fact = S2 - (T4minus * S5)  

// Абстракции
const Storage = (state) => {
    let obj = { state }
    obj.getAggregate = (count) => {
        if(obj.state.storage >= count) {
            obj.state.storage -= +count
            return count
        } else {
            return false
        }
    }
    obj.addAggregate = (count) => {
        obj.state.storage += +count
        obj.state.totalCount += +count
        return true
    }
    return obj
}

const TimeSkipper = () => {
    let obj = {
        handlers: []
    }
    obj.addHandler = (handler, time) => {
        // console.log(`Добавляем событие на ${time}:`, { handler })
        obj.handlers.push({ handler, time })
        obj.handlers.sort((a, b) => {
            if(+a.time > +b.time) return -1
            if(+a.time < +b.time) return 1
            return 0
        })
        return obj.handlers
    }
    obj.next = () => {
        return obj.handlers.pop()
    }
    return obj
}

// Глобальные объекты
var PrimaryTech = { busy: false }
var SecondaryTech = { busy: false }
var PartialTech = { busy: false }
var Tier1Storage = Storage({ storage: 0, totalCount: 0 })
var Tier1SemiStorage = Storage({ storage: 0, totalCount: 0 })
var Tier2Storage = Storage({ storage: 0, totalCount: 0 })
var Skipper = TimeSkipper()
var Sells = { totalMoney: 0, tier1Selled: 0, tier2Selled: 0, totalArrived: 0 }

// Обработчики событий
const aggregateArrive = (time) => {
    console.log(`Пришли 2 агрегата`)
    Sells.totalArrived += 2
    if(PrimaryTech.busy === true) {
        Tier2Storage.addAggregate(2)
        partialTech(time)
    } else {
        primaryTech(time)
    }
    Skipper.addHandler(aggregateArrive, time + +((T1 - T1diff) + randI(0, T1diff * 2)))
}

const primaryTech = (time) => {
    console.log(`Поступили 2 агрегата на первичную регулировку`)
    if(PrimaryTech.busy === false) {
        PrimaryTech.busy = true
        Skipper.addHandler(primaryTechEnd, time + +T2fact)
    }
}

const primaryTechEnd = (time) => {
    console.log(`Закончена первичная регулировка`)
    PrimaryTech.busy = false
    Tier1SemiStorage.addAggregate(2)
    if(!SecondaryTech.busy) {   
        secondaryTech(time)
    }
}

const secondaryTech = (time) => {
    console.log(`Поступили 2 агрегата на вторичную регулировку`)
    if(Tier1SemiStorage.getAggregate(2) !== false) {
        Skipper.addHandler(secondaryTechEnd, time + +T3fact)
    }
}

const secondaryTechEnd = (time) => {
    console.log(`Закончена вторичная регулировка`)
    SecondaryTech.busy = false
    tier1sell(time)
    secondaryTech()
}

const partialTech = (time) => {
    console.log(`Поступил 1 агрегат на частичную регулировку`)
    if(PartialTech.busy === false) {
        if(Tier2Storage.getAggregate(1) !== false) {
            Skipper.addHandler(partialTechEnd, time + +T4fact)
        }
    }
}

const partialTechEnd = (time) => {
    console.log(`Закончена частичная регулировка`)
    PartialTech.busy = false
    tier2sell()
    partialTech(time)
}

const tier1sell = (time) => {
    console.log(`Продано 2 агрегата 1 класса`)
    Sells.tier1Selled += 2
    Sells.totalMoney += +(S1fact * 2)
}

const tier2sell = (time) => {
    console.log(`Продан 1 агрегат 2 класса`)
    Sells.tier2Selled += 1
    Sells.totalMoney += +S2fact
}

const simulationEnds = (time) => {
    Skipper.handlers = []
    console.log(Sells)
    console.log(`Промежуточный склад: В наличии ${Tier1SemiStorage.state.storage}, всего пришло на склад ${Tier1SemiStorage.state.totalCount}`)
    console.log(`Резервный склад: В наличии ${Tier2Storage.state.storage}, всего пришло на склад ${Tier2Storage.state.totalCount}`)
}

Skipper.addHandler(aggregateArrive, 0)
Skipper.addHandler(simulationEnds, 300)
var time = 0

while(Skipper.handlers.length > 0) {
    console.log('Квант времени:', time)

    const current = Skipper.next()
    time = current.time
    console.log(`Происходит событие`, current)
    current.handler(time)
}