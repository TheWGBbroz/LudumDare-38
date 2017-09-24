function entityPlayer(angle, yoff) {
	var en = new Entity(0, angle, yoff);
	en.hasSound = true;
	en.width = 30;
	en.height = 40;
	return en;
}

function entityEnemy(angle, yoff) {
	var en = new Entity(1, angle, yoff);
	en.speed = 0.6;
	en.ai = new EnemyAI(en, player);
	en.animated = true;
	en.numAnimationFrames = 4;
	en.health = 100 + currLevel * 10;
	return en;
}

function entityDragon(angle, yoff) {
	var en = new Entity(2, angle, yoff);
	en.width = 100;
	en.height = 100;
	en.health = 1000 + currLevel * 25;
	en.ai = new DragonAI(en, player);
	return en;
}

function entityRocket(angle, yoff) {
	var en = new Entity(3, angle, yoff);
	en.width = 45;
	en.height = 70;
	en.msgstart = 0;
	return en;
}

function entityFueltank(angle, yoff) {
	var en = new Entity(4, angle, yoff);
	en.width = 40;
	en.height = 46;
	en.created = frameCount;
	return en;
}

function entityMeteor(angle, yoff) {
	var en = new Entity(5, angle, yoff);
	en.width = 50;
	en.height = 50;
	en.ai = new MeteorAI(en);
	return en;
}


function Entity(type, angle, yoff) {
	this.angle = angle || 0;
	this.yoff = yoff || 0;
	this.gravitySpeed = 0;
	this.left = false;
	this.right = false;
	this.speed = 1.2;
	this.jumping = false;
	this.jumpPower = 7;
	this.onGround = true;
	this.lastLeft = false;
	this.hasSound = false;
	this.force = {x:0, y:0};

	this.width = 32;
	this.height = 32;

	this.health = 100;

	this.ai = null;

	this.x = 0;
	this.y = 0;

	this.animated = false;
	this.animationFrame = 0;
	this.numAnimationFrames = 1;
	this.animationFrameLength = 10;

	this.autofiring = false;

	// 0 = PLAYER
	// 1 = NORMAL ENEMY
	// 2 = DRAGON
	// 3 = ROCKET
	// 4 = FUEL TANK
	// 5 = METEOR
	this.type = type;
	if(type == undefined) {
		console.error("NO TYPE SET!");
	}
}

Entity.prototype.update = function() {
	if(this.ai) {
		this.ai.update();
	}

	if(this.animated && frameCount % this.animationFrameLength == 0) {
		this.animationFrame++;
		if(this.animationFrame > this.numAnimationFrames - 1)
			this.animationFrame = 0;
	}

	if(this.left) {
		this.angle -= this.speed;
		this.lastLeft = true;
	}else if(this.right) {
		this.angle += this.speed;
		this.lastLeft = false;
	}

	if(!this.jumping) {
		this.gravitySpeed -= 1;
		if(this.gravitySpeed < -4)
			this.gravitySpeed = -4;
	}else{
		this.gravitySpeed += 1;
		if(this.gravitySpeed > this.jumpPower)
			this.jumping = false;
	}

	this.yoff += this.gravitySpeed;

	this.force.x = lerp(this.force.x, 0, 0.1);
	this.force.y = lerp(this.force.y, 0, 0.1);

	this.angle += this.force.x;
	this.yoff += this.force.y;

	this.onGround = this.yoff < 1;
	if(this.onGround) {
		if(this.yoff < 0)
			this.yoff = 0;
	}

	this.angle %= 360;
	
	this.x = cos(this.angle) * worldRad;
	this.y = sin(this.angle) * worldRad + this.yoff;

	if(this.autofiring) {
		if(frameCount % 8 == 0) {
			this.shoot();
		}
	}
}

Entity.prototype.jump = function() {
	if(this.onGround) {
		if(this.hasSound)
			jumpSound.play();
		this.jumping = true;
		this.gravitySpeed = 0;
	}
}

Entity.prototype.shoot = function(damage) {
	if(this.hasSound)
		shootSound.play();
	
	var clr = color(255);
	if(player != this)
		clr = color(255, 0, 0);
	var bul = new Bullet(this.angle, (this.lastLeft ? -1 : 1) * 3, this.yoff, clr);
	bul.damage = damage;
	if(player != this) bul.fromPlayer = false;
	bullets.push(bul);
}

Entity.prototype.collision = function(angle, yoff) {
	var otherx = cos(angle) * worldRad;
	var othery = sin(angle) * worldRad + yoff;

	var selfsize = max(this.width, this.height) / 2;
	return distSq(this.x, this.y, otherx, othery) < selfsize * selfsize;
}

Entity.prototype.hit = function(damage, inverseDirection) {
	if(this == player) {
		if(playerFlickering)
			return;

		if(frameCount < invincibleEnd)
			return;

		playerFlickering = true;
		playerFlickeringStart = frameCount;

		hitSound.play();
	}

	this.health -= damage || 50;
	if(this.health < 0) this.health = 0;

	var forcex = 3;
	if(inverseDirection)
		forcex *= -1;
	this.force = {x:forcex, y:8};
}