//Copyright 2016 Jackie Scholl
/*global AWS*/
var base64 = require('base64-js');
var resolveConflict = require('./resolve-conflict.js');

function CognitoStorage(logins, allowAnonymous, onUpdateCallback) {
  this._debug_logins = logins;
  this.onUpdateCallback = onUpdateCallback || (() => {});
  console.assert(logins);
  console.log('creating new CognitoStorage instance');
  if (!logins) {
    alert('err! trying to set up but logins falsey; logins='+logins);
    throw new Error('err! trying to set up but logins falsey; logins='+logins);
  } else {
    if (!allowAnonymous) {
      console.assert(logins['accounts.google.com'] !== undefined, JSON.stringify(logins));
    } else {
      throw new Error('allowing anonymous');
    }
    this.setup(logins);
  }
}

/*const getInitialState = function() {
  console.log('window.location.hash: '+window.location.hash);
  const h = window.location.hash;
  const contractId = h? h.slice(1) : null;
  const contractDataset = null;
  return {contractId: contractId, contractDataset: null, contractMap: new Map(), logins: {}};
};*/

CognitoStorage.prototype.setup = function(logins, callback) {
  callback = callback || (()=>{});
  console.log('running Cognito setup; logins:');
  console.log(logins);
  //this.setState({logins: logins});
  // Initialize the Amazon Cognito credentials provider
  AWS.config.logger = console;
  AWS.config.region = 'us-east-1'; // Region
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'us-east-1:a09f9758-c1f2-44c1-a3c8-185219e42c99',
    Logins: logins
  });
  console.log('AWS config set');
  AWS.config.credentials.get(function(){
    console.log('thing opened');
    const syncClient = new AWS.CognitoSyncManager();
    syncClient.openOrCreateDataset('contracts', function(err, dataset) {
      console.log('dataset opened');
      if (err) {
        console.log('could not open or create dataset; err '+err);
      } else {
        console.log('dataset opened');
        //this.setState({contractDataset: dataset});
        console.assert(dataset);
        this.dataset = dataset;
        this.updateContractMap();
        callback();
      }
    }.bind(this));
  }.bind(this));
};

CognitoStorage.prototype.sync = function() {
  console.log('running cognito sync operation');
  console.log(this);
  console.assert(this.dataset);
  console.log('assert done');
  if (!this.dataset) {
    console.log('dataset is null! oh noes!');
  } else {
    //alert('oh, no no no! we\'re not paying for real sync yet');
    console.log('Warning! We\'re running a sync operation, which costs money');
    this.dataset.synchronize({
      onFailure: (err) => {
        console.log('err!'); console.log(err);
      },
      onSuccess: (dataset, newRecords) => {
        console.log('success!');
        console.log(dataset);
        console.log(newRecords);
        console.log('this: ');
        console.log(this);
        this.updateContractMap();
      },
      onConflict: (dataset, conflicts, callback) => {
        const resolved = [];
        let continueMerge = true;

        for (let i=0; i<conflicts.length; i++) {
          try {
            resolved.push(resolveConflict.resolve(conflicts[i]));
          } catch (exception) {
            if (exception === resolveConflict.CANNOT_RESOLVE) {
              continueMerge = false;
              console.log('CANNOT_MERGE thrown; merge canceled');
            } else {
              throw exception;
            }
          }
        }

        if (continueMerge) {
          dataset.resolve(resolved, function() {
            return callback(true);
          });
        } else {
          // callback false to stop the synchronization process.
          return callback(false);
        }
      },

      onDatasetDeleted: function(dataset, datasetName, callback) {
        console.log('oh no! remote dataset deleted!');
        console.log('dataset named '+datasetName);
        console.log(dataset);
        // Return true to delete the local copy of the dataset.
        // Return false to handle deleted datasets outsid ethe synchronization callback.
        //return callback(true);
        return callback(false);
      },

      onDatasetMerged: function(dataset, datasetNames, callback) {
        console.log('oh no! dataset merged!');
        // Return true to continue the synchronization process.
        // Return false to handle dataset merges outside the synchroniziation callback.
        return callback(false);
        //return callback(true);
      }
    });
  }
};

