
## 浅拷贝（shallow copy）

浅拷贝可以理解为，拷贝的是每一项的指针，如果被拷贝的某一项引用类型内容发生更改，浅拷贝出来的结果也会受影响更改到。

* 数组浅拷贝可以使用Array.prototype.slice() 、Array.prototype.concat() 或 [...arr] 数组解构运算形式：

```
let arr = [{
    n: 2,
    m: {
        p: 9
    }
}]
let arr2 = arr.slice()
let arr3 = [].concat(arr)
let arr4 = [...arr]

arr[0].n = 10
console.log(arr2[0].n) // 10
console.log(arr3[0].n) // 10
console.log(arr4[0].n) // 10

```

* 对象浅拷贝可以使用Object.assign 或 {...obj} 对象解构运算形式，但注意这两种方式只会复制可枚举的项：

```
let obj = {
    n: {
        m: 9
    },
    g: 6
}
Object.defineProperty(obj, 'g', {
	enumerable: false
})
let obj2 = Object.assign({}, obj)
let obj3 = {...obj}

console.log(obj2) // 没有g参数
console.log(obj3) // 没有g参数

obj.n.m = 10
console.log(obj2.n.m) // 10
console.log(obj3.n.m) // 10

```

* 或者可以手写一个函数浅拷贝数组和对象：

```
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

```

## 深拷贝（deep copy）

深拷贝的定义是，完完整整得拷贝每一项内容，而不是指针，即使每一项内容嵌套了很多层。

我们先来列出几种大法，以及说说它们的利弊：

* JSON大法

```
let obj = {
    n: {
        m: 9
    }
}
let copy = JSON.parse(JSON.stringify(obj));
```

一句搞定，是目前最简单的深拷贝方式，但在复杂的情景下，会存在以下三个缺陷：

1. 循环引用报错:

```
const x = {};
const y = {x};
x.y = y; // Cycle: x.y.x.y.x.y.x.y.x...
const copy = JSON.parse(JSON.stringify(x)); // 报错
```
2. JSON不支持NaN，Infinity，甚至精确的浮点数， 而且像Maps, Sets, RegExps, Dates, ArrayBuffers和其他内置对象序列化可能存在问题。

```
let obj = {
	a: NaN,
	b: function() {},
	c: /^asd$/,
	d: Symbol('foo'),
	e: new Date(),
    f: undefined
}
let cp = JSON.parse(JSON.stringify(obj))
console.log(cp) // 打印出来的对象不对，可以在控制台看看
```

我们会发现obj中的date对象成了字符串，函数直接就不见了，正则成了一个空对象。

3. 相同的引用会被重复复制

```
let obj = {  asd:'asd' }; 
let param = {name:'aaaaa'};
obj.t1 = param;
obj.t2 = param;

let cp = JSON.parse(JSON.stringify(obj))

obj.t1.name = 'bbbbb'
cp.t1.name = 'ccccc'
console.log(obj.t2.name) // bbbbb
console.log(cp.t2.name) // aaaaa
```

obj 对象的t1和t2属性，具备使用同一个param对象指针的关系，但深拷贝后的cp对象打破了这种关系，将t1和t2属性相同的引用复制了两遍。所以，JSON实现深复制不能处理指向相同引用的情况，相同的引用会被重复复制。


* 手动递归实现

```
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

```

关键点： 

1. hash值用来储存已经复制的对象，后面再遇到相同对象可以使用同一个指针，解决循环引用和引用复用问题。

2. 识别到typof是object后，需要区分数组、普通对象和内置对象,需要补全。其中，对function类型直接返回，因为目前没什么比较好的方式复制function,而且觉得好像也没有必要。

来溜溜方法：

