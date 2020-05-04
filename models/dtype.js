function dtype(p){
    return function (target, name, descriptor) {
        target[name] = {dtype: p};
    }
}

module.exports = dtype;