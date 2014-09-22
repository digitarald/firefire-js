'use strict';

var canvas = document.querySelector('#canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Emitter that looks good on fingers
var emitter = new ParticleEmitter(canvas);
emitter.positionVariance = 25;
emitter.velocityVariance = 40.0;
emitter.lifetime = 3;
emitter.lifetimeVariance = 2;
emitter.jitterChance = 0.2;
emitter.jitter = 300;

function step(time) {
	requestAnimationFrame(step);
	FireStarter.list.forEach(function(fireStarter) {
		for (var i = 0; i < 5; i++) {
			emitter.spawn(fireStarter.x, fireStarter.y, 0, -100);
		}
	});
	emitter.step(time);
}

Array.forEach = Array.forEach || Array.prototype.forEach.call.bind(Array.prototype.forEach);

// Simple touch n fire manager
function FireStarter(touch) {
	this.id = touch.identifier || 0;
	this.x = touch.pageX;
	this.y = touch.pageY;
	this.force = 1;
	FireStarter.list.push(this);
}

FireStarter.prototype.update = function(touch) {
	this.x = touch.pageX;
	this.y = touch.pageY;
};

FireStarter.prototype.destroy = function() {
	FireStarter.list.splice(FireStarter.list.indexOf(this), 1);
};

FireStarter.list = [];

window.addEventListener('touchstart', function(evt) {
	evt.preventDefault();
	Array.forEach(evt.changedTouches, function(touch) {
		new FireStarter(touch);
	});
}, false);
window.addEventListener('touchmove', function(evt) {
	evt.preventDefault();
	// console.log('touchmove', evt.changedTouches.length);
	Array.forEach(evt.changedTouches, function(touch) {
		FireStarter.list.forEach(function(fireStarter) {
			if (fireStarter.id != touch.identifier) {
				return;
			}
			fireStarter.update(touch);
		});
	});
}, false);
window.addEventListener('touchend', function(evt) {
	evt.preventDefault();
	// console.log('touchend', evt.changedTouches.length);
	Array.forEach(evt.changedTouches, function(touch) {
		FireStarter.list = FireStarter.list.filter(function(fireStarter) {
			if (fireStarter.id != touch.identifier) {
				return;
			}
			fireStarter.destroy();
		});
	});
}, false);

requestAnimationFrame(step);
