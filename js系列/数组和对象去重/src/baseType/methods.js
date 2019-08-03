


// 借助 js内置的indexOf 进行去重
function indexOfUniq(arr) {
    let result = [];
    // 在for循环中，提前存起len = arr.length，以防在处理数组过程中，数组长度被修改
    for (let i = 0, len = arr.length; i < len; i++) {
        // 用indexOf 简化了二层循环的流程
        if (result.indexOf(arr[i]) === -1) result.push(arr[i]);
    }
    return result;
}

// 借助 js内置的includes 进行去重
function includesUniq(arr) {
    let result = [];
    for (let i = 0, len = arr.length; i < len; i++) {
        // 因为indexOf是es3的，includes是es6的，indexOf对IE的兼容性会比includes好,项目要兼容IE的话，最好配合使用babel
        if (!result.includes(arr[i])) result.push(arr[i]);
    }
    return result;
}

// 排序后前后比对去重
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

// 通过hashTable去重
function hashUniq(arr) {
    let hashTable = arr.reduce((result, curr, index, array) => {
        result[curr] = true;
        return result;
    }, {})
    return Object.keys(hashTable).map(item => parseInt(item, 10));
}

// ES6 SET一行代码实现去重
function toSetUniq(arr) {
    return [...new Set(arr)];
}

