// Avoid `console` errors in browsers that lack a console.
(function() {
  var method;
  var noop = function () {};
  var methods = [
      'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
      'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
      'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
      'timeline', 'timelineEnd', 'timeStamp', 'trace', 'warn'
  ];
  var length = methods.length;
  var console = (window.console = window.console || {});

  while (length--) {
      method = methods[length];

      // Only stub undefined methods.
      if (!console[method]) {
          console[method] = noop;
      }
  }
}());

//the global transfer object that is used for uploading
var transferObject = null;

// Set to false to use native HTTP for transfers; true to use Signiant App
var useSigniantApp = true;

/**
 * Callback for failure call of Signiant.Mst.initialize()
 * 
 * @return null
*/
var failureCallback = function () {
  /* Launch the Signiant installer widget into the 'mainContent' div. */
  var installWidget = new Signiant.Mst.SigAppInstallWidget('mainContent', {
    dismissInstallAppCallback: checkForSigniant.bind(self, 'false'), //called when the user clicks "I have the app" in the install widget
    installAppCompleteCallback: initializeUploadObject, //called when the app install is verified
    transferWithoutAppCallback: function () {
      setUseSigniantApp(false);
      initializeUploadObject();
    }
  });
  installWidget.showInstallerWindow(); 
}

/**
 * Set the global useSigniantApp flag.
 */
function setUseSigniantApp(useApp) {
    useSigniantApp = useApp;
}

/**
 * Check for the plugin. This is the first method to be called on document load (see last function below).
 * On success, call initializeUploadObject. If the plugin doesn't load, call pluginNotLoaded
 * 
 * @return null
*/
function checkForSigniant(failQuick) {
  console.log("Check for Signiant App");
  Signiant.Mst.configure({
    networkConnectivityErrorCallback: networkConnectivityErrorCallback,
    appCommunicationErrorCallback: appCommunicationErrorCallback,
    networkConnectivityRestoredCallback: networkConnectivityRestoredCallback
  });

  /* 
  You can call detectPlugin or the Signiant.Mst.initialize method below.
  detectPlugin provides default functionality that is easier to implement.
  Signiant.Mst.initialize allows you to override what happens if the app is not loaded (failureCallback)
  */
  // detectPlugin({success:initializeUploadObject, error:appNotLoaded});

  Signiant.Mst.initialize(initializeUploadObject, failureCallback, {
    timeout: 10000, // how long initialize will take to timeout, default: 1 second
    withAppTimeout: 20000, // how long initialize will take to timeout if we have detected cookie that signals the app is intalled, default: 5 seconds
    failPreemptivelyIfAppNotInstalled: failQuick // call error right away if cookie not present, default: true
  });
}

/**
 * The Signiant App couldn't be loaded - display an error message
 *
 * @return null
*/
function appNotLoaded(){
  alert("Signiant App Failed to load. This demo will not work.");
}

/**
 * Setup the upload object - the global var transferObject
 *
 * @return null
*/
function initializeUploadObject(){
  //update the bucket display to show the items currently in the bucket.  
  updateBucket(); 

  //create a new upload Object
  transferObject = useSigniantApp ? new Signiant.Mst.Upload() : new Signiant.Mst.NoSoftware.Upload();
  //set the default server
  transferObject.setServer(defaultServer);
  //the following methods are self explanatory
  transferObject.subscribeForTransferErrors(transferErrors);
  transferObject.subscribeForBasicEvents(transferEvents);
  transferObject.subscribeForTransferProgress(transferProgressCallback);
  //setup the storage config options to upload to the right S3 bucket
  if(configId){
    transferObject.setSignature(globalSignature);
    transferObject.setStorageConfig('{"configId":"'+configId+'", "signature":"'+globalSignature+'"}');
  } else {
    transferObject.setStorageConfig('{"access-key":"'+amazonS3Key+'", "secret-key":"'+amazonS3Secret+'", "bucket":"'+amazonS3Bucket+'"}');
  } 
  //send the server the API key
  transferObject.setApiKey(apiKey); //required
  transferObject.setProbeLB(true); //always set to true for Flight
}

