const TransferRecord = require('./src/serialization').models.TransferRecord

const tr = new TransferRecord({
  sender: '0x43aaDF3d5b44290385fe4193A1b13f15eF3A4FD5',
  recipient: '0xa12bcf1159aa01c739269391ae2d0be4037259f3',
  token: 1,
  start: 2,
  end: 3,
  block: 4
})

console.log(tr.encode())

/*
const tr2 = new TransferRecord('c8a5ba5868a5e9849962167b2f99b2040cee20310c8f2b984d13b7c3d6e7fca2e803f356481d1376000000000000000000000000000000000000000000000000000000640000000000000000000000000000000000000000000000000000000000000000')

console.log(tr2)

*/
