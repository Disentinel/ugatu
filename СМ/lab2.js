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
            const num = +val
            return parseFloat(num.toFixed(5)) >= +(range.from) && val <= +(range.to)
        })
        return {
            value: (match.length / values.length),
            count: match.length
        }
    })
}


function simulate () {
    customersCounter = 0



    // Рандомное целое в нужном диапазоне
    function randI(min, max) {
        var rand = min - 0.5 + Math.random() * (max - min + 1)
        rand = Math.round(rand);
        return rand;
    }

    // X - Промежуток между покупателями
    const getX = () => {
        return randI(1, 10)
    }

    // Y - Время обслуживания
    const getY = () => {
        return randI(2, 8)
    }

    // Абстракции
    const CustomersQueue = () => {
        let obj = { customers: [], totalCount: 0 }
        obj.getCustomer = () => {
            if (obj.customers.length > 0) {
                return obj.customers.pop()
            } else {
                return false
            }
        }
        obj.addCustomer = (customer) => {
            obj.customers.unshift(customer)
            obj.totalCount++
            return true
        }

        return obj
    }

    const Customer = (time) => {
        var obj = {}
        obj.id = customersCounter++
        obj.arrivalTime = time
        obj.queueTime = null
        obj.serviceTime = null
        obj.totalTime = null
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

    // Глобальные объекты
    var Manager = { busy: false, current: null, wait: 0, startWaiting: 0 }
    var Skipper = TimeSkipper()
    var Queue = CustomersQueue()
    var Served = []
    const A = 480 // 8 часов работает магазон
    const B = 30 + (5 * 12) // Момент замера очереди
    var queueSize = null // Переменная для замера

    // Обработчики событий
    const customerArrive = time => {
        // console.log('Пришел посетитель')
        const C = Customer(time)
        Queue.addCustomer(C)
        if (Manager.busy === false) {
            startServing(time)
        }
        Skipper.addHandler(customerArrive, time + getX())
    }

    const startServing = time => {
        const C = Queue.getCustomer()
        if (C) {
            Manager.wait += time - Manager.startWaiting
            Manager.startWaiting = null
            // console.log('Начинаем обслуживать посетителя')
            Manager.busy = true
            C.queueTime = time - C.arrivalTime
            Manager.current = C
            Skipper.addHandler(endServing, time + getY())
        }
    }

    const endServing = time => {
        // console.log('Закончили обслуживать посетителя')
        Manager.busy = false
        const C = Manager.current
        Manager.current = null
        C.totalTime = time - C.arrivalTime
        C.serviceTime = C.totalTime - C.queueTime
        // console.log(C)
        Served.push(C)
        Manager.startWaiting = time
        startServing(time)
    }

    const checkoutQueue = time => {
        queueSize = Queue.customers.length
        // console.log(`Сейчас в очереди ${queueSize} посетителей`)
    }

    const simulationEnds = (time) => {
        Skipper.handlers = []
    }

    Skipper.addHandler(customerArrive, 0)
    Skipper.addHandler(simulationEnds, A)
    Skipper.addHandler(checkoutQueue, B)

    var time = 0

    while (Skipper.handlers.length > 0) {
        const current = Skipper.next()
        time = current.time
        // console.log('Квант времени:', time)
        // console.log(`Происходит событие`, current)
        current.handler(time)
    }

    return {
        customersTotal: Served.length,
        queueTime: (Served.map(val => val.queueTime).reduce((acc, val) => (acc + val), 0) / Served.length).toFixed(2),
        serviceTime: (Served.map(val => val.serviceTime).reduce((acc, val) => (acc + val), 0) / Served.length).toFixed(2),
        waitTime: Manager.wait,
        queueSize: queueSize
    }
    /*
    console.log(`Всего обслужено ${Served.length} посетителей`)
    console.log(`Среднее время ожидания ${(Served.map(val => val.queueTime).reduce((acc, val) => (acc + val), 0) / Served.length).toFixed(2)} минут`)
    console.log(`Среднее время обслуживания ${(Served.map(val => val.serviceTime).reduce((acc, val) => (acc + val), 0) / Served.length).toFixed(2)} минут`)
    console.log(`Среднее общее время ${(Served.map(val => val.totalTime).reduce((acc, val) => (acc + val), 0) / Served.length).toFixed(2)} минут`)
    
    console.log(`В момент времени ${B} в очереди было ${queueSize} посетителей`)
    console.log(`Простой продавца составил ${Manager.wait} минут`)
    */
}

const results = []
for(let i = 0; i < 1000; i++) {
    results.push(simulate())
}

let customersTotal = results.map(val => val.customersTotal)
let queueTime = results.map(val => val.queueTime)
let serviceTime = results.map(val => val.serviceTime)
let waitTime = results.map(val => val.waitTime)
let queueSize = results.map(val => val.queueSize)

// Длина очереди
const Qmin = Math.min(...queueSize)
const Qmax = Math.max(...queueSize)

const Qscale = getScale(10, Qmin, Qmax)
const Qhisto = getHisto(queueSize, Qscale)
const Qmain = Qscale.map((val, idx) => {
    return {
        ...Qhisto[idx],
        ...val
    }
})

console.log(`Длина очереди MAX ${Qmax}, MIN ${Qmin}`)
console.log(`Распределение значений (частота, количество, начало интервала, конец интервала)`)
console.log(Qmain)

// Простой продавца
const Pmin = Math.min(...waitTime)
const Pmax = Math.max(...waitTime)

const Pscale = getScale(10, Pmin, Pmax)
const Phisto = getHisto(waitTime, Pscale)
const Pmain = Pscale.map((val, idx) => {
    return {
        ...Phisto[idx],
        ...val
    }
})

console.log(`Простой продавца MAX ${Pmax}, MIN ${Pmin}`)
console.log(`Распределение значений (частота, количество, начало интервала, конец интервала)`)
console.log(Pmain)

// Время ожидания в очереди
const Wmin = Math.min(...queueTime)
const Wmax = Math.max(...queueTime)

const Wscale = getScale(10, Wmin, Wmax)
const Whisto = getHisto(queueTime, Wscale)
const Wmain = Wscale.map((val, idx) => {
    return {
        ...Whisto[idx],
        ...val
    }
})

console.log(`Ожидание в очереди MAX ${Wmax}, MIN ${Wmin}`)
console.log(`Распределение значений (частота, количество, начало интервала, конец интервала)`)
console.log(Wmain)

