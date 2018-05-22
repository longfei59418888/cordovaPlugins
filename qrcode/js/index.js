/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
function createQRScanner(cordova) {
    // The native implementations should return their status as ['string':'string']
    // dictionaries. Boolean values are encoded to '0' and '1', respectively.
    function stringToBool(string) {
        switch (string) {
            case '1':
                return true;
            case '0':
                return false;
            default:
                throw new Error('QRScanner plugin returned an invalid boolean number-string: ' + string);
        }
    }

    // Converts the returned ['string':'string'] dictionary to a status object.
    function convertStatus(statusDictionary) {
        return {
            authorized: stringToBool(statusDictionary.authorized),
            denied: stringToBool(statusDictionary.denied),
            restricted: stringToBool(statusDictionary.restricted),
            prepared: stringToBool(statusDictionary.prepared),
            scanning: stringToBool(statusDictionary.scanning),
            previewing: stringToBool(statusDictionary.previewing),
            showing: stringToBool(statusDictionary.showing),
            lightEnabled: stringToBool(statusDictionary.lightEnabled),
            canOpenSettings: stringToBool(statusDictionary.canOpenSettings),
            canEnableLight: stringToBool(statusDictionary.canEnableLight),
            canChangeCamera: stringToBool(statusDictionary.canChangeCamera),
            currentCamera: parseInt(statusDictionary.currentCamera)
        };
    }

    // Simple utility method to ensure the background is transparent. Used by the
    // plugin to force re-rendering immediately after the native webview background
    // is made transparent.
    function clearBackground() {
        var body = document.body;
        if (body.style) {
            body.style.backgroundColor = 'rgba(0,0,0,0.01)';
            body.style.backgroundImage = '';
            setTimeout(function () {
                body.style.backgroundColor = 'transparent';
            }, 1);
            if (body.parentNode && body.parentNode.style) {
                body.parentNode.style.backgroundColor = 'transparent';
                body.parentNode.style.backgroundImage = '';
            }
        }
    }

    function errorCallback(callback) {
        if (!callback) {
            return null;
        }
        return function (error) {
            var errorCode = parseInt(error);
            var QRScannerError = {};
            switch (errorCode) {
                case 0:
                    QRScannerError = {
                        name: 'UNEXPECTED_ERROR',
                        code: 0,
                        _message: 'QRScanner experienced an unexpected error.'
                    };
                    break;
                case 1:
                    QRScannerError = {
                        name: 'CAMERA_ACCESS_DENIED',
                        code: 1,
                        _message: 'The user denied camera access.'
                    };
                    break;
                case 2:
                    QRScannerError = {
                        name: 'CAMERA_ACCESS_RESTRICTED',
                        code: 2,
                        _message: 'Camera access is restricted.'
                    };
                    break;
                case 3:
                    QRScannerError = {
                        name: 'BACK_CAMERA_UNAVAILABLE',
                        code: 3,
                        _message: 'The back camera is unavailable.'
                    };
                    break;
                case 4:
                    QRScannerError = {
                        name: 'FRONT_CAMERA_UNAVAILABLE',
                        code: 4,
                        _message: 'The front camera is unavailable.'
                    };
                    break;
                case 5:
                    QRScannerError = {
                        name: 'CAMERA_UNAVAILABLE',
                        code: 5,
                        _message: 'The camera is unavailable.'
                    };
                    break;
                case 6:
                    QRScannerError = {
                        name: 'SCAN_CANCELED',
                        code: 6,
                        _message: 'Scan was canceled.'
                    };
                    break;
                case 7:
                    QRScannerError = {
                        name: 'LIGHT_UNAVAILABLE',
                        code: 7,
                        _message: 'The device light is unavailable.'
                    };
                    break;
                case 8:
                    // Open settings is only available on iOS 8.0+.
                    QRScannerError = {
                        name: 'OPEN_SETTINGS_UNAVAILABLE',
                        code: 8,
                        _message: 'The device is unable to open settings.'
                    };
                    break;
                default:
                    QRScannerError = {
                        name: 'UNEXPECTED_ERROR',
                        code: 0,
                        _message: 'QRScanner returned an invalid error code.'
                    };
                    break;
            }
            callback(QRScannerError);
        };
    }

    function successCallback(callback) {
        if (!callback) {
            return null;
        }
        return function (statusDict) {
            callback(null, convertStatus(statusDict));
        };
    }

    function doneCallback(callback, clear) {
        if (!callback) {
            return null;
        }
        return function (statusDict) {
            if (clear) {
                clearBackground();
            }
            callback(convertStatus(statusDict));
        };
    }

    return {
        prepare: function (callback) {
            cordova.exec(successCallback(callback), errorCallback(callback), 'QRScanner', 'prepare', []);
        },
        destroy: function (callback) {
            cordova.exec(doneCallback(callback, true), null, 'QRScanner', 'destroy', []);
        },
        scan: function (callback) {
            if (!callback) {
                throw new Error('No callback provided to scan method.');
            }
            var success = function (result) {
                callback(null, result);
            };
            cordova.exec(success, errorCallback(callback), 'QRScanner', 'scan', []);
        },
        cancelScan: function (callback) {
            cordova.exec(doneCallback(callback), null, 'QRScanner', 'cancelScan', []);
        },
        show: function (callback) {
            cordova.exec(doneCallback(callback, true), null, 'QRScanner', 'show', []);
        },
        hide: function (callback) {
            cordova.exec(doneCallback(callback, true), null, 'QRScanner', 'hide', []);
        },
        pausePreview: function (callback) {
            cordova.exec(doneCallback(callback), null, 'QRScanner', 'pausePreview', []);
        },
        resumePreview: function (callback) {
            cordova.exec(doneCallback(callback), null, 'QRScanner', 'resumePreview', []);
        },
        enableLight: function (callback) {
            cordova.exec(successCallback(callback), errorCallback(callback), 'QRScanner', 'enableLight', []);
        },
        disableLight: function (callback) {
            cordova.exec(successCallback(callback), errorCallback(callback), 'QRScanner', 'disableLight', []);
        },
        useCamera: function (index, callback) {
            cordova.exec(successCallback(callback), errorCallback(callback), 'QRScanner', 'useCamera', [index]);
        },
        useFrontCamera: function (callback) {
            var frontCamera = 1;
            if (callback) {
                this.useCamera(frontCamera, callback);
            } else {
                cordova.exec(null, null, 'QRScanner', 'useCamera', [frontCamera]);
            }
        },
        useBackCamera: function (callback) {
            var backCamera = 0;
            if (callback) {
                this.useCamera(backCamera, callback);
            } else {
                cordova.exec(null, null, 'QRScanner', 'useCamera', [backCamera]);
            }
        },
        openSettings: function (callback) {
            if (callback) {
                cordova.exec(successCallback(callback), errorCallback(callback), 'QRScanner', 'openSettings', []);
            } else {
                cordova.exec(null, null, 'QRScanner', 'openSettings', []);
            }
        },
        getStatus: function (callback) {
            if (!callback) {
                throw new Error('No callback provided to getStatus method.');
            }
            cordova.exec(doneCallback(callback), null, 'QRScanner', 'getStatus', []);
        }
    };
}

