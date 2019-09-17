import * as events from 'events'

export class Session {
  constructor (options?: { connectionMode?: ConnectionModeType })
  readers: [IReader]
  on(event: "reader", listener: (reader: IReader) => void): this
  on(event: "error", listener: (error: string | Error) => void): this
  on(event: "scan", listener: (tag: ITag) => void): this
}

export interface ITag {
  type: string
  typeHuman: string
  uid: string
  atr: string
  sendAPDU (apdu: string | Buffer): Promise<IAPDUResponse>
  readNdef (onRecord?: (record: IRecord) => boolean): Promise<IMessage>
  writeNdef (message: IMessage): Promise<void>
}

export interface IRecord {
  tnf: number
  type: string,
  id: Buffer,
  payload: Buffer,
  value?: string
}

export type IMessage = Array<IRecord>

export interface IFrame {
  data: Buffer

  messageType?: number
  sequence?: number,
  slot?: number,
  param?: number,
}

export interface IAPDUResponse {
  data: Buffer
  SW: string
  OK: boolean
  full: Buffer
  responseFrame (): IFrame
  commandFrame (): IFrame
}

export interface ICapabilityContainerT2 {
  version: string,
  dataLength: number,
  readable: boolean,
  writable: boolean
}

export interface ICapabilityContainerT4 {
  maxResponseDataLength: number,
  maxCommandDataLength: number,
  ndefFileID: number,
  maxNdefSize: number
}

export interface ICommand {
  frame: IFrame,
  encoded: Promise<Buffer>
}

export interface IQueuedCommand {
  command: ICommand,
  response: Promise<IFrame>
}

export interface IReader extends events.EventEmitter {
  name: string
  currentTag (): ITag
  exchangeAPDU (buffer: Buffer | string): IQueuedCommand
  escapeCommand (buffer: Buffer | string): IQueuedCommand
  close(): void
}

export type ConnectionModeType = 'shared' | 'direct' | 'exclusive'

export interface IType4Tag extends ITag {
  selectApplication (applicationId: Buffer): Promise<IAPDUResponse>
  selectFile (fileId: number): Promise<IAPDUResponse>
  readBinary (numBytes: number, offset: number): Promise<IAPDUResponse>
  readCC (): Promise<ICapabilityContainerT4>
  writeNdef (message: IMessage): Promise<void>
  updateBinary (data: Buffer, offset: number): Promise<IAPDUResponse>
  readNdef (onRecord?: (record: IRecord) => boolean): Promise<IMessage>
  selectNdef (): Promise<IAPDUResponse>
  select (apduHeader: string, selection: Buffer): Promise<IAPDUResponse>
}

export interface IType2Tag extends ITag {
  writePage (page: number, data: Buffer, pad?: boolean): Promise<IAPDUResponse>
  readPages (startPage: number, numPages: number, attempts?: number | 1): Promise<IAPDUResponse>
  readCCPage (): Promise<IAPDUResponse>
  userData (onData?: (buf: Buffer) => boolean): Promise<Buffer>
  readCC (): Promise<ICapabilityContainerT2>
  userPages (): Promise<number>
}