```
let obj = {
	a: NaN,
	b: function() {},
	c: /^asd$/,
	d: Symbol('foo'),
    e: new Date(),
    f: new Set([12,34,4]),
    g: new Map()
}
obj.g.set('k', 9)
let cp = deepClone(obj)

console.log(obj.a === cp.a) // false ---number
console.log(obj.b === cp.b) // true  ---Function
console.log(obj.c === cp.c) // false ---RegExp
console.log(obj.d === cp.d) // true  ---Symbol
console.log(obj.e === cp.e) // false ---Date
console.log(obj.f === cp.f) // false ---Set
console.log(obj.g === cp.g) // false ---Map
```

递归实现的好处就是，可控性比较高点，但缺点就是，如果遇到应用场景比较复杂的时候，需要特别处理一些对象类型，还存在问题如如何拷贝原型链上的属性、如何拷贝不可枚举属性、如何拷贝Error对象等。具体处理会关注到很多细节，感兴趣可以看这里。

但实际开发中，我们懒得自己写那么多代码处理，所以一般都会用lodash这类可靠库。


* Structured Clone 结构化克隆算法

结构化克隆算法是由HTML5规范定义的用于复制复杂JavaScript对象的算法。结构化克隆的好处在于它处理循环对象并支持大量的内置类型。问题是，在编写本文时，该算法并不能直接使用，只能作为其他 API 的一部分。所以我们可以通过以下方式来间接使用结构化克隆算法：

1. [MessageChannel](https://developer.mozilla.org/zh-CN/docs/Web/API/MessageChannel)

我们可以创建一个 MessageChannel 并发送消息。在接收端，消息包含我们原始数据对象的结构化克隆。
```
function structuralClone(obj) {
  return new Promise(resolve => {
    const {port1, port2} = new MessageChannel();
    port2.onmessage = ev => resolve(ev.data);
    port1.postMessage(obj);
  });
}

const obj = /* ... */;
const clone = await structuralClone(obj);
```

2. [History API](https://developer.mozilla.org/zh-CN/docs/Mozilla/Add-ons/WebExtensions/API/history)

如果你曾经使用history.pushState()写过 SPA，你就知道你可以提供一个状态对象来保存 URL。事实证明，这个状态对象使用结构化克隆 - 而且是同步的。我们必须小心使用，不要把程序逻辑使用的状态对象搞乱了，所以我们需要在完成克隆之后恢复原始状态。为了防止发生任何意外，请使用history.replaceState()而不是history.pushState()。需要注意，Safari 浏览器对replaceState调用的限制数量为 30 秒内 100 次。

```
function structuralClone(obj) {
  const oldState = history.state;
  history.replaceState(obj, document.title);
  const copy = history.state;
  history.replaceState(oldState, document.title);
  return copy;
}

const obj = /* ... */;
const clone = structuralClone(obj); 
```

3. [Notification API](https://developer.mozilla.org/zh-CN/docs/Web/API/notification)

```
function structuralClone(obj) {
  return new Notification('', {data: obj, silent: true}).data;
}

const obj = /* ... */;
const clone = structuralClone(obj);
```

但它需要浏览器内部的权限机制，可能它是比较慢的。由于某种原因，Safari 总是返回undefined。


结构化克隆算法虽然可以处理大量内置对象类型，但实际上不容忽视的是，它并不能处理Function和Symbol类型，原形链上的属性也不会被追踪以及复制等。[具体点击看这里](https://developer.mozilla.org/zh-CN/docs/Web/Guide/API/DOM/The_structured_clone_algorithm)


通过对深拷贝的三大类方法的讨论，得出的最终结论是：

    * 如果您没有循环对象，并且不需要保留内置类型，则可以使用跨浏览器的JSON.parse(JSON.stringify())获得最快的克隆性能，而且代码简洁。

    * 如果你想提高可控性，建议使用递归实现方法。在生产环境中，可以使用lodash等工具库。

    * 如果你想要一个适当的结构化克隆，MessageChannel是你唯一可靠的跨浏览器的选择。但你必须要明白结构化克隆不能支持的数据类型和细节。

### 参考

https://justjavac.com/javascript/2018/02/02/deep-copy.html
https://juejin.im/post/5b20c9f65188257d7d719c1c
https://juejin.im/post/5b235b726fb9a00e8a3e4e88