CognitoStorage.prototype.updateContractMap = function() {
  console.log('updating contract map');

  console.assert(this.dataset);
  if (!this.dataset) {
    alert('something went wrong; updateContractMap called but dataset does not exist');
  } else {
    this.dataset.getAll((err, map) => {
      if (err) {
        console.log(err);
        throw new Error('error getting contracts');
      } else {
        const objectMap = new Map();
        for (var x in map) {
          if (map.hasOwnProperty(x) && map[x]) {
            if (x == '') {
              console.log('uh oh, very bad value');
              console.log(x);
              console.log(map[x]);
            } else {
              objectMap.set(x, JSON.parse(map[x]));
            }
          }
        }
        //this.setState({contractMap: objectMap});
        this.contractMap = objectMap;
        this.onUpdateCallback(objectMap);
      }
    });
  }
};

CognitoStorage.prototype.setContractEntry = function(contractEntry) {
  console.assert(this.dataset);
  if (!this.dataset) {
    alert('oops! dataset doesn\'t exist yet');
  } else {
    const contractString = JSON.stringify(contractEntry);
    this.dataset.put(contractEntry.contractId, contractString,
      () => {this.updateContractMap();}
    );
  }
};

/*const changeContractId = function(contractId) {
  window.location.hash = '#' + contractId;
  this.setState({contractId: contractId});
};*/

/*const handleContractListUpdate = function(contracts) {
  if (this.state.contractId === null && contracts.length > 0) {
    this.changeContractId(contracts[0].contractId);
  }
};*/

CognitoStorage.prototype.getDefaultContractId = function() {
  console.assert(false); // test that assert works
  console.assert(this.contractMap);
  if (this.contractMap.length > 0) {
    const id = [...this.contractMap.values()]
        .sort((a, b) => b.dateLastModified - a.dateLastModified)[0].contractId;
    console.log('returning default contract id: '+id);
    return id;
  } else {
    console.log('default contract id has no contracts to draw from; returning null');
    return null;
  }
};

/*const handleContractBoxUpdate = function(newContractEntry) {
  this.setContractEntry(newContractEntry);
};*/

const getCognitoCompatibleRandomId = function() {
  var array = new Uint8Array(15);
  window.crypto.getRandomValues(array);
  // We replace plusses with underscores and slashes with dashes for
  // compatibility with AWS Cognito Sync
  return base64.fromByteArray(array).replace(/\+/, '_').replace(/\//, '-');
};

// do not allow anonymous
function CognitoStorageHandler(loginHandler, callback) {
  console.assert(loginHandler);
  this.loginHandler = loginHandler;
  this.onUpdateCallback = callback;
  this.setupStorage(loginHandler.value);
  loginHandler.addListener((x) => {
    console.log('recieved event, running cognito setup');
    this.setupStorage(x);
  });
}

CognitoStorageHandler.prototype.setupStorage = function(loginState) {
  if (loginState.loggedIn) {
    console.log('user logged in; setting up storage');
    //this.cognitoSetup(x.logins);
    this.contractStorage = new CognitoStorage(loginState.logins, false,
        this.onUpdateCallback);
  } else {
    console.log('user not logged in; clearing storage');
    //this.cognitoTearDown();
    this.contractStorage = null;
    this.onUpdateCallback(new Map());
  }
};

CognitoStorageHandler.prototype.isEmpty = () => (!this.contractStorage);

CognitoStorageHandler.prototype.setContractEntry = function(contractEntry) {
  if (this.contractStorage) {
    this.contractStorage.setContractEntry(contractEntry);
  } else {
    throw new Error('Tried to set a contract entry while storage was empty');
  }
};

module.exports = {
  getNewId: getCognitoCompatibleRandomId,
  ContractStorage: CognitoStorage,
  ContractStorageHandler: CognitoStorageHandler
};

//CognitoStorageHandler.prototype.getContractMap = () => (this.contractStorage.c)


/*
if (loginHandler.value.loggedIn) {
  console.log('token already exists!');
  this.cognitoSetup(loginHandler.value.logins);
}
loginHandler.addListener((x) => {
  console.log('recieved event, running cognito setup');
  if (x.loggedIn) {
    //this.cognitoSetup(x.logins);
    this.contractStorage = new CognitoStorage(x.logins, false);
  } else {
    console.log('user not logged in; running tear-down');
    //this.cognitoTearDown();
    this.contractStorage = null;
  }
});

if (loginHandler.value.loggedIn) {
  console.log('token already exists!');
  this.cognitoSetup(loginHandler.value.logins);
} else {
  console.log('adding listener');
}
*/
  /*if (loginHandler) {
  } else {
    console.log('google login not required, skipping to setup');
    this.cognitoSetup();
  }*/
