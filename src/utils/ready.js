const state = { ready: false };

function signalReady(dbConnected) {
  state.ready = true;
  state.dbConnected = dbConnected;
}

function isReady() {
  return state.ready;
}

module.exports = { signalReady, isReady, state };