// This will be called when the Transfer API detects network loss (will not throw if only changing networks)
// The Signiant App should recover and continue transfer if network timeout is < 1 minute
function networkConnectivityErrorCallback () {
  console.log("Network Connectivity Loss Detected");
  alert("Network Loss Detected, Waiting for Restore");
}

// This will be called when the Transfer API detects network connectivity is restored
// The Signiant App should recover and continue transfer
function networkConnectivityRestoredCallback () {
  console.log("Network Connectivity Restored");
  alert("Network Connectivity Restored");
  if ( transferObject === 'undefined' ){
    alert("transfer object undefined")
  } else {
    if ( transferObject.currentTransferState == Signiant.Mst.transferState.TRANSFERRING ){
      alert("state == TRANSFERRING")
    } else {
      alert("state != TRANSFERRING")
    }
  }
}

// The Signiant App would have cancelled any running transfers if this callback is fired
function appCommunicationErrorCallback () {
  console.log("Connection to Signiant App Lost");
  alert("Your connection has been lost. Press launch application on the next dialog.")
  reInitializeApp();
}

/* Called in response to success initialize on Signiant.mst.initialize */
function reIntializeSuccess() {
  console.log("Connection to Signiant App Re-established");
  alert("Connection to Signiant App Re-established");
  if ( transferObject !== 'undefined' ){
    console.log("Checking to restart transfer");
    // check and see if transfer was running, if so restart transfer
    // we could send a cancel as well at this point to ensure the previous transfer was cancelled
    // but Signiant App will cancel transfers when communication with Browser lost for significant period of time
    if ( transferObject.currentTransferState == Signiant.Mst.transferState.TRANSFERRING ){
      console.log("Restarting Transfer");
      alert("Restarting Transfer in Progress");
      // Set back to IDLE, pending this being tracked in Transfer API
      transferObject.currentTransferState = Signiant.Mst.transferState.IDLE;
      transferObject.startUpload();
    }
  }
}

/* Called in response to failure to initialize on Signiant.mst.initialize */
function reInitializeFailure() {
  console.log("Re-Initialize Signiant App Failed, retrying");
  alert("Signiant App Connection Lost, Retrying...");
  reInitializeApp();
}		

/* Timeout is time to wait for app to respond to new session request. We suggest 20 seconds, but you may want to lower this. If the timer completes and no message is received, reInitializeFailure will fire  */
function reInitializeApp() {
  console.log("Attempt Re Initialize Connection to Signiant");
  var options = { "timeout" : 20000 };
  Signiant.Mst.initialize(reIntializeSuccess, reInitializeFailure, options);
}

function appErrorFailure(){
  alert("Transfer API Failed to load. Transfer Services will not be available.");
}


/**
   * Open the file selection dialog, and call callbackUpload when it closes.
   *
   * @return null
*/
function chooseFiles() {
  try {
    transferObject.chooseUploadFiles( callbackUpload );
  } catch (exception) {
    alert("Unable to open the file selector: " + exception);
  }
}

/**
 * Callback when the file picker is closed. 
 *
 * @return null
*/
var callbackUpload = function(event,selectedFiles) {
  if(configId) { 
    transferObject.setStorageConfig('{"configId":"'+configId+'", "signature":"'+globalSignature+'"}');
  }
  var filesArray = new Array();
  for (var i = 0; i < selectedFiles.length; i++) {
    filesArray.push(selectedFiles[i].path);
  }
  //set the files to upload on the transfer object
  transferObject.setFilesToUpload(filesArray);
  //optionally set the subfolder for the files to go into (eg. "/folder1/folder2/folder3")
  transferObject.setSubFolder(destinationFolderPath);

  //optionally rename the file when it is uploaded.
  //transferObject.setTargetFileName(destinationFolderPath);
  //start the upload
  transferObject.startUpload();
  properties = transferObject.getTransferProperties();
  //modify the UI
  $("#contentUploadText").html("Starting upload...");
  $("#contentListing").fadeTo(1000, 0.3);
  $("#contentUpload").on('click', cancelTransfer);
}

