'use strict';

var CSS_PRECISION = Math.pow(10, 3);

var Mathf = {

	roundCss: function(a) {
		return Math.round(a * CSS_PRECISION) / CSS_PRECISION;
	},

	lerp: function(a, b, t) {
		return a + t * (b - a);
	},

	lerpArray: function(a, b, x, t) {
		var l = a.length;
		if (x == null) {
			x = new Array(l);
		}
		for (var i = 0; i < l; i++) {
			x[i] = a[i] + t * (b[i] - a[i]);
		}
		return x;
	},

	map: function(value, inMin, inMax, outMin, outMax) {
		return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
	},

	variance: function(value, variance) {
		return value + (Math.random() - 0.5) * 2 * variance;
	}

};