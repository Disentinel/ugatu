function randomExponential(rate) {
    rate = rate || 1;
    return -Math.log(Math.random())/rate;
}

function randomExpTime(min) {
    return randomExponential(1 / min)
}


