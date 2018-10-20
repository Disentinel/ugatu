var plot = document.getElementById('plot').getContext('2d')


const WIDTH = document.getElementById('plot').width
const HEIGHT = document.getElementById('plot').height

const getR = (min, max) => {
    return Math.random() * (max - min) + min
}
// класс Точка
    class Point {
        constructor(x, y) {
            this.y = y,
            this.x = x
        }
        invertY() {
            this.y = HEIGHT - this.y
        }
    }
// отрисовать линию
    const line = (p1, p2, color = '#000', lineWidth = 3) => {
        plot.strokeStyle = color
        plot.lineWidth = lineWidth
        plot.beginPath()
        plot.moveTo(p1.x, p1.y)
        plot.lineTo(p2.x, p2.y)
        plot.closePath()
        plot.stroke()
    }
// отрисовать надпись
    const text = (string, location, offsetX = 0, offsetY = 0) => {
        plot.strokeStyle = '#000'
        plot.fillStyle = '#000'
        plot.fillText(string, location.x + offsetX, location.y + offsetY)
    }
// отрисовать точку
    const point = (location, size = 5, fill = '#000', stroke = '#000') => {
        plot.fillStyle = fill
        plot.strokeStyle = stroke
        plot.lineWidth = 1
        plot.beginPath()
        plot.arc(location.x, location.y, size, 0, 7, false)
        plot.closePath()
        plot.fill()
        plot.stroke()
    }
// получить точки между точкой А и точкой Б по прямой
    const get_points_between = (A, B, N) => {
        let intervalX = Math.abs(A.x - B.x) / N,
            intervalY = Math.abs(A.y - B.y) / N
        
        let dirX = (A.x < B.x) ? 1 : -1,
            dirY = (A.y < B.y) ? 1 : -1


        let between = []
        for(let i = 1; i < N ; i++) {
            between.push(new Point(
                A.x + (intervalX * i * dirX),
                A.y + (intervalY * i * dirY)
            ))
        }
        return between
    }
// создание осей
    const axises = () => {
        let O = new Point(25, 25)
        O.invertY()
        let OX = new Point(WIDTH - 25, 25)
        OX.invertY()
        let OY = new Point(25, HEIGHT - 25)
        OY.invertY()

        let axisX = get_points_between(O, OX, 50)
        let axisY = get_points_between(O, OY, 25)
        axisX.push(OX)
        axisY.push(OY)

        return {
            O,
            OX,
            OY,
            X: axisX,
            Y: axisY
        }
    }
// ОТРИСОВКА КООРДИНАТНОЙ ПЛОСКОСТИ
    const AXIS = axises()

    point(AXIS.O, 5, 'rgba(0,0,0,0.1)')
    text('0', AXIS.O, -15, 15)

    line(AXIS.O, AXIS.OX, '#000', 3)
    line(AXIS.O, AXIS.OY, '#000', 3)

    AXIS.X.map((val, idx) => {
        line(val, new Point(val.x, AXIS.OY.y), 'rgba(0,0,0,0.1)')
        point(val, 3, 'rgba(0, 255, 0, 0.5)')
        text(idx + 1, val, -5, 15)
    })

    AXIS.Y.map((val, idx) => {
        line(val, new Point(AXIS.OX.x, val.y), 'rgba(0,0,0,0.1)')
        point(val, 3, 'rgba(0, 0, 250, 0.5)')
        text(idx + 1, val, -20, 5)
    })

    text('Ось X', AXIS.OX, -15, -10)
    text('Ось Y', AXIS.OY, -15, -10)

// ФУНКЦИЯ ДЛЯ ГРАФИКА
    let c1 = getR(12,18)
    let c2 = getR(18,22)
    let myfunc = (X) => {
        return Math.sin(X / c1) * c2
    }
    let myfuncFromY = (Y) => {
        return Math.asin(Y / 20) * 15
    }