/**
 * Display progress of upload (doesn't work on download at the moment.)
 *
 * @return null
*/
function transferProgressCallback(transferObject, numBytesSent, numBytesTotal, estimatedTimeRemaining) {
  var percent = Math.round((numBytesSent/numBytesTotal)*100);
  $("#contentUploadText").html(percent+"% completed.<p>Completes in about "+moment.duration(estimatedTimeRemaining*1000).humanize()+"</p>");
}

/**
 * Log errors to the JavaScript console.
 *
 * @return null
*/
function transferErrors (transferObject, eventCode, eventMsg, propertyName){
  console.log("Sample Upload Transfer Error " + eventCode + ", " + eventMsg);
}

/**
 * Display feedback to the user depending on what events are returned
 *
 * @return null
*/
function transferEvents ( transferObject, eventCode, eventMsg, eventData ) {
  console.log("Sample Upload Transfer Event " + eventCode + ", " + eventMsg);
  var message = eventMsg;			
  switch(eventCode) {
    case "TRANSFER_STARTED":
      $("#uploadFileChooser").attr("class","icon-completed");
    break;

    case "TRANSFER_CANCEL_EVENT":
    case "TRANSFER_COMPLETED":
      transferObject.clearAllFiles();
      setTimeout(function() {updateBucket()},900); 
    break;

    case "TRANSFER_ERROR_EVENT":
      transferObject.clearAllFiles();
      $("#contentUploadText").html("Upload something...");
      $("#uploadFileChooser").attr("class","icon-add");
      $("#contentListing").fadeTo(1000, 1);
      $("#contentUpload").unbind('click');
      $("#contentUpload").click(chooseFiles);
    break;

    default:
      return
  }
}

/**
 * Gracefully cancel the upload or download
 *
 * @return null
*/
function cancelTransfer() {
  $("#contentUploadText").html("Cancelling upload<p>This will take a few seconds.");
  console.log("Cancel Upload files");
  try {
    transferObject.cancel();
  } catch (exception) {
    console.log("Exception in Cancel Upload Files");
    console.log(exception);
  }
}

/**
 * Download a file from the cloud.
 *
 * @param {String} fileName The complete name of the file to download from S3 (can also be a "directory")
 * @return null
*/
function downloadFile(fileName) {
  //create a new download Object
  var download = useSigniantApp ? new Signiant.Mst.Download() : new Signiant.Mst.NoSoftware.Download();
  //set the download server
  download.setServer(defaultServer);
  //set the apikey for downloading
  download.setApiKey(apiKey); //required
  //set the storage configuration
  if(configId){
      download.setSignature(globalSignature);
      download.setStorageConfig('{"configId":"'+configId+'", "signature":"'+globalSignature+'"}');
  } else {
      download.setStorageConfig('{"access-key":"'+amazonS3Key+'", "secret-key":"'+amazonS3Secret+'", "bucket":"'+amazonS3Bucket+'"}');
  }
  //set the probeLB (probe load balancer) to true (always true for Flight).
  download.setProbeLB(true);
  download.setFilePathHandlingMode(Signiant.Mst.Transfer.filePathModePath);
  download.setFileCollisionHandlingMode(Signiant.Mst.Transfer.fileCollisionModeVersion);
  //set the files to download to the file that is passed
  //note that if you're downloading a directory, "fileName" can't end in a slash - make it just the directory name
  if (fileName.substring(fileName.length-1) == "/")
  {
    fileName = fileName.substring(0, fileName.length-1);
  }
  download.setFilesToDownload(new Array(fileName));
  download.subscribeForTransferErrors(transferErrors);
  download.subscribeForBasicEvents(transferEvents);
  download.subscribeForTransferProgress(transferProgressCallback);

  //open the file picker so the user selects where to save the file.
  download.chooseDownloadFolder( function(message, folder) {
    //set the download folder to what they set
    download.setDownloadFolder(folder);
    //double check that we actually set the files by calling getFiles on the download object instead of using the fileName that as passed
    selectedFiles = download.getFiles(); 
    if (selectedFiles.length == 0)
      alert("No files Selected for Download");
    else{
      //do the download
      download.startDownload();
    }
  });
}

