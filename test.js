const TransferRecord = require('./src/serialization/serialization').TransferRecord

/*
const tr = new TransferRecord({
  sender: '0xc8a5ba5868a5e9849962167b2f99b2040cee2031',
  recipient: '0x0c8f2b984d13b7c3d6e7fca2e803f356481d1376',
  token: 0,
  start: 0,
  end: 100,
  block: 0
})

console.log(tr.encode())
*/

const tr2 = new TransferRecord('c8a5ba5868a5e9849962167b2f99b2040cee20310c8f2b984d13b7c3d6e7fca2e803f356481d1376000000000000000000000000000000000000000000000000000000640000000000000000000000000000000000000000000000000000000000000000')

console.log(tr2)
