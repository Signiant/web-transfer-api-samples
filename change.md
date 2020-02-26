# Transfer API Changes

The following is a list of changes made to the Transfer API:

### Transfer API v2.8.1 - July 25th, 2018
* Add functions for setting restarts and enabling multiport transfer capability.
* Bug fixes and optimizations.

### Transfer API v2.8.0 - April 18th, 2018
* Performance improvements.
* Bug fixes and optimizations.

### Transfer API v2.7.9 - April 5th, 2018

* Bug fixes and optimizations.

### Transfer API v2.7.8 - March 14th, 2018

* Added support for more efficient communication with Signiant App via WebSocket.

### Transfer API v2.7.7 - December 18th, 2017

* Improvements to user messages.

### Transfer API v2.7.6 - October 23rd, 2017

* Transfer performance improvements and bug fixes optimizations.

### Transfer API v2.7.4 - September 25th, 2017

* Improved UX for transfer interruptions and recovery.

### Transfer API v2.7.3 - June 7th, 2017

* Added support for encrypted messaging

### Transfer API v2.7.2 - June 7th, 2017

* Update to the installer widget for no-client software

### Transfer API v2.7.1 - June 7th, 2017

* Signiant App Installer update

### Transfer API v2.7.0 - May 24, 2017

* Added support for a backup messaging service for communication between the Transfer API and the Signiant App. This update provides a dual communication strategy and ensures constant high availability. Note: you must be using the latest version of the <a href="https://shuttle.support.signiant.com/customer/en/portal/articles/2469753-download-signiant-app">Signiant App</a>.

### Transfer API v2.6.6 - February 24, 2017

* Added the ability to enable manifest processing for transfers, allowing you to send manifests to a specified server.

### Transfer API v.2.6.5 - January 27, 2017

* Implemented a fix for setting/detecting the SigniantAppInstalled cookie.

### Transfer API v.2.6.4 - January 23, 2017

* Minor release that included the ability to provide a message to the failed transfer callback.

### Transfer API v2.6.3 - October 27, 2016

* Transfer API now allows transfers without installed software. Support for cloud storage only. See the Amazon sample code.

### Transfer API v2.6.1 & 2.6.2 - November, 2016

* Improvements to Google Analytics tracking

### Transfer API v2.6.0 - October 27, 2016

* Resolves an issue communicating with websites running HTTP 2.0.
* You can pass in an ID or a DOM element to the install widget
* Validates keys being set in encryption method

### Transfer API v2.5.7 - September 23, 2016

* Resolve an issue with Safari 10 not launching the Signiant app

### Transfer API v2.5 - January 2016

* Drag and drop is now supported with the drag and drop widget. Improved error handling when the browser cannot communicate with the app.

### TAPI v2.4 - December 2015

* Improved the reliability of the Transfer API.

### TAPI v2.3 - November 2015

* The transfer API will now install the Mac version of the Signiant App on Mac operating systems.

### TAPI v2.2 - October 22 2015

* Drag and drop support now enabled for use with the drag and drop widget.

# Known Issues in Transfer API v2

* setLogLevel() only enables server side logging
* File injection is currently not detected, associated events will not be generated
* Queued transfers currently do not generate an TRANSFER_QUEUED event

# Deprecated Methods in Transfer API v2

* isIEProtectedModeOn()
