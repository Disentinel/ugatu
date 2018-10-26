var mongoose = require('mongoose')
require('babel-polyfill')

const database = 'mongodb://localhost:27017/test'

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
module.exports.Variant = Variant

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

const check = (T2minus, T3minus, T4minus) => {
    // Фактическая длительность
    const T2fact = T2 - T2minus
    const T3fact = T3 - T3minus
    const T4fact = T4 - T4minus

    // Фактическая стоимость
    const S1fact = S1 - (T2minus * S3) - (T3minus * S4)
    const S2fact = S2 - (T4minus * S5)

    // Стоимость не может быть меньше или равна нулю
    if (S1fact <= 0 || S2fact <= 0) return false

    // Длительность не может быть меньше нуля
    if (T2fact < 0 || T3fact < 0 || T4fact < 0) return false

    // Если ограничения соблюдены то всё ок
    return true
}

var stopFlag = false

async function iter() {
    const value = await Variant.findOne({ 'processed': false })
    console.log(value)
    if (!value) {
        stopFlag = true
    } else {
        let newVariants = []
        const [x, y, z] = value.values

        newVariants = [
            [x + 1, y, z],
            [x, y + 1, z],
            [x, y, z + 1],
        ]

        console.log(newVariants)
        newVariants.forEach(async (val) => {
            if (check(...val)) {
                await Variant.create({ _id: val.join('_'), values: val, processed: false }).catch(() => {
                    console.log('dup!')
                })
            }
        })
        value.processed = true
        await value.save()
    }
}


const start = [0, 0, 0]

Variant.create({ _id: start.join('_'), values: start, processed: false }).finally(async (res) => {
    let counter = 0
    while (!stopFlag && counter++ < 100000) {
        await iter()
    }
    process.exit()
})



//setTimeout(process.exit, 3000)