// ПОЛУЧЕНИЕ МАССИВА ТОЧЕК ДЛЯ ГРАФИКА
    let func_line = []
    for(let X = 0; X < AXIS.X.length; X += 0.1) {
        func_line.push(new Point(
            X,
            myfunc(X)
        ))
    }

// получить реальные координаты точки по условным координатам плоскости
    const get_real_coords = (P) => {
        let PX_real = 25 + P.x * ((AXIS.OX.x - AXIS.O.x) / AXIS.X.length),
            PY_real = 25 + P.y * ((AXIS.OY.y - AXIS.O.y) / AXIS.Y.length) - (AXIS.OY.y - AXIS.O.y)
        return new Point(PX_real, PY_real)
    }

// ОТРИСОВКА ГРАФИКА
    let real_line = []
    // точки
    for(let P of func_line) {
        let real = get_real_coords(P)
        //console.log(`P:(${P.x}, ${P.y}), REAL:(${real.x}, ${real.y})`)
        //point(real, 4, '#F00')
        real_line.push(real)
    }
    // линия
    for(let i = 1; i < real_line.length; i++) {
        line(real_line[i-1], real_line[i], 'rgba(255,0,0,0.5)', 3)
    }

// ПРЯМОУГОЛЬНИК ДЛЯ ВЫЧИСЛЕНИЯ ПЛОЩАДИ
    A = new Point(getR(1,8), getR(0,8))
    D = new Point(getR(40,48), getR(10, 24))
    B = new Point(A.x, D.y)
    C = new Point(D.x, A.y)

// Отрисовка прямоугольника
    let rect = [A, B, C, D]
    console.log(rect)

    rect.map((p, idx) => {
        point(get_real_coords(p), 5, '#0FF')
    })

    text('A', get_real_coords(A), -5, -10)
    text('B', get_real_coords(B), -5, -10)
    text('C', get_real_coords(C), -5, -10)
    text('D', get_real_coords(D), -5, -10)

    line(get_real_coords(A), get_real_coords(B), 'rgba(0, 0, 0, 0.8)', 2)
    line(get_real_coords(A), get_real_coords(C), 'rgba(0, 0, 0, 0.8)', 2)
    line(get_real_coords(D), get_real_coords(C), 'rgba(0, 0, 0, 0.8)', 2)
    line(get_real_coords(B), get_real_coords(D), 'rgba(0, 0, 0, 0.8)', 2)

    const RECT_S = (B.y - A.y) * (C.x - A.x)
    text(`Площадь прямоугольника: ${RECT_S.toFixed(3)}`, get_real_coords(A), 20, 20)


// ОБЛАСТЬ ГРАФИКА ДЛЯ РАСЧЕТА ПЛОЩАДИ
    let real_field = []
    let rect_field = func_line.filter((line, idx) => {
        if(line.x > A.x 
            && line.y > A.y 
            && line.x < D.x
            && line.y < D.y) {
                real_field.push(real_line[idx])
                return true
            } else {
                return false
            }
            
    })
// ПОИСК X В БЛИЖАЙШЕЙ ТОЧКЕ ПЕРЕСЕЧЕНИЯ
    const find_nearest_intersection = (border, startX, precision) => {
    let new_X = startX
    let fact_diff = Math.abs(myfunc(new_X) - border)
    let prev = fact_diff,
        direction = -1,
        step = 0.5
    while(fact_diff > precision) {
        if(fact_diff > prev) direction = direction * -1
        //console.log(`X: ${new_X}, diff = ${fact_diff.toFixed(4)}, \n  new: ${new_X} - ${step * direction}, \n  direction: ${direction}, `)
    
        new_X = new_X + (step * direction)
        
        if(step * 2 > prev) step = step / 2
    
        prev = fact_diff
        fact_diff = Math.abs(myfunc(new_X) - border)
    }
    console.log(`new_X: ${new_X} with fact diff = ${fact_diff}, value ${myfunc(new_X)}`)
    return new_X
    }
