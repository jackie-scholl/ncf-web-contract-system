//Copyright 2016 Jackie Scholl
const CANNOT_RESOLVE2 = "CANNOT_RESOLVE";

const resolveConflict = (conflict) => {
  // Take remote version.
  //resolved.push(conflicts[i].resolveWithRemoteRecord());

  // Or... take local version.
  // resolved.push(conflicts[i].resolveWithLocalRecord());

  // Or... use custom logic.
  // var newValue = conflicts[i].getRemoteRecord().getValue() + conflicts[i].getLocalRecord().getValue();
  // resolved.push(conflicts[i].resolveWithValue(newValue);
  
  const remote = conflict.getRemoteRecord().getValue();
  const local = conflict.getLocalRecord().getValue();
  console.log('remote : local');
  console.log(remote.length + ' : ' + local.length);
  console.log(remote);
  console.log(local);
  console.log('equal? '+(remote === local));
  console.log('--- : ---');
  console.log(conflict.getRemoteRecord().toJSON());
  console.log(conflict.getLocalRecord().toJSON());

  const remoteObj = JSON.parse(remote);
  const localObj = JSON.parse(local);
  remoteObj.dateLastModified = 0;
  localObj.dateLastModified = 0;
  console.log('equal? '+(remoteObj === localObj));
  console.log(remoteObj);
  console.log(localObj);

  const remote2 = JSON.stringify(remoteObj);
  const local2 = JSON.stringify(localObj);

  console.log('equal? '+(remote2 === local2));
  console.log(remote2);
  console.log(local2);

  if (remote2 === local2) {
    return conflict.resolveWithLocalRecord();
  }

  throw CANNOT_RESOLVE2;
  // or, continue with some value
  //return conflict.resolveWithValue('tuba');
}

module.exports = {
  CANNOT_RESOLVE: CANNOT_RESOLVE2,
  resolve: resolveConflict
}
