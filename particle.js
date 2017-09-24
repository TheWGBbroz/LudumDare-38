function Particle(angle, yoff, da, dy, clr) {
	this.angle = angle;
	this.yoff = yoff;
	this.da = da || random(-2, 2);
	this.dy = dy || random(-5, 5);
	this.remove = false;
	this.lifetime = 0;
	this.maxlifetime = floor(random(0.4, 1.2) * 60);
	this.clr = clr || color(random(30, 90));
	this.rot = random(360);
}

Particle.prototype.update = function() {
	this.angle += this.da;
	this.yoff += this.dy;

	this.da = lerp(this.da, 0, 0.1);
	this.dy = lerp(this.dy, 0, 0.1);
	
	this.lifetime++;
	if(this.lifetime > this.maxlifetime)
		this.remove = true;
}