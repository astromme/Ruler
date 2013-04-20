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
});
