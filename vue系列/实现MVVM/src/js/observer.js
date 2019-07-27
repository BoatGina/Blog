

function observe(value) {
    if (!value || typeof value !== 'object') {
        return;
    }

    return new Observer(value);
}


class Dep {

    static uid = 0

    static target = null

    constructor () {
        this.id = Dep.uid++
        this.subs = []
    }

    addSub (sub) {
        this.subs.push(sub)
    }

    depend () {
        Dep.target.addDep(this)
    }

    removeSub (sub) {
        var index = this.subs.indexOf(sub)
        if (index != -1) {
            this.subs.splice(index, 1)
        }
    }

    notify () {
        this.subs.forEach(function(sub) {
            sub.update()
        })
    }

}

class Observer {
    constructor (data) {
        this.data = data
        this.walk(data)
    }

    walk (data) {
        Object.keys(data).forEach((k) => {
            this.convert(k, data[k])
        });
    }

    convert (key, val) {
        this.defineReactive(this.data, key, val);
    }

    defineReactive (data, key, val) {
        var dep = new Dep()
        var childObj = observe(val)

        Object.defineProperty(data, key, {
            enumerable: true, // 可枚举
            configurable: false, // 不能再define
            get: function() {
                if (Dep.target) {
                    dep.depend();
                }
                return val;
            },
            set: function(newVal) {
                if (newVal === val) {
                    return;
                }
                val = newVal;
                // 新的值是object的话，进行监听
                childObj = observe(newVal);
                // 通知订阅者
                dep.notify();
            }
        });
    }
}

