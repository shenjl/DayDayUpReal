﻿//变量
var i = 'I am a string';
console.log('变量：', i);

//数组
var arr = [1, 2, 3, 4, 5];
console.log('数组：', arr);

//对象
var obj1 = {
    key1: 'value1',
    key2: 'value2',
    key3: 'value3'
};
var obj2 = {
    key6: 'value4',
    key5: 'value5',
    key4: 'value6'
};
var obj3 = {
    key9: 'value7',
    key8: 'value8',
    key7: 'value9'
};

console.log('对象：', obj1);
//对象数组
var objArr1 = [obj1, obj2, obj3];
var objArr2 = [[obj1], [obj2], [obj3]];

console.log('对象数组1：', objArr1);
console.log('对象数组1：', objArr2);
