const flomio = require('../flomio-js-sdk-bundle')

const session = new flomio.Session()
let thisReader
session.on('reader', async (reader) => {
  logProps(session)
  reader.on('error', err => {
    console.log(`${reader.reader.name}  an error occurred`, err);
  });
  thisReader = reader
})

session.on('scan', async (tag) => {
  // console.log(JSON.stringify(await tag.readNdef()))
  // logProps(tag)
  // const response = await tag.sendAPDU('FFCA000000')
  // logProps(response)
  const command = thisReader.exchangeAPDU('FFCA000000')
  logProps(command)
  logProps(await command.response)
  // console.log(JSON.stringify(await tag.readNdef()))
  // const message = await tag.readNdef()
  // for (var record of message) {
  //   console.log('hello')
  //   console.log(record.payload)
  //   // console.log(JSON.stringify(record))
  //   logProps(record)
  // }
  
})

function logProps(object) {
  for(var propName in object) {
    propValue = object[propName]
    console.log(propName,propValue);
  }

}
