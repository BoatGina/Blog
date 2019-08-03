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

// hashTable 274
// sortUniq 456
// toSetUniq 36
// includesUniq 5520
// indexOfUniq 5805