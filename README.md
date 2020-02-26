# Getting Started

These samples to show how to integrate the Signiant Web Transfer API into a web application. The Signiant Web Transfer API supports transfers (upload and download) to / from:

* Amazon S3
* Microsoft Azure
* Local storage on your network

## Current Version

The current version of the transfer API is 2.8.1.

## API Key

You will require an API key to transfer files.

If you are transferring to local storage, you can get an API key from [developer.mediashuttle.com](https://developer.mediashuttle.com)

If you are transferring to cloud storage you can request one from [info.signiant.com](http://info.signiant.com/flight-Free-Trial_1.html)

## API Documentation

Visit [developer.signiant.com](http://developer.signiant.com) for up to date documentation about the Transfer API.

## Loading Transfer API

`<script type="text/javascript" src="https://updates.signiant.com/javascript-api/2.8.1/transferapi.min.js" ></script>`

Transfer API widgets are referenced by:

`<link rel="stylesheet" href="https://updates.signiant.com/javascript-api/2.8.1/widgets/transferProgress/mediashuttledownload.css">`

`<link rel="stylesheet" href="https://updates.signiant.com/javascript-api/2.8.1/widgets/transferProgress/mediashuttletransferprogress.css" >`

`<link rel="stylesheet" href="https://updates.signiant.com/javascript-api/2.8.1/widgets/draganddrop/mediashuttlednd.css">`

`<script src="https://updates.signiant.com/javascript-api/2.8.1/widgets/draganddrop/mediashuttlednd.js" type="text/javascript"></script>`

`<script src="https://updates.signiant.com/javascript-api/2.8.1/widgets/download/mediashuttledownload.js"></script>`

`<script src="https://updates.signiant.com/javascript-api/2.8.1/widgets/transferProgress/mediashuttletransferprogress.js"></script>`

The API Key is now provided to the Transfer Object directly, rather than through the `<script>` tag. To specify an API key to use for a transfer call the following method on an Upload or Download object:

```javascript
var upload = new Signiant.Mst.Upload();
upload.setApiKey('abc123');

var download = new Signiant.Mst.Download();
download.setApiKey('abc123');`
```

Note that this replaces the line:

```javascript
transferObject.setProperty(
  "com.signiant.interactivetransfer.engine.api_key",
  "YOUR_API_KEY"
);
```

that may be present in your code.

## Changes

### Transfer API v2.8.1 - July 25th, 2018
* Add functions for setting restarts and enabling multiport transfer capability.
* Bug fixes and optimizations.

See [Transfer API Changes](change.md) for earlier Transfer API changes.

## Security

Signiant Web Transfer API customers using cloud storage have the ability to generate their own API keys and increase security through the use of signatures.

Customers generate API keys and secrets using [manage.signiant.com](https://manage.signiant.com)

Use the secret and key to generate a signature. Use the signature to secure requests to Web Transfer API using cloud storage. "signature_generators" contains sample code to show how to generate a signature using a variety of languages.
