

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

member2.introduce.mycall(member1)