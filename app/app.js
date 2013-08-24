angular.module('ruler', ['ui']);

// ruler can't get bigger than this
var maximum_width = "4000"

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



    $scope.init = function(orientation) {
        $scope.orientation = orientation;
        console.log('init');

        var canvas = document.getElementById("ruler_canvas");
        if ($scope.orientation == 'horizontal') {
            canvas.width = maximum_width
            canvas.height = document.body.clientHeight;
        } else {
            canvas.width = maximum_width
            canvas.height = document.body.clientWidth;
        }


        $scope.selectUnits("px");

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

        $scope.selectUnits(options[$scope.horizontal.units]);
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
        //console.log($event);
    }

    $scope.draw_ruler = function() {
        var minor_height = 3;
        var major_height = 5;
        var label_height = 10;

        var units = $scope.horizontal.units;
        var px_per_unit = window.getComputedStyle(document.getElementById(units)).width.slice(0, -2);
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
