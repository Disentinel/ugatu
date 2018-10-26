require('babel-polyfill')
var mongoose = require('mongoose')

const database = 'mongodb://localhost:27017/test'

function randomExponential(rate) {
    return -Math.log(Math.random()) / rate;
    }

function randomExpTime(min) {
    return randomExponential(1 / min)
}

mongoose.connect(database,
    {
        useNewUrlParser: true
    },
    (error) => {
        if (error) {
            console.error(error.message)
        } else {
            console.log('Succesfully connected to database')
        }

    })

var dataSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
        lowercase: true
    },
    values: {
        type: Array
    },
    processed: {
        type: Boolean
    },
    data: {
        type: Object
    },
    simulated: {
        type: Boolean
    }
})

const Variant = mongoose.model('Variant', dataSchema)

function randI(min, max) {
    var rand = min - 0.5 + Math.random() * (max - min + 1)
    rand = Math.round(rand);
    return rand;
}

const Storage = (state) => {
    let obj = { state }
    obj.getAggregate = (count) => {
        if (obj.state.storage >= count) {
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
            if (+a.time > +b.time) return -1
            if (+a.time < +b.time) return 1
            return 0
        })
        return obj.handlers
    }
    obj.next = () => {
        return obj.handlers.pop()
    }
    return obj
}

function simulate(minus) {
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
    const T2minus = minus[0]
    const T3minus = minus[1]
    const T4minus = minus[2]

    // Фактическая длительность
    const T2fact = T2 - T2minus
    const T3fact = T3 - T3minus
    const T4fact = T4 - T4minus

    // Фактическая стоимость
    const S1fact = S1 - (T2minus * S3) - (T3minus * S4)
    const S2fact = S2 - (T4minus * S5)

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
        //console.log(`Пришли 2 агрегата`)
        Sells.totalArrived += 2
        if (PrimaryTech.busy === true) {
            Tier2Storage.addAggregate(2)
            partialTech(time)
        } else {
            primaryTech(time)
        }
        Skipper.addHandler(aggregateArrive, time + +((T1 - T1diff) + randI(0, T1diff * 2)))
    }

    const primaryTech = (time) => {
        //console.log(`Поступили 2 агрегата на первичную регулировку`)
        if (PrimaryTech.busy === false) {
            PrimaryTech.busy = true
            Skipper.addHandler(primaryTechEnd, time + +(randomExpTime(T2fact).toFixed(2)))
        }
    }

    const primaryTechEnd = (time) => {
        //console.log(`Закончена первичная регулировка`)
        PrimaryTech.busy = false
        Tier1SemiStorage.addAggregate(2)
        if (!SecondaryTech.busy) {
            secondaryTech(time)
        }
    }

    const secondaryTech = (time) => {
        //console.log(`Поступили 2 агрегата на вторичную регулировку`)
        if (Tier1SemiStorage.getAggregate(2) !== false) {
            Skipper.addHandler(secondaryTechEnd, time + +(randomExpTime(T3fact).toFixed(2)))
        }
    }

    const secondaryTechEnd = (time) => {
        //console.log(`Закончена вторичная регулировка`)
        SecondaryTech.busy = false
        tier1sell(time)
        secondaryTech()
    }

    const partialTech = (time) => {
        //console.log(`Поступил 1 агрегат на частичную регулировку`)
        if (PartialTech.busy === false) {
            if (Tier2Storage.getAggregate(1) !== false) {
                Skipper.addHandler(partialTechEnd, time + +(randomExpTime(T4fact).toFixed(2)))
            }
        }
    }

    const partialTechEnd = (time) => {
        //console.log(`Закончена частичная регулировка`)
        PartialTech.busy = false
        tier2sell()
        partialTech(time)
    }

    const tier1sell = (time) => {
        //console.log(`Продано 2 агрегата 1 класса`)
        Sells.tier1Selled += 2
        Sells.totalMoney += +(S1fact * 2)
    }

    const tier2sell = (time) => {
        //console.log(`Продан 1 агрегат 2 класса`)
        Sells.tier2Selled += 1
        Sells.totalMoney += +S2fact
    }

    const simulationEnds = (time) => {
        Skipper.handlers = []
        //console.log(Sells)
        //console.log(`Промежуточный склад: В наличии ${Tier1SemiStorage.state.storage}, всего пришло на склад ${Tier1SemiStorage.state.totalCount}`)
        //console.log(`Резервный склад: В наличии ${Tier2Storage.state.storage}, всего пришло на склад ${Tier2Storage.state.totalCount}`)
    }

    Skipper.addHandler(aggregateArrive, 0)
    Skipper.addHandler(simulationEnds, 40320)
    var time = 0

    while (Skipper.handlers.length > 0) {
        //console.log('Квант времени:', time)

        const current = Skipper.next()
        time = current.time
        //console.log(`Происходит событие`, current)
        current.handler(time)
    }

    return {
        Sells,
        Tier1: Tier1SemiStorage.state,
        Tier2: Tier2Storage.state,
    }
}

Variant.find().then(async (res) => {
    //console.log(res)
    let variants = await Variant.find()
    let results = []
    variants.forEach((variant) => {
        const resu = simulate(variant.values)
        console.log(resu)
        results.push({ ...resu, values: variant.values, value: resu.Sells.totalMoney / (resu.Tier1.totalCount + resu.Tier2.totalCount) })
    })
    results.sort((a,b) => {
        if(a.value > b.value) return -1
        if(a.value < b.value) return 1
        return 0
    })
    console.log(`Оптимальный вариант: `, results[0])
    //process.exit()
}).catch(console.log)


