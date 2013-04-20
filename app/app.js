angular.module('ruler', ['ui']);

// ruler can't get bigger than this
var maximum_width = window.screen.availWidth;

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
        units: "in",
        units_label: "in",
        subdivisions_per_unit: 8,
        tick_spacing: 1,
        minor_per_major: 4,
        minor_per_label: 8,

        ticks: null,
        labels: null,

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



    $scope.init = function() {
        console.log('init');
        $scope.horizontal.ticks = $scope.generate_ticks(maximum_width);
        $scope.horizontal.labels = $scope.generate_labels(maximum_width);

        //document.getElementById("body").webkitRequestPointerLock();
        //document.addEventListener('webkitpointerlockchange', changeCallback, false);
    }

    $scope.closeWindow = function() {
        window.close();
    }

    $scope.unitsClicked = function() {

        var options = {
            'cm': 'in',
            'in': 'px',
            'px': 'cm',
        }

        var unit_options = $scope.horizontal.unit_options[options[$scope.horizontal.units]];
        for (var key in unit_options) {
            $scope.horizontal[key] = unit_options[key];
        }

        $scope.horizontal.ticks = $scope.generate_ticks(maximum_width);
        $scope.horizontal.labels = $scope.generate_labels(maximum_width);
    }

    $scope.mousemove = function($event) {
        //console.log("mousemove");
        //console.log($event);
    }

    $scope.generate_ticks = function(pixels) {
        var ticks = [];
        var spacing = $scope.horizontal.tick_spacing;
        var per_unit = $scope.horizontal.subdivisions_per_unit;

        for (var i=1; (i*spacing*per_unit)<pixels; i++) {
            if (i % $scope.horizontal.minor_per_label == 0) {
                ticks.push({type: "label",
                            left: i*spacing/per_unit});
            } else if (i % $scope.horizontal.minor_per_major == 0) {
                ticks.push({type: "major",
                            left: i*spacing/per_unit});

            } else {
                ticks.push({type: "minor",
                            left: i*spacing/per_unit});
            }
        }

        return ticks;
    }

    $scope.generate_labels = function(pixels) {
        // using pixels here could be very wrong, and things don't break
        // only because I'm assuming that one subdivision of the chosen
        // unit will never be smaller than 1 pixel. We end up many ticks
        // offscreen but that is better than not showing ticks
        //
        // fixing this problem would require a good way of converting
        // distances between units such as cm, in, em to pixels.
        var labels = [];
        var px_per_label = $scope.horizontal.tick_spacing*$scope.horizontal.minor_per_label/$scope.horizontal.subdivisions_per_unit;

        for (var i=px_per_label; i<pixels; i+=px_per_label) {      
            labels.push({y: i, title: String(i)});
        }

        return labels;
    }

}


function range(start, end, step) {
    var range = [];
    var typeofStart = typeof start;
    var typeofEnd = typeof end;

    if (step === 0) {
        throw TypeError("Step cannot be zero.");
    }

    if (typeofStart == "undefined" || typeofEnd == "undefined") {
        throw TypeError("Must pass start and end arguments.");
    } else if (typeofStart != typeofEnd) {
        throw TypeError("Start and end arguments must be of same type.");
    }

    typeof step == "undefined" && (step = 1);

    if (end < start) {
        step = -step;
    }

    if (typeofStart == "number") {

        while (step > 0 ? end >= start : end <= start) {
            range.push(start);
            start += step;
        }

    } else if (typeofStart == "string") {

        if (start.length != 1 || end.length != 1) {
            throw TypeError("Only strings with one character are supported.");
        }

        start = start.charCodeAt(0);
        end = end.charCodeAt(0);

        while (step > 0 ? end >= start : end <= start) {
            range.push(String.fromCharCode(start));
            start += step;
        }

    } else {
        throw TypeError("Only string and number types are supported");
    }

    return range;

}