/**
 * Updates the bucket display with files and directories from the configured S3 bucket.
 *
 * @param {String} prefixToUse The current prefix (eg. /temp1/temp2)
 * @return null
*/
function updateBucket(prefixToUse) {
  var thisPrefix = typeof prefixToUse !== 'undefined' ? prefixToUse : "";

  //upload into the currently selected directory
  destinationFolderPath = thisPrefix;

  var textToAppend = "";

  $("#refreshIcon").addClass("fa-spin");
  $('#objects').children().fadeOut(500).promise().then(function() {
    $("#contentUpload").unbind('click');
    $("#contentUpload").click(chooseFiles);
    var bucket = new AWS.S3({params: {Bucket: amazonS3Bucket}});
    bucket.listObjects({Delimiter: "/", Prefix: thisPrefix}, function (err, data) {
      if (err) {
        document.getElementById('objects').innerHTML =
        'Could not load objects from cloud storage. Check your credentials and <a href="http://docs.aws.amazon.com/AmazonS3/latest/dev/cors.html">ensure CORS is setup properly</a>. Error was <i>'+err+'</i>';
      } else {
        data.Contents.sort();
        $("#objects").fadeOut(500).promise().then(function() {
          $("#objects").empty();
          if( data.Contents.length == 0) {
            $("#objects").html("No files in cloud storage right now. Why not upload one?");
          }

          if( thisPrefix != "" ) {
            textToAppend = '<div class="row"><div class="cell"><i class="fa fa-folder-o"></i></div><div class="cell"><a href=# onclick="updateBucket(\'\')">< To Bucket Top</a></div></div>';
          }

          for (var i = 0; i < data.CommonPrefixes.length; i++) {
            textToAppend += '<div class="row"><div class="cell"><i class="fa fa-folder-o"></i></div><div class="cell"><a href=# onclick="downloadFile(\''+data.CommonPrefixes[i].Prefix+'\')">'+data.CommonPrefixes[i].Prefix+'</a></div></div>';
          }

          for (var i = 0; i < data.Contents.length; i++) {
            textToAppend += '<div class="row"><div class="cell"><i class="fa fa-file-o"></i></a></div>';
            textToAppend += '<div class="cell"><a href=# onclick="downloadFile(\''+data.Contents[i].Key+'\')">'+data.Contents[i].Key.substr(thisPrefix.length)+'</a></div><div class="cell"><span class="date">' + moment(data.Contents[i].LastModified).format("YYYY-MM-DD HH:mm")+'</span></div><div class="cell"><span class="date">' + humanize.filesize(data.Contents[i].Size) +'</span></div></div>'

          }
          $("#objects").append(textToAppend);

          $("#objects").fadeIn(500).promise().then(function() {
            $("#refreshIcon").removeClass("fa-spin");
            $("#contentListing").fadeTo(1000, 1);
            $("#contentUploadText").html("Upload something...");
            $("#uploadFileChooser").attr("class","icon-add");
          });   
        });
      }
    });
  });
}

/**
 * Checks ports and firewall settings
 * 
 * @return null
*/
function checkPortsAndFirewall() {
  checkPort('https://developer.mediashuttle.com:443', $('#signiant_license_status'));
  checkPort('https://pubsub.pubnub.com/subscribe/demo/hello_world/0/0:443', $('#signiant_messaging_status'));
  checkPort('http://portquiz.net:49221', $('#signiant_49221_status'))
}

/**
 * Checks ports and firewall settings
 * 
 * @return null
*/
function checkPort(url, elementToUpdate) {
  $.ajax({
    url: url,
    type: "get",
    cache: false,
    dataType: 'jsonp', // it is for supporting crossdomain
    crossDomain : true,
    asynchronous : false,
    jsonpCallback: 'deadCode',
    timeout : 1500, // set a timeout in milliseconds
    complete : function(xhr, responseText, thrownError) {
      if(xhr.status == "200") {
       elementToUpdate.html("Success");
      }
      else {
       elementToUpdate.html("Failure");
      }
    }
 });
}