function createHorizontalRuler() {
    chrome.app.window.create('ruler_horizontal.html', {
    'transparentBackground':true,
    'minWidth':300,
    'minHeight':50,
    'maxWidth':4000,
    'maxHeight':50,
    'width':700,
    'height':50,
    'frame' : 'none'
  });
}


function createVerticalRuler() {
    chrome.app.window.create('ruler_vertical.html', {
    'transparentBackground':true,
    'minWidth':50,
    'minHeight':300,
    'maxWidth':50,
    'maxHeight':4000,
    'width':50,
    'height':500,
    'frame' : 'none'
  });
}

chrome.app.runtime.onLaunched.addListener(function() {
  createHorizontalRuler();
});

chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
  if (message.text == "createHorizontalRuler") {
    createHorizontalRuler();
  } else if (message.text == "createVerticalRuler") {
    createVerticalRuler();
  }
});