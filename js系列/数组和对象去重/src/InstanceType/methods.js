
function CodeAtUniqObj (arr) {
    let result = []
    let Indexs = []
    const Jsons = [...new Set(arr.map(o => JSON.stringify(o)))]
    let Lens = Jsons.map((str) => {
        let len = 0
        for (let i = 0; i < str.length; i++) {
            len += str.charCodeAt(i)
        }
        return len
    })
    Lens.reduce((pre, cur, index, arr) => {
        if (!pre.includes(cur)) {
            pre.push(cur)
            Indexs.push(index)
        }
        return pre
    }, [])
    result = Jsons.reduce((pre, cur, index) => {
        if (Indexs.includes(index)) {
            pre.push(JSON.parse(cur))
        }
        return pre
    }, [])
    return result
}

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