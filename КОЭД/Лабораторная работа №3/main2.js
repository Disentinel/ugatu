const btn = document.getElementById('go')

btn.onclick = onClickHandler

function returnResult(response) {
    document.getElementById('result').innerHTML += `\n` + response
}

function get1M(N) {
    let M = []
    for (let i = 0; i < N; i++) {
        M[i] = []
        for (let j = 0; j < N; j++) { 
            M[i][j] = +(i === j)
        }
    
    }
    return M
}

function checkEnd(A, E, a0, N) {
        let flag = true
        let edge = E * a0
        let comp = [edge]
        for (let i = 0; i < N; i++) {
            if(A[i][i] > edge) flag = false
            comp.push(A[i][i].toFixed(4))
        }
        //console.log('Сравнения',comp)
        return flag
}

function findElem(A, ak) {
    let result = null
    const N = A.length
    for (let i = N - 1; i >= 0 ; i--) {
        for (let j = N - 1; j >= 0; j--) { 
            if(i !== j && Math.abs(A[i][j]) > ak) {
                result = {
                    num: A[i][j],
                    p: i,
                    q: j
                }
            }
        }
    }
    //console.log('Finded', result)
    return result
}

function onClickHandler() {
    document.getElementById('result').innerHTML = ''

    const inp = document.getElementById('matrix')

    // Заданная матрица
    var A = JSON.parse(inp.value)
    console.log(inp.value)
    console.log('Исходная матрица ', A)

    // Размерность матрицы
    const N = A.length

    // Точность
    const E = 0.95

    // Вычисляем первую преграду
    let sum = 0
    for(let j = 1; j < N; j++) {
        for(let i = 0; i < j; i++) {
            sum += Math.pow(A[i][j], 2)
        }
    }

    // Массив преград
    a = []
    // Стартуем последовательность преград
    a[0] = (Math.sqrt(2 * sum)) / N

    let counter = 0

    // Матрица собственных векторов
    var T = get1M(N)

    console.log(T)

    var check = checkEnd(A, E, a[0], N)

    while(!check && counter < 60000) {
        const ca = a[a.length - 1]

        
       

        // Находим внедиагональный элемент A(p,q), по модулю превосходящий ca. 
        let src = findElem(A, ca)

        // Если такой есть то анализируем
        if(src !== null) {
            const { p, q } = src
            const y = (A[p][q] - A[q][q]) / 2
            if(y == 0) {
                var x = -1
            } else {
                var x = (-1 * Math.sign(y) * A[p][q]) / (Math.sqrt(Math.pow(A[p][q], 2) + Math.pow(y,2)))
            }
            let s = x / (Math.sqrt(2 * (1 + Math.sqrt(1 - Math.pow(x,2)))))
            let c = Math.sqrt(1 - Math.pow(s,2))
            
            // Делаем преобразование
            for(let i = 0; i < N; i++) {
                if(i !== p && i !== q) {
                    let Z1 = A[i][p]
                    let Z2 = A[i][q]
                    A[q][i] = Z1 * s + Z2 * c
                    A[i][q] = A[q][i]
                    A[i][p] = Z1 * c - Z2 * s
                    A[p][i] = A[i][p]
                }
            }
            // Преобразуем матрицу T
            for(let i = 0; i < N; i++) {
                let Z3 = T[i][p]
                let Z4 = T[i][q]
                T[i][q] = Z3 * s + Z4 * c
                T[i][p] = Z3 * c - Z4 * s
            }
            // Добиваем оставшиеся элементы
            let Z5 = s * s
            let Z6 = c * c
            let Z7 = s * c
            let V1 = A[p][p]
            let V2 = A[p][q]
            let V3 = A[q][p]
            
            A[p][p] = (V1 * Z6) + (V3 * Z5) - (2 * V2 * Z7)
            A[q][q] = (V1 * Z5) + (V3 * Z6) + (2 * V2 * Z7)
            A[p][q] = (V1 - V3) * Z7 + V2 * (Z6 - Z5)
            A[q][p] = A[p][q]
            

            console.log(`Итераций сделано `, ++counter)
        } else {
            // Если нет то рассчитываем новую преграду
            a.push(a[a.length - 1] / Math.pow(N,2))
        }
        check = checkEnd(A, E, a[0], N)
    }

    // Собственные числа
    let L = [] // L-Lambda
    for(let i = 0; i < N; i++) {
        L.push(A[i][i])
    }
    let Lsorted = L.sort().reverse().map(val => val.toFixed(5))
    console.log(`Новая матрица А `, JSON.stringify(A))
    console.log(`Новая матрица Т `, JSON.stringify(T))
    console.log('Ключевые элементы', Lsorted)

    


}
