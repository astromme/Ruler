if (typeof String.prototype.startsWith != 'function') {
  String.prototype.startsWith = function (str){
    return this.slice(0, str.length) == str;
  };
}

if (typeof String.prototype.endsWith != 'function') {
  String.prototype.endsWith = function (str){
    return this.slice(-str.length) == str;
  };
}

function generateGUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

var base_parameters = {
  'frame' : 'none',
}

var horizontal_limits = {
  'minWidth':300,
  'minHeight':50,
  'maxWidth':4000,
  'maxHeight':50,
}

var vertical_limits = {
  'minWidth':50,
  'minHeight':300,
  'maxWidth':50,
  'maxHeight':4000,
}

function win_create_callback(win) {
  win.onBoundsChanged.addListener(function() {
    console.log("onBoundsChanged()");
  });
}

function createHorizontalRuler() {
  var parameters = {
    'width':700,
    'height':50,
    'id' : generateGUID()
  }

  for (key in base_parameters) {
    parameters[key] = base_parameters[key];
  }

  for (key in horizontal_limits) {
    parameters[key] = horizontal_limits[key];
  }

  chrome.app.window.create('ruler_horizontal.html', parameters, win_create_callback);
}


function createVerticalRuler() {
  var parameters = {
    'width':50,
    'height':500,
    'frame' : 'none',
    'id' : generateGUID()
  }

  for (key in base_parameters) {
    parameters[key] = base_parameters[key];
  }

  for (key in vertical_limits) {
    parameters[key] = vertical_limits[key];
  }

  chrome.app.window.create('ruler_vertical.html', parameters, win_create_callback);
}

function recreateExistingWindow(id, orientation) {
  console.log('recreating' + id + orientation);

  var parameters = {
    'frame' : 'none',
    'id' : id
  };
  
  for (key in base_parameters) {
    parameters[key] = base_parameters[key];
  }

  var limits = orientation == 'horizontal' ? horizontal_limits : vertical_limits;
  for (key in limits) {
    parameters[key] = limits[key];
  }

  chrome.app.window.create(orientation == 'horizontal' ?
      'ruler_horizontal.html' : 'ruler_vertical.html', parameters, win_create_callback);
}

chrome.app.runtime.onLaunched.addListener(function() {
  var ruler_created = false;

  chrome.storage.local.get(null, function(data) {
    console.log(data);
    for (var key in data) {
      if (key.startsWith('ruler-')) {
        recreateExistingWindow(key.slice('ruler-'.length),
                               data[key].orientation);
        ruler_created = true;
      }
    }

    if (!ruler_created) {
      createHorizontalRuler();
    }
  });
});

chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
  if (message.text == "createHorizontalRuler") {
    createHorizontalRuler();
  } else if (message.text == "createVerticalRuler") {
    createVerticalRuler();
  }
});

chrome.app.window.onBoundsChanged.addListener(function() {
  console.log("onBoundsChanged()");
  console.log(arguments);
});