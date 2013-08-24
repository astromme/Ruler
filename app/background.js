chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('ruler.html', {
    'transparentBackground':true,
    'minWidth':300,
    'minHeight':50,
    'maxWidth':4000,
    'maxHeight':50,
    'width':700,
    'height':50,
    'frame' : 'none'
  });

  chrome.app.window.create('ruler_vertical.html', {
    'transparentBackground':true,
    'minWidth':50,
    'minHeight':300,
    'maxWidth':50,
    'maxHeight':4000,
    'width':50,
    'height':700,
    'frame' : 'none'
  });
});
