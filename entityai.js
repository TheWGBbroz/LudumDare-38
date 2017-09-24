function EnemyAI(entity, target) {
	this.entity = entity;
	this.target = target;
}

EnemyAI.prototype.update = function() {
	var margin = 1;

	if(this.entity.angle - margin > this.target.angle) {
		this.entity.left = true;
		this.entity.right = false;
	}else if(this.entity.angle + margin < this.target.angle) {
		this.entity.left = false;
		this.entity.right = true;
	}else{
		this.entity.left = false;
		this.entity.right = false;
	}

	if(this.entity.yoff + margin < this.target.yoff) {
		//this.entity.jump();
	}

	if(this.target.collision(this.entity.angle, this.entity.yoff)) {
		this.target.hit(20, this.entity.lastLeft);
	}

	if(currLevel > 5 && random() < 0.001) {
		this.entity.shoot(20);
	}

	if(random() < 0.05) {
		this.entity.jump();
	}
}

function DragonAI(entity, target) {
	this.entity = entity;
	this.target = target;

	this.hitStart = -1;
}

DragonAI.prototype.update = function() {
	var margin = 100;

	if(this.entity.angle - margin > this.target.angle) {
		this.entity.left = true;
		this.entity.right = false;
	}else if(this.entity.angle + margin < this.target.angle) {
		this.entity.left = false;
		this.entity.right = true;
	}else{
		this.entity.left = false;
		this.entity.right = false;
	}

	if(random() < 0.01) {
		this.hitStart = frameCount;

		for(var i = 0; i < 200; i++) {
			particles.push(new Particle(this.entity.angle, this.entity.yoff, (this.entity.lastLeft ? -1 : 1) * random(2, 10), random(-10, 5), color(random(190, 255), 20, 0)));
		}
	}

	if(this.hitStart != -1) {
		if(frameCount - this.hitStart > 60 * 0.2) {
			var d = distSq(this.entity.x, this.entity.y, this.target.x, this.target.y);
			if(d < 260 * 260) {
				this.target.hit(25, this.entity.lastLeft);
			}
			this.hitStart = -1;
		}
	}
}

function MeteorAI(entity) {
	this.entity = entity;
}

MeteorAI.prototype.update = function() {
	if(this.entity.yoff <= 0) {
		this.entity.remove = true;
		for(var i = 0; i < 150; i++) {
			particles.push(new Particle(this.entity.angle, this.entity.yoff, random(-4, 4), random(-8, 8), color(random(255), 20, 0)));
		}
		earthquaking = true;
		eqStart = frameCount;
		eqEnd = frameCount + 50;

		random(explodeSounds).play();
	}

	for(var i = 0; i < 5; i++) {
		particles.push(new Particle(this.entity.angle, this.entity.yoff, random(-1, 1), random(-4, 4), color(random(255), 20, 0)))
	}
}