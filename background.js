var context_id = -1;

chrome.input.ime.onFocus.addListener(function (context) {
  context_id = context.contextID;
});

var pressed_time = null;

chrome.input.ime.onKeyEvent.addListener(function (engineID, keyData) {
  // Something other than control?
  if (
    keyData.altKey ||
    keyData.metaKey ||
    keyData.shiftKey ||
    !(keyData.code == "ControlLeft" || keyData.code == "ControlRight")
  ) {
    pressed_time = false;
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
  pressed_time = false;
  if (duration > 1000) {
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
