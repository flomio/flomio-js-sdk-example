import { Session, IReader, ITag } from '../flomio-js-sdk-bundle'

const session = new Session()
session.on('reader', async (reader: IReader) => {
  reader.on('error', (err: Error) => {
    console.log(`An error occurred`, err);
  });

  reader.on('scan', async (tag: ITag) => {
    console.log(JSON.stringify(await tag.readNdef()))
  })
})