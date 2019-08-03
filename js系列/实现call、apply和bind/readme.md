# js系列之实现call、apply和bind

# 实现call、apply和bind

## 一. call和apply

### 1. 代码完整实现

```

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


Function.prototype.myapply = function (context, ...argus) {
    if (typeof this !== 'function') {
        throw new TypeError('not funciton')
    }
    const fn = this
    let result = null

    context = context || window
    argus = argus && argus[0] || []
    context.fn = fn
    result = context.fn(...argus)
    delete context.fn
    
    return result
}
```

### 2. 先来溜溜

* 案例一
```
class Member {
    constructor (options) {
        const {name, sex, age} = options
        this.name = name
        this.sex = sex
        this.age = age
    }

    introduce () {
        console.log(`I'm ${this.name}， ${this.age}， ${this.sex}`)
    }
}

const member1 = new Member({
    name: 'gina',
    sex: 'girl',
    age: 23
})

const member2 = new Member({
    name: 'gun',
    sex: 'boy',
    age: 24
})

member2.introduce.mycall(member1) // I'm gina， 23， girl
member2.introduce.myapply(member1) // I'm gina， 23， girl

```

* 案例二
```
Math.max.myapply(null, [1,2,3,4]) // 4
Math.max.mycall(null, 1,2,3,4) // 4
```


### 3. 注意要点

* 开头需要做一个类型判断：
```
if (typeof this !== 'function') {
    throw new TypeError('not funciton')
}
```
* 获取原始函数： 比如执行```Math.max.mycall(null, 1,2,3,4)```的时候，mycall函数内部的this指向了Math.max函数，所以我们可以通过```const fn = this```获取到要执行的函数，然后将该函数绑定到传入的```context```对象(```context.fn = fn```)，然后再把它删除掉```delete context.fn```。


总体来说，call和apply的实现还是比较简单的。


## 二. bind

### 1. 完整代码实现
```
Function.prototype.mybind = function (context, ...argus) {
    if (typeof this !== 'function') {
        throw new TypeError('not funciton')
    }
    const fn = this
    const fBound = function (...argus2) {
        return fn.apply(this instanceof fBound ? this : context, [...argus, ...argus2])
    }
    fBound.prototype = Object.create(this.prototype)
    return fBound
}


```


### 2. 边溜边说
* 案例一
```
const foo = {
    v: 1
};

function bar() {
    return this.v;
}

const bindFoo = bar.mybind(foo);

bindFoo() // 1
```

```bind``` 函数返回的是一个可执行函数，所以```return```了一个函数。此刻返回的函数，按正常来说，在执行的时候，this是指向执行处的当前上下文。但该案例中，
```mybind``` 需要满足bar在执行中返回值时，```this```依然是指向 foo，所以我们在```mybind```返回的函数中需要使用```fn.apply```来保持上下文和执行```mybind```的时候一致。

* 案例二
```
const foo = {
    v: 1
};

function bar(name, age) {
    console.log(this.v);
    console.log(name);
    console.log(age);

}

const bindFoo = bar.bind(foo, 'daisy');
bindFoo('18');
// 1
// daisy
// 18
```
```mybind``` 需要做到可以接受传参，并且将参数给到```bar```函数，后面再执行```bindFoo```再传的参数，会接在之前传参的后面。所以```mybind```源码中使用了```[...argus, ...argus2]```来进行参数整合。

* 案例三
```
const value = 2;

const foo = {
    value: 1
};

function bar(name, age) {
    this.habit = 'shopping';
    console.log(this.value);
    console.log(name);
    console.log(age);
}

bar.prototype.friend = 'kevin';

const bindFoo = bar.bind(foo, 'daisy');

const obj = new bindFoo('18');
// undefined
// daisy
// 18
console.log(obj.habit);
console.log(obj.friend);
// shopping
// kevin
```

在执行```const obj = new bindFoo('18')```这一 ```new```操作的时候，此刻```this```应该指向当前对象```obj ```。所以```mybind```在```fn.apply```的第一个参数，做了这样的判断```this instanceof fBound ? this : context```。

在```const obj = new bindFoo('18')```内部执行到```this instanceof fBound ? this : context```时，此刻```this```指向```obj```，```fBound```其实也就是```bindFoo```，```this instanceof fBound```判断了```obj```是不是继承自```bindFoo```，也就是进行了构建函数```new```操作。

* 案例4

```
function bar() {}

bar.prototype.value = 2

const bindFoo = bar.mybind(null);

bindFoo.prototype.value = 1;

console.log(bar.prototype.value) // 2

```

```mybind``` 执行后返回的函数```fBound```修改```prototype```的时候，不应该影响到```fn.prototype```，两者应该是独立的。所以源码使用了 ```fBound.prototype = Object.create(this.prototype)```， 而不是```fBound.prototype = this.prototype```。


总得来说，```bind```的实现考虑的点还是比较多的。

### [点击项目源码](https://github.com/BoatGina/Blog/tree/master/js%E7%B3%BB%E5%88%97/%E5%AE%9E%E7%8E%B0call%E3%80%81apply%E5%92%8Cbind/src)

### 参考：
https://github.com/mqyqingfeng/Blog/issues/12
