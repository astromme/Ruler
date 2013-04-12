angular.module('ruler', ['ui']);

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


function errorHandler(e) {
  console.error(e);
}

function RulerControl($scope) {
    $scope.horizontal = {
        tick_spacing: 2,
        minor_per_major: 5,
        minor_per_label: 25,

        ticks: null,
        labels: null,
    }


    $scope.init = function() {
        console.log('init');
        $scope.horizontal.ticks = $scope.generate_ticks(700);
        $scope.horizontal.labels = $scope.generate_labels(700);
    }

    $scope.closeWindow = function() {
        window.close();
    }


    $scope.generate_ticks = function(pixels) {
        var ticks = [];

        for (var i=1; (i*$scope.horizontal.tick_spacing)<pixels; i++) {
            if (i % $scope.horizontal.minor_per_label == 0) {
                ticks.push({type: "label"});
            } else if (i % $scope.horizontal.minor_per_major == 0) {
                ticks.push({type: "major"});
            } else {
                ticks.push({type: "minor"});
            }
        }

        return ticks;
    }

    $scope.generate_labels = function(pixels) {
        var labels = [];
        var px_per_label = $scope.horizontal.tick_spacing*$scope.horizontal.minor_per_label;

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