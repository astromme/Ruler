angular.module('ruler', [])

// ruler can't get bigger than this
var maximum_width = "4000"

// 2.54 cms in one inch
var cm_per_in = 2.54;

var service = analytics.getService('ruler');
var tracker = service.getTracker('UA-40067294-2');  // Supply your GA Tracking ID.

function toArray(list) {
  return Array.prototype.slice.call(list || [], 0);
}

Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

function isFunction(functionToCheck) {
 var getType = {};
 return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}


// called when the pointer lock has changed. Here we check whether the
// pointerlock was initiated on the element we want.
function changeCallback(e) {
    if (document.webkitPointerLockElement === document.getElementById("body")) {

        // we've got a pointerlock for our element, add a mouselistener
        document.addEventListener("mousemove", moveCallback, false);
    } else {

        // pointer lock is no longer active, remove the callback
        document.removeEventListener("mousemove", moveCallback, false);

        // and reset the entry coordinates
        entryCoordinates = {x:-1, y:-1};
    }
};

function errorHandler(e) {
  console.error(e);
}

function RulerControl($scope) {
    $scope.horizontal = {
        units: null,
        units_label: null,
        subdivisions_per_unit: null,
        tick_spacing: null,
        minor_per_major: null,
        minor_per_label: null,

        unit_options: {
            "px": {
                units: "px",
                units_label: "px",
                subdivisions_per_unit: 1,
                tick_spacing: 2,
                minor_per_major: 5,
                minor_per_label: 25,
            },
            "cm": {
                units: "cm",
                units_label: "cm",
                subdivisions_per_unit: 10,
                tick_spacing: 1,
                minor_per_major: 5,
                minor_per_label: 10,
            },
            "in": {
                units: "in",
                units_label: "in",
                subdivisions_per_unit: 8,
                tick_spacing: 1,
                minor_per_major: 4,
                minor_per_label: 8,
            },
        }
    }

    $scope.settings_visible = false;

    $scope.screen_diagonal_inches = 0;
    $scope.screen_diagonal_cm = 0;

    //console.log("adding message listener");
    chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
        //console.log("got message", message)
        if (message.text == "updateScreenInches") {
            $scope.screen_diagonal_inches = message.inches;
            $scope.updateScreenInches(true /*suppress_broadcast*/);
        } else if (message.text == "updateScreenCm") {
            $scope.screen_diagonal_cm = message.cm;
            $scope.updateScreenCm(true /*suppress_broadcast*/);
        }
    });

    $scope.init = function(orientation) {
        $scope.orientation = orientation;
        console.log('init');
        tracker.sendAppView('Ruler-'+$scope.orientation);

        var canvas = document.getElementById("ruler_canvas");
        if ($scope.orientation == 'horizontal') {
            canvas.width = maximum_width
            canvas.height = document.body.clientHeight;
        } else {
            canvas.width = maximum_width
            canvas.height = document.body.clientWidth;
        }

        $scope.loadSettings();

        $scope.selectUnits("px");

        service.getConfig().addCallback(function(config) {
            var checkbox = document.getElementById('analytics');
            if (checkbox != undefined) {
                checkbox.checked = config.isTrackingPermitted();
                checkbox.onchange = function() {
                    config.setTrackingPermitted(checkbox.checked);
                };
            }
        });


        //document.getElementById("body").webkitRequestPointerLock();
        //document.addEventListener('webkitpointerlockchange', changeCallback, false);
    }

    $scope.closeWindow = function() {
        tracker.sendEvent('Ruler', 'CloseClicked');
        window.close();
    }

    $scope.showSettings = function() {
        tracker.sendEvent('Ruler', 'ShowSettings');

        $scope.settings_visible = !$scope.settings_visible;
    }

    $scope.isTypeOfUnit = function(unit) {
        return $scope.horizontal.units == unit;
    }

    $scope.isPx = function() { return $scope.isTypeOfUnit('px'); }
    $scope.isCm = function() { return $scope.isTypeOfUnit('cm'); }
    $scope.isIn = function() { return $scope.isTypeOfUnit('in'); }

    $scope.selectTypeOfUnit = function(unit) {
        tracker.sendAppView('Ruler-'+$scope.orientation+'-'+unit);
        tracker.sendEvent('Ruler', 'UnitsClicked');

        $scope.selectUnits(unit);
    }

    $scope.selectPx = function() { return $scope.selectTypeOfUnit('px'); }
    $scope.selectCm = function() { return $scope.selectTypeOfUnit('cm'); }
    $scope.selectIn = function() { return $scope.selectTypeOfUnit('in'); }

    $scope.updateScreenInches = function(suppress_broadcast) {
        $scope.screen_diagonal_cm = cm_per_in*$scope.screen_diagonal_inches;
        $scope.selectUnits($scope.horizontal.units);

        if (suppress_broadcast == true) {
            //console.log("Suppressing broadcast");
            return;
        }

        //console.log("Telling other rulers to update their screen inches");
        chrome.runtime.sendMessage({ text:"updateScreenInches",
                                     inches:$scope.screen_diagonal_inches },
                                   function(reponse){});
        $scope.saveSettings(); 
    }

    $scope.updateScreenCm = function(suppress_broadcast) {
        $scope.screen_diagonal_inches = $scope.screen_diagonal_cm/cm_per_in;
        $scope.selectUnits($scope.horizontal.units);

        if (suppress_broadcast == true) {
            //console.log("Suppressing broadcast");
            return;
        }

        //console.log("Telling other rulers to update their screen inches");
        chrome.runtime.sendMessage({ text:"updateScreenCm",
                                     cm:$scope.screen_diagonal_cm },
                                   function(reponse){});
        $scope.saveSettings();
    }  

    $scope.saveSettings = function(callback) {
        var data = {
            screen_diagonal_inches: $scope.screen_diagonal_inches
        }

        chrome.storage.local.set(data, function() {
            console.log("settings saved");
            if (isFunction(callback)) {
                callback();
            }
        });
    }

    $scope.loadSettings = function(callback) {
        chrome.storage.local.get(null, function(data) {
            $scope.screen_diagonal_inches = data.screen_diagonal_inches;
            console.log("settings loaded");
            if (isFunction(callback)) {
                callback();
            }
        });
    }

    $scope.selectUnits = function(units) {
        var unit_options = $scope.horizontal.unit_options[units];
        for (var key in unit_options) {
            $scope.horizontal[key] = unit_options[key];
        }

        var ctx = document.getElementById("ruler_canvas").getContext("2d");
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        $scope.draw_ruler();
    }

    $scope.mousemove = function($event) {
        //console.log("mousemove");
        console.log("press: " + $event.button);
        //console.log($event.webkitMovementX + " " + $event.webkitMovementY);
        //console.log(window.screenX + " " + window.screenY);
    }

    $scope.mousemove = function($event) {
        //console.log("mousemove");
        console.log($event.button);
        //console.log($event.webkitMovementX + " " + $event.webkitMovementY);
        //console.log(window.screenX + " " + window.screenY);
    }

    $scope.createHorizontalRuler = function($event) {
        tracker.sendEvent('Ruler', 'CreateHorizontalRuler', 'from-'+$scope.orientation);

        chrome.runtime.sendMessage({text:"createHorizontalRuler"}, function(reponse){
        });
    }

    $scope.createVerticalRuler = function($event) {
        tracker.sendEvent('Ruler', 'CreateHorizontalRuler', 'from-'+$scope.orientation);

        chrome.runtime.sendMessage({text:"createVerticalRuler"}, function(reponse){
        });
    }

    $scope.draw_ruler = function() {
        var minor_height = 3;
        var major_height = 5;
        var label_height = 10;

        var units = $scope.horizontal.units;

        if (units == "px" 
            || $scope.screen_diagonal_inches == 0 
            || $scope.screen_diagonal_inches === undefined) {
            var px_per_unit = window.getComputedStyle(document.getElementById(units)).width.slice(0, -2);
        } else {
            // We want to find a multipler that we can apply to the px_per_unit
            // so that it correctly represents the px_per_inch and px_per_cm
            // of the particular display in question. For a particular dimension
            // the way to do this is find the ratio between pixels and inches,
            // then use that as px_per_unit.
            var screen_diagonal_pixels = Math.sqrt(Math.pow(screen.width,2) +
                                                   Math.pow(screen.height,2));
            var ppi = screen_diagonal_pixels / $scope.screen_diagonal_inches;

            if (units == "cm") {
                var px_per_unit = ppi/cm_per_in;
            } else {
                var px_per_unit = ppi;
            }
        }
        
        console.log(px_per_unit + " px per " + units);

        var font_height = 12;
        var ctx = document.getElementById("ruler_canvas").getContext("2d");
        ctx.lineWidth = 1;
        ctx.font = String(font_height)+"px Arial";
        ctx.textAlign = "center";
        ctx.beginPath();

        var ppuMoveTo = function(x, y) {
            ctx.moveTo(x*px_per_unit-0.5, y);
        }
        var ppuLineTo = function(x, y) {
            ctx.lineTo(x*px_per_unit-0.5, y);
        }

        var spacing = $scope.horizontal.tick_spacing;
        var per_unit = $scope.horizontal.subdivisions_per_unit;

        for (var i=1; (i*spacing/per_unit*px_per_unit)<maximum_width; i++) {
            var x = i*spacing/per_unit;
            var y = 0;

            if (i % $scope.horizontal.minor_per_label == 0) {
                ppuMoveTo(x, y);
                ppuLineTo(x, y+label_height);
                ctx.fillText(x, x*px_per_unit, y+label_height+font_height);
            } else if (i % $scope.horizontal.minor_per_major == 0) {
                ppuMoveTo(x, y);
                ppuLineTo(x, y+major_height);
            } else {
                ppuMoveTo(x, y);
                ppuLineTo(x, y+minor_height);
            }
        }

        ctx.stroke();
    }
}
