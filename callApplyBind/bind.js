Function.prototype.mybind = function (context, ...argus) {
    if (typeof this !== 'function') {
        throw new TypeError('not funciton')
    }
    const fn = this
    const fBound = function (...argus2) {
        return fn.apply(this instanceof fBound ? this : context, [...argus, ...argus2])
    }
    fBound.prototype = this.prototype
    return fBound
}

