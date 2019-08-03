


弊端：

1. JSON不支持NaN，Infinity，甚至精确的浮点数，更别说循环引用和function了

无法处理循环对象


```
const x = {};
const y = {x};
x.y = y; // Cycle: x.y.x.y.x.y.x.y.x...
const copy = JSON.parse(JSON.stringify(x)); // throws!
```

2. 像Maps, Sets, RegExps, Dates, ArrayBuffers和其他内置对象序列化可能存在问题。比如Date序列化后再反序列化回来就变成字符串了，而不是Date对象。

