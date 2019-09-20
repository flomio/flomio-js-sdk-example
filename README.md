# Flomio-JS-SDK-Example

A Javascript SDK to control your FloBLE via PCSC 

## Contents

* [Installation](#installation)
* [Example](#example)
* [API](#api)
  - [Class: Session](#Session)
      - [Properties](#properties)
      - [Events](#events)
        - [Event:  'reader'](#event--reader)
        - [Event:  'tag'](#event--tag)
        - [Event:  'error'](#event--error)
  - [Class: Reader](#Reader)
      - [Properties](#properties-1)
      - [Methods](#methods-1)
  - [Class: Tag](#Tag)
      - [Properties](#properties-2)
      - [Methods](#methods-2)
  - [NDEF](#ndef)
    - [Class: Record](#record)
    - [Class: Message](#message)
    
# Installation

> **Requirements:** **Node.js 8+**

Clone this repo, and within it, run:
`npm install`

# Example

Connect your FloBLE in USB mode and run:
`node examples/example.js`

Example.js:
```javascript
const flomio = require('./flomio-js-sdk-bundle')

const session = new flomio.Session()
session.on('reader', async (reader) => {
  reader.on('error', err => {
    console.log(`An error occurred`, err);
  });
}))
session.on('tag', async (tag) => {
  console.log(JSON.stringify(await tag.readNdef()))
})

```

# API

## **Session**

An object which manages the lifecycle of connected readers and scanned tags. 

```javascript
  const session = new flomio.Session()
```

### **Parameters**
- connectionMode:(Optional) Sets the internal PCSC `connectionMode`. See [here](https://pcsclite.apdu.fr/api/group__API.html#ga4e515829752e0a8dbc4d630696a8d6a5). 
Default: `shared`. Possible values: `shared` | `direct` | `exclusive`

### **Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| readers | `array` | `[]` | An array of [Reader](#Reader) objects, which changes as readers connect/disconnect |


### **Events**

A `Session` object is an EventEmitter which triggers events when [Reader](#Reader)s are connected or [Tag](#Tag)s are scanned.

#### Event:  'reader'

* *reader* [Reader](#reader). A connection event which returns a Reader object associated with a detected FloBLE. This will only happen if the device is a registered Flomio reader.

#### Event:  'tag'

* *tag* [Tag](#Tag). A scan event which returns a Tag object associated with a scanned NFC tag. 

#### Event:  'error'

* *err* `Error Object`. An error has occured with the reader.

## **Reader**

An object to manually control your FloBLE device. This is returned from the Session [reader](#event--reader) event. 

```javascript
const session = new flomio.Session()
session.on('reader', async (reader) => {
  console.log(reader.name)
})
```

### **Properties** 

* *name*: The reader name
* *currentTag*: The currently present tag  

### **Methods**

#### **exchangeAPDU:** 
  Sends an APDU command to the reader.

```javascript
    const exchange = reader.exchangeAPDU('FFCA000000')
    console.log(exchange.command)
    const response = await exchange.response
    console.log(response.data)
```

#### *Parameters*
-  The APDU command in hexadecimal format (`string`|`Buffer`)..
#### *Returns*

A command-response pair with Promises for the asynchronous values.

```
command: { 
  encoded: Promise { <Buffer ff ca 00 00 00> },
  frame: { 
    data: <Buffer ff ca 00 00 00> 
  } 
}
response: Promise { 
  data: <Buffer 04 4d 58 b2 e3 25 80 90 00> 
}
```

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| command | `object` |  | The command that was sent. Use `exchange.command.frame.data` to get the raw `Buffer` |
| response | `Promise(object)` |  | A Promise of a `object` which contains a `data` property with the reponse. See above example on how to get the raw `Buffer`. |

If multiple exchange APDUs are sent, they are queued in FIFO order. See example under exchangeAPDU for usage.

#### **escapeCommand:**
  Sends an Escape command to control the reader. This is for more advanced users who would like to configure their device. 

#### *Parameters*
- The command in hexadecimal format (`string`|`Buffer`)..
#### *Returns*

Returns the same structure as [exchangeAPDU](#exchangeAPDU).

## **Tag**

An object which represents a physical tag that was scanned by your reader. You can use this object to read and write NDEF messages to the tag. 

```javascript
session.on('scan', async (tag) => {
  console.log(tag.uid)
})
```

### **Properties** 

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| uid | `string` |  | The unique ID of the tag. |
| atr | `string` |  | The Answer To Reset (ATR) of the tag. This can be used to determine the tag's manufacturer or issuer and other details. |
| type | `string` |  | The tag type. |
| typeHuman | `string` |  | A human readable string of the tag type. |

### **Methods**

#### **readNdef:**
  Attempts to read and parse the [NDEF](#NDEF) formatted data on the tag.

```javascript
session.on('scan', async (tag) => {
  const message = await tag.readNdef()
  for record of message {
    console.log(record.payload)
  }
})
```
 
#### *Parameters*
- onRecord:(Optional) An optional callback function which will return each NDEF record as they are read.

#### *Returns*
  A Promise of the NDEF [Message](#Message). 

#### **sendAPDU:** 
  Sends an APDU command to the tag.

```javascript
session.on('scan', async (tag) => {
  // Send a Get UID APDU
  const response = await tag.sendAPDU('FFCA000000')
  console.log(response.data)
})
```

#### *Parameters*
- APDU: The APDU command in hexadecimal format (`string`|`Buffer`)..
#### *Returns*

Returns a `Promise` of the following `object`:

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| data | `Buffer` |  | The response without the Status Word. |
| SW | `string` |  | The status word. |
| OK | `boolean` |  | Whether the operation was successful. |
| full | `Buffer` |  | The combination of `data` and `SW`. |

## **NDEF**

### **Message**

An Array that represents an NDEF (NFC Data Exchange Format) data message that contains one or more [Records](#Record).

### **Record**

Represents a NDEF (NFC Data Exchange Format) record as defined by the NDEF specification.

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| tnf | `number` |  | The Type Name Format field of the payload. |
| type | `Buffer or string` | | The type of the payload. |
| id | `Buffer` |  | The identifier of the payload |
| payload | `Buffer` |  | The data of the payload |
| value | `string?` |  | An optional convenience parameter which will return the payload as text for Text and URI records. |