var app = {
    // Application Constructor
    initialize: function () {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function () {
        document.getElementById('test').onclick = function () {
            var QRScanner = createQRScanner(cordova),light=false,front=false;
            QRScanner.prepare(function (err, status) {
                if (err) {
                    alert(err._message);
                } else {
                    if (status.authorized) {
                        console.log('允许调用摄像头..')
                    } else if (status.denied) {
                        console.log('拒绝调用摄像头..')
                    } else {
                    }
                }
            })
            document.getElementById('shandian').onclick=function () {
                if(!light){
                    QRScanner.enableLight(function(err, status){
                        err && console.error(err);
                        console.log(status);
                    });
                    light = true
                }else {
                    QRScanner.disableLight(function(err, status){
                        err && console.error(err);
                        console.log(status);
                    })
                    light = false
                }
            }
            document.getElementById('shandian').onclick=function () {
                if(!front){
                    QRScanner.useFrontCamera(function(err, status){
                        err && console.error(err);
                        console.log(status);
                    });
                    front = true
                }else {
                    QRScanner.useBackCamera(function(err, status){
                        err && console.error(err);
                        console.log(status);
                    });
                    front = false
                }
            }
            QRScanner.cancelScan(function(status){console.log(status);});
            QRScanner.scan(function (err, content) {
                if (err) {
                    console.log(err._message);
                }
                alert('The QR Code contains: ' + content);
                QRScanner.hide(function(status){
                    console.log(status);
                });
                QRScanner.destroy(function(status){
                    console.log(status);
                });
            });
            QRScanner.show(function(status){
                console.log(status);
            });
        }

        this.receivedEvent('deviceready');
    },

    // Update DOM on a Received Event
    receivedEvent: function (id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

app.initialize();