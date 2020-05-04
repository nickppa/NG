function props(p){
    return function (target) {
        target.prototype._props = p;
    }
}

module.exports = props;