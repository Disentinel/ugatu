const btn = document.getElementById('go')

btn.onclick = onClickHandler

function returnResult(response) {
    document.getElementById('result').innerHTML = response
}

function getMiddle(row) {
    const sum = row.reduce((acc, val) => {
        return +acc + +val
    }, 0)
    return (sum / row.length)
}

function getDisp(row, mid) {
    const sum = row.reduce((acc, val) => {
        return +acc + Math.pow(val - mid, 2)
    }, 0)
    return Math.sqrt(sum / row.length)
}

function onClickHandler() {
        const inp = document.getElementById('matrix')
        const M = JSON.parse(inp.value)

        // Размерность матрицы
        const N = M.length
        const P = M[0].length

        // Считаем среднее для каждого столбца
        const Mid = M.map(getMiddle)

        // Оцениваем дисперсию
        const Disp = M.map((val, idx) => {
            return getDisp(val, Mid[idx])
        })

        // Считаем ковариационную матрицу
        const COV = []
        for (let i = 0; i < N; i += 1) {
            COV[i] = []
            for (let j = 0; j < N; j += 1) {
                COV[i][j] = M.reduce((acc, val) => {
                    return +acc + ((val[i] - Mid[i]) * (val[j] - Mid[j]))
                }, 0) / N
            }
        }

        // Считаем стандартизированную матрицу
        const X = []
        for (let i = 0; i < N; i += 1) {
            X[i] = []
            for (let j = 0; j < P; j += 1) {
                X[i][j] = (M[i][j] - Mid[i]) / Disp[i]
            }
        }

        // Считаем корреляционную матрицу
        const R = []
        for (let i = 0; i < N; i += 1) {
            R[i] = []
            for (let j = 0; j < N; j += 1) {
                let sum = 0
                for (let k = 0; k < N; k += 1) {
                    sum += X[i][k] * X[j][k]
                }
                R[i][j] = sum / N
            }
        }

        // Считаем статистику для каждой пары столбцов
        const t = []
        for (let i = 0; i < N; i += 1) {
            t[i] = []
            for (let j = 0; j < N; j += 1) {
                const r = R[i][j]
                const stat = Math.abs(parseFloat(((r * Math.sqrt(N - 2)) / Math.sqrt(1 - Math.pow(r, 2))).toFixed(3)))
                const stud = Tmap[(N - 1).toString()]
                t[i][j] = stat
                if(stat > stud && i !== j) {
                    console.log(`Найдена корреляция между столбцами №${i} и №${j}, превышение табличного коэффициента на ${(((stat/stud) * 100) - 100).toFixed(2)}%`)
                }
            }
        }

        console.log('Исходный массив: ', M)
        console.log('Средние :', Mid)
        console.log('Дисперсия :', Disp)
        console.log('Ковариации :', COV)
        console.log('Стандартизированная матрица', X)
        console.log('Корреляционная матрица', R)
        console.log('Матрица статистик', t)




  
}

// Таблица коэффициентов Стьюдента для различных степеней свободы при alpha = 0.05
const Tmap = {
    "2": 12.7062047364,
    "3": 4.30265272991,
    "4": 3.18244630528,
    "5": 2.77644510520,
    "6": 2.57058183661,
    "7": 2.44691184879,
    "8": 2.36462425101,
    "9": 2.30600413503,
    "10": 2.26215716274,
    "11": 2.22813885196,
    "12": 2.20098516008,
    "13": 2.17881282966,
    "14": 2.16036865646,
    "15": 2.14478668792,
    "16": 2.13144954556,
    "17": 2.11990529922,
    "18": 2.10981557783,
    "19": 2.10092204024,
    "20": 2.09302405441,
    "21": 2.08596344727,
    "22": 2.07961384473,
}