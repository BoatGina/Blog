function shallowClone(source) {
    const type = Object.prototype.toString.call(source).slice(8, -1)
    let targetObj = type === 'Array' ? [] : {}

    if (!['Object', 'Array'].includes(type)) {
        throw new Error('error arguments')
    }
    for (let k in source) {
        if (source.hasOwnProperty(k)) {
            targetObj[k] = source[k]
        }
    }
    return targetObj
}


function deepClone(target, hash = new WeakMap()) {
    const isObj = (o) => typeof target === 'object' && target !== null
    let copyTarget = null
    let Constructor = target.constructor

    // 如果不是对象就返回
    if (!isObj(target)) return target

    // 需要区分处理不同内置对象
    switch (Constructor) {
        case RegExp:
            copyTarget = new Constructor(target)
            break
        case Date:
            copyTarget = new Constructor(target.getTime())
            break
        case Set:
            copyTarget = new Constructor(target.values())
            break
        case Map:
            copyTarget = new Constructor(target.entries())
            break
        default:
            if (hash.has(target)) return hash.get(target)
            copyTarget = new Constructor()
            hash.set(target, copyTarget) // hash对象用来存储已有target，来解决循环引用和引用复用问题
    }

    for (k in target) {
        copyTarget[k] = deepClone(target[k], hash)
    }
    return copyTarget
}

function structuralClone1(obj) {
    return new Promise(resolve => {
        const { port1, port2 } = new MessageChannel();
        port2.onmessage = ev => resolve(ev.data);
        port1.postMessage(obj);
    });
}

function structuralClone2(obj) {
    const oldState = history.state;
    history.replaceState(obj, document.title);
    const copy = history.state;
    history.replaceState(oldState, document.title);
    return copy;
}

function structuralClone3(obj) {
    return new Notification('', { data: obj, silent: true }).data;
}

