

Function.prototype.mycall = function (context, ...argus) {
    if (typeof this !== 'function') {
        throw new TypeError('not funciton')
    }
    const fn = this
    let result = null

    context = context || window
    context.fn = fn
    result = context.fn(...argus)
    delete context.fn
    
    return result
}