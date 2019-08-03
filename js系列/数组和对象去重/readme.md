
首先，我们先从简单的来思考吧~ 比如我们要对一组每一项都是基本类型的数组进行去重，然后我们在脑海里排除掉比较low的做法，最后得出下面看起来还可以的做法：


* 借助 js内置的indexOf 进行去重
```
function indexOfUniq(arr) {
    let result = [];
    // 在for循环中，提前存起len = arr.length，以防在处理数组过程中，数组长度被修改
    for (let i = 0, len = arr.length; i < len; i++) {
        // 用indexOf 简化了二层循环的流程
        if (result.indexOf(arr[i]) === -1) result.push(arr[i]);
    }
    return result;
}
```

用到indexOf后，我突然想要不替换成includes试试？好吧，就弄多一个函数吧

* 借助 js内置的includes 进行去重
```
function includesUniq(arr) {
    let result = [];
    for (let i = 0, len = arr.length; i < len; i++) {
        // 因为indexOf是es3的，includes是es6的，indexOf对IE的兼容性会比includes好,项目要兼容IE的话，最好配合使用babel
        if (!result.includes(arr[i])) result.push(arr[i]);
    }
    return result;
}
```

* 排序后前后比对去重
```
function sortUniq(arr) {
    let result = [], last;
    // 这里解构是为了不对原数组产生副作用
    [...arr].sort().forEach(item => {
        if (item != last) {
            result.push(item);
            last = item;
        }
    });
    return result;
}
```

* 通过hashTable去重
```
function hashUniq(arr) {
    let hashTable = arr.reduce((result, curr, index, array) => {
        result[curr] = true;
        return result;
    }, {})
    return Object.keys(hashTable).map(item => parseInt(item, 10));
}
```

* ES6 SET一行代码实现去重
```
function toSetUniq(arr) {
    return [...new Set(arr)];
}
```

这估计是很多人想到的最简单的一个方式了。


然后，我们来比比哪种方式是最快的，弄个test：(可以[点击这里copy代码]()来try try 哈)

```
let data = [];
for (var i = 0; i < 100000; i++) {
    data.push(Math.random())
}

// 实现一个性能测试的装饰器
function performanceTest(fn, descript) {
    var a = new Date().getTime();
    return function () {
        fn.apply(this, [].slice.call(arguments, 0));
        console.log(descript, new Date().getTime() - a)
    }
}

performanceTest(hashUniq, "hashTable")(data)
performanceTest(sortUniq, "sortUniq")(data)
performanceTest(toSetUniq, "toSetUniq")(data)
performanceTest(includesUniq, "includesUniq")(data)
performanceTest(indexOfUniq, "indexOfUniq")(data)

```

在控制台运行后，结果如下：

```
 hashTable 274
 sortUniq 456
 toSetUniq 36
 includesUniq 5520
 indexOfUniq 5805
```

毫无疑问，速度最快，最简洁的，非toSetUniq莫属了。这个故事告诉我们，对每项是基本类型的数组去重的话，用toSetUniq就没错了。


接着，探索如何去重每项是引用类型的数组啦~

我们先弄个假设，假如数组里面的引用类型是事先定义好的：
```
const a = {n: 1}
const b = {n: 2}
const c = [a,a,a,b,b,a,b,a,b]
```

这时候，数组c内部储存的是引用类型的指针，此时使用上述的这些方法是成功的：indexOfUniq includesUniq toSetUniq。 而 sortUniq 失败的原因是sort函数并不能正确得对指针进行排序，hashUniq 失败的原因是对象指针作为key值时， 永远都是相同的 [object Object] 。

所以稍微总结一下，如果我们项目中push进数组的引用类型是可以事先定义的话，我们可以先把对象提取出来，然后还是推荐使用toSetUniq方法去重。

但比较多时候，我们都是push进并没有事先定义好的引用类型，也就是Push进指针不同，但内容有可能相同的项。

按照以往开发经验，一般我们都是push进未事先定义的对象，而且这个对象可能有某个参数来标识的，比如id。如果是这种情况，我们可以借鉴hashtable这样处理比较好：

```
function IdUniqObj (arr,  id) {
    let hashTable = arr.reduce((pre, cur) =>{
        const cid = cur[id]
        if (!pre[cid]) {
            pre[cid] = cur
        }
        return pre
    }, {})
    return Object.values(hashTable)
}

let a = [
    {id: 1, n: 5},
    {id: 1, n: 5},
    {id: 2, n: 5},
    {id: 1, n: 5}
]
IdUniqObj(a, 'id')
```

但如果实在是遇到这种糟糕的情况：
1. 随时Push进未定义引用类型
2. 每一项并没有可以标识的参数
3. push进的引用类型，即可能是数组，也可能是对象





#### 参考：

https://segmentfault.com/a/1190000013192950

