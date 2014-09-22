'use strict';

function ParticleEmitter(canvas) {
	this.width = canvas.width;
	this.height = canvas.height;
	this.context = canvas.getContext('2d');
	this.particles = [];
	this.pooledParticles = [];
	this.lifetime = 1;
	this.ageVariance = 0.5;
	this.jitter = 0;
	this.jitterChance = 0.4;
	this.positionVariance = 0.3;
	this.velocityVariance = 30.0;
	this.lifetimeVariance = 0.5;
	this.past = 0;
	this.drag = 0.992;
}

ParticleEmitter.prototype.spawn = function(x, y, vx, vy) {
	var particle = (this.pooledParticles.length) ?
		this.pooledParticles.pop() : new Float32Array(6);
	this.particles.push(particle);
	particle[0] = Mathf.variance(this.lifetime, this.lifetimeVariance);
	particle[1] = Mathf.variance(x, this.positionVariance);
	particle[2] = Mathf.variance(y, this.positionVariance);
	particle[3] = Mathf.variance(vx, this.velocityVariance);
	particle[4] = Mathf.variance(vy, this.velocityVariance);
	particle[5] = Math.min(1.0, Mathf.variance(1, this.ageVariance));
};

ParticleEmitter.prototype.kill = function(particle) {
	this.particles.splice(this.particles.indexOf(particle), 1);
	this.pooledParticles.push(particle);
}

ParticleEmitter.prototype.integrate = function(particle, dt) {
	if (Math.random() > this.jitterChance) {
		particle[3] = Mathf.variance(particle[3], this.jitter * dt);
	}
	if (Math.random() > this.jitterChance) {
		particle[4] = Mathf.variance(particle[4], this.jitter * dt);
	}
	particle[1] += (particle[3] *= this.drag) * dt;
	particle[2] += (particle[4] *= this.drag) * dt;
	particle[5] -= dt / particle[0];
};

var gradient = [
	[252, 223, 95],
	[255, 193, 7],
	[241, 130, 0],
	[72, 62, 46],
	[150, 139, 122]
];
var stops = [0, 20, 30, 50];
var rangeIndex = 0;
var range = [];
var irange = [];

var radialGradient = true;

var frames = [];

var smokeImg = new Image();
smokeImg.onload = function() {
	var size = 200;
	var r = size / 2;
	for (var i = 0; i <= 100; i++) {
		var canvas = document.createElement('canvas');
		canvas.height = canvas.width = size;
		var ctx = canvas.getContext('2d');


		if (stops.indexOf(i) > -1) {
			irange = [i, stops[stops.indexOf(i) + 1] || 100];
			range = [gradient[rangeIndex], gradient[rangeIndex + 1]];
			rangeIndex++;
		}
		var rgb = range[0].map(function(c, j) {
			return Math.round(Mathf.map(i, irange[0], irange[1], range[0][j], range[1][j]));
		}).join(', ');
		if (radialGradient) {
			var grd = ctx.createRadialGradient(r, r, 0, r, r, r);
			grd.addColorStop(0, 'rgba(' + rgb + ', 1)');
			grd.addColorStop(0.5, 'rgba(' + rgb + ', 0)');
			grd.addColorStop(1, 'rgba(' + rgb + ', 0)');
			ctx.fillStyle = grd;
		} else {
			ctx.fillStyle = 'rgb(' + rgb + ')';
		}
		ctx.beginPath();
		ctx.arc(r, r, r, 0, 2 * Math.PI, false);
		ctx.fill();
		// ctx.translate(r, r);
		// ctx.rotate(Math.random() * Math.PI * 2);
		// ctx.globalAlpha = 0.1;
		// ctx.globalCompositeOperation = 'lighten';
		// ctx.drawImage(smokeImg, -r, -r, size, size);

		// ctx.drawImage(smokeImg, -r / 2, -r / 2, size / 2, size / 2);

		// Light
		// var grd = ctx.createRadialGradient(r, r, 0, r, r, r);
		// 	grd.addColorStop(0, 'rgba(' + rgb + ', 1)');
		// 	// grd.addColorStop(0.2, 'rgba(' + rgb + ', 0.5)');
		// 	grd.addColorStop(1, 'rgba(' + rgb + ', 0)');
		// 	ctx.fillStyle = grd;
		// ctx.globalAlpha = 0.1;
		// ctx.drawImage(smokeImg, -r / 2, -r / 2, size / 2, size / 2);

		frames.push(canvas);
	}
};
smokeImg.src = './smoke.png';

ParticleEmitter.prototype.render = function() {
	var ctx = this.context;
	ctx.clearRect(0, 0, this.width, this.height);
	ctx.save();
	ctx.globalCompositeOperation = 'soft-light';
	for (var i = 0, l = this.particles.length; i < l; i++) {
		var particle = this.particles[i];
		var age = 1 - particle[5];
		var frame = frames[Math.round(age * 100)];
		if (frame == null) {
			continue;
		}
		ctx.globalAlpha = Mathf.map(age, 0, 1, 1, 0);
		var size = Math.round(Mathf.map(age, 0, 1, 100, 200));
		ctx.drawImage(frame,
			Math.round(particle[1] - size / 2),
			Math.round(particle[2] - size / 2),
			size,
			size
		);
		// debugger;
	}
	ctx.restore();
};

ParticleEmitter.prototype.step = function(now) {
	now /= 1000;
	if (this.past == 0) {
		this.past = now;
		return false;
	}
	var dt = Math.min(now - this.past, 0.5);
	this.past = now;
	var l = this.particles.length;
	if (l == 0) {
		return false;
	}
	for (var i = l - 1; i >= 0; i--) {
		var particle = this.particles[i];
		this.integrate(particle, dt);
		if (particle[5] < 0) {
			this.kill(particle);
		}
	}
	this.render();
	return true;
};

Object.defineProperty(ParticleEmitter.prototype, 'length', {
	get: function() {
		return this.particles.length;
	}
});