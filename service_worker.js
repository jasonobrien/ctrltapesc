var context_id = -1;
var timeout = 1000;

// Keep-alive workaround using Offscreen API
// https://issues.chromium.org/issues/441317290
async function createOffscreen() {
  try {
    await chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: ['BLOBS'],
      justification: 'keep service worker running',
    });
  } catch (e) {
    // It's already running, good enough
    if (!e.message.startsWith('Only a single offscreen')) {
      throw e;
    }
  }
}

chrome.runtime.onStartup.addListener(createOffscreen);
createOffscreen(); // Also run on first load/install

chrome.runtime.onMessage.addListener((msg) => {
  // Just receiving the message keeps the SW alive
});

chrome.storage.sync.get({ timeout: 1000 }, (result) => {
  timeout = result.timeout;
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes.timeout) {
    timeout = changes.timeout.newValue;
  }
});

chrome.storage.managed.get(['contextID'], function(result) {
  if (result.contextID) {
    context_id = result.contextID;
  }
});

var pressed_time = null;

chrome.input.ime.onFocus.addListener(function (context) {
  context_id = context.contextID;
  chrome.storage.managed.set({ contextID: context_id });
  pressed_time = null;
});

chrome.input.ime.onKeyEvent.addListener(function (engineID, keyData) {
  // Something other than control?
  if (
    keyData.altKey ||
    keyData.metaKey ||
    keyData.shiftKey ||
    !(keyData.code == "ControlLeft" || keyData.code == "ControlRight")
  ) {
    pressed_time = null;
    return false;
  }
  // Start tracking on keydown
  if (keyData.type == "keydown") {
    pressed_time = Date.now();
    return false;
  }
  // No record of keydown?
  if (!pressed_time) return false;

  // Press too long?
  let duration = Date.now() - pressed_time;
  pressed_time = null;
  if (duration > timeout) {
    return false;
  }

  // Good - send keyup and then escape
  var events = [
    keyData,
    {
      type: "keydown",
      key: "Escape",
      code: "Escape",
      keyCode: 27,
    },
    {
      type: "keyup",
      key: "Escape",
      code: "Escape",
      keyCode: 27,
    },
  ];
  chrome.input.ime.sendKeyEvents({ contextID: context_id, keyData: events });
  return true;
});
