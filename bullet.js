function Bullet(angle, speed, yoff, clr) {
	this.angle = angle;
	this.speed = speed || 3;
	this.yoff = yoff || 20;
	this.remove = false;
	this.damage = 10;
	this.clr = clr || color(255);


	this.fromPlayer = true;
}

Bullet.prototype.update = function() {
	this.angle += this.speed;
	this.yoff = lerp(this.yoff, 0, 0.05);

	var hit = this.yoff < 0.2;
	if(!hit) {
		if(this.fromPlayer) {
			for(var i = 0; i < enemies.length; i++) {
				if(enemies[i].collision(this.angle, this.yoff)) {
					hit = true;
					enemies[i].hit(this.damage, this.speed < 0);
					break;
				}
			}
		}else{
			if(player.collision(this.angle, this.yoff)) {
				hit = true;
				player.hit(this.damage, this.speed < 0);
			}
		}
	}

	if(hit) {
		// HIT!
		random(explodeSounds).play();
		this.remove = true;
		for(var i = 0; i < 30; i++) {
			particles.push(new Particle(this.angle, this.yoff));
		}
	}
}