// ПОИСК ТОЧЕК ПЕРЕСЕЧЕНИЯ С НИЖНЕЙ ГРАНИЦЕЙ
    let border = A.y
    let first = rect_field[0]
    let second = rect_field[rect_field.length - 1]

    let F_X = find_nearest_intersection(border, first.x, 0.001)
    console.log(F_X)
    if(F_X < A.x) {
        real_field.unshift(get_real_coords(new Point(A.x, myfunc(A.x))))
        real_field.unshift(get_real_coords(A))
    } else {
        real_field.unshift(get_real_coords(new Point(F_X, myfunc(F_X))))
    }
    
    
    let S_X = find_nearest_intersection(border, second.x, 0.001)
    if(S_X > D.x) {
        real_field.push(get_real_coords(new Point(C.x, myfunc(C.x))))
        real_field.push(get_real_coords(C))
    } else {
        real_field.push(get_real_coords(new Point(S_X, myfunc(S_X))))
    }

// ОТРИСОВКА ПОЛУЧЕННОЙ ОБЛАСТИ
    console.log(real_field)
    plot.beginPath()
    plot.moveTo(real_field[0].x, real_field[0].y)
    for(let p of real_field) {
        plot.lineTo(p.x, p.y)
    }
    plot.closePath()
    plot.fillStyle = 'rgba(255,0,0,0.3)'
    plot.fill()

// РАСЧЕТ ПЛОЩАДИ ОБЛАСТИ
   
    
    const monte_karlo = (N, draw = false) => {
        let inner = 0
        for(let i = 0; i < N; i++) {
            let P = new Point(getR(A.x, D.x), getR(A.y, D.y))
            if(P.y < myfunc(P.x)) {
                if(draw) point(get_real_coords(P), 2, 'rgba(0,220,0,0.4)', 'rgba(0,255,0,0.1)')
                inner++
            } else {
                if(draw) point(get_real_coords(P), 2, 'rgba(0,0,220,0.4)', 'rgba(0,0,255,0.1)')
            }
        }
        return RECT_S * (inner / N)
    }
// ОТРИСОВКА ДЕМОНСТРАЦИОННОГО ПРИМЕРА
    text(`Площадь выделенной области: ${monte_karlo(5000, true).toFixed(3)} при N = 5000`, get_real_coords(new Point(A.x + (D.x - A.x) / 2, A.y + (D.y - A.y) / 2)), -140)

// Проведение серии испытаний
    let variants = [1, 10, 100, 1000, 10000, 100000, 1000000, 10000000]

    let table = document.createElement('table')
    document.body.appendChild(table)


//ВСТАВКА СТРОКИ
    const addRow = (cols) => {
        let new_row = document.createElement('tr')
        table.appendChild(new_row)

        cols.map((text) => {
            let new_td = document.createElement('td')
            new_row.appendChild(new_td)
            new_td.innerHTML = text
        })
    }


    let cols = ['Количество точек', 'Количество прогонов','Средняя площадь', 'Отклонение', 'Средний разброс (+/-)', 'Время выполнения (мс)']

    addRow(cols)
// ОСНОВНОЙ КОД ЭКСПЕРИМЕНТА
    let prev_delta = 0
    let prev_S = 0
    for(let variant of variants) {
        let start = performance.now()
        let results = []
        let N = (10000000 / variant)
        for(let i = 0; i < N; i++) {
            results.push(monte_karlo(variant))
        }
        let middle_S = results.reduce((acc, val) => {
            return acc + val
        },0) / N

        let absolute = Math.abs(prev_S - middle_S)
        prev_S = middle_S
        let spread = results.reduce((acc, val) => {
            return Math.abs(val - middle_S) + acc
        },0) / N

        
        addRow([variant, N, middle_S.toFixed(3), absolute.toFixed(3), spread.toFixed(3), Math.round(performance.now() - start)])
    }

let wait = document.getElementById('wait')
document.body.removeChild(wait)