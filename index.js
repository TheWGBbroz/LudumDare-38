window.onkeydown = function(e) { 
	return !(e.keyCode == 32);
};

var worldRad = 250;

// ASSETS
var explodeSounds = [];
var shootSound;
var jumpSound;
var hitSound;
var typingSound;
var bgmusic;
var pickupSound;
var errorSound;

var worldImage;
var starImage;
var enemyImages = [];
var dragonImage;
var dragonImageFlipped;
var rocketImage;
var fueltankImage;
var musicImages = [];
var playerImage;
var ludumdareImage;
var meteorImage;
var rocketImageCorrect;
//

var player;
var bullets = [];
var particles = [];
var enemies = [];
var stars = [];
var angle = 0;
var rocket;
var fueltank;
var meteors = [];

var angleInc = 0.06;

var playerFlickering = false;
var playerFlickeringStart = 0;

var dead = false;

var screenshot;

var message;
var typingMessage = "";

var currLevel = 1;

var musicOn = true;

var foundKey = false;

var inMenu = true;
var playTimer = 0;
var playTimerUp = true;
var scl = 1;

var earthquaking = false;
var eqStart = 0;
var eqEnd = 0;
var eqFire = -1;

var fuel = 0;
var fuelTarget = 0;
var visualHP = 0;

var invincibleEnd = 0;

var ending = false;
var endingStart = 0;
var endingY = 0;
var endingYSpeed = 0;
var endingParticles = [];
var endingRocketRot = 0;
var endingStars = [];

var paused = false;

var numLevels = 10;

function preload() {
	for(var i = 0; i < 4; i++)
		explodeSounds[i] = loadSound("sounds/explode" + i + ".wav");

	shootSound = loadSound("sounds/shoot.wav");
	jumpSound = loadSound("sounds/jump.wav");
	hitSound = loadSound("sounds/hit.wav");
	typingSound = loadSound("sounds/typing.wav");
	bgmusic = loadSound("sounds/music.mp3");
	pickupSound = loadSound("sounds/pickup.wav");
	errorSound = loadSound("sounds/error.wav");


	for(var i = 0; i < 4; i++)
		enemyImages[i] = loadImage("images/enemy" + i + ".png");

	worldImage = loadImage("images/world.png");
	starImage = loadImage("images/star.png");
	dragonImage = loadImage("images/dragon.png");
	rocketImage = loadImage("images/rocket.png");
	fueltankImage = loadImage("images/fueltank.png");
	musicImages[0] = loadImage("images/music_on.png");
	musicImages[1] = loadImage("images/music_off.png");
	playerImage = loadImage("images/player.png");
	ludumdareImage = loadImage("images/ludumdare.png");
	meteorImage = loadImage("images/meteor.png");
	rocketImageCorrect = loadImage("images/rocket.png");
}

function setup() {
	var canvas = createCanvas(1280, 720);
	canvas.parent("#canvas-holder");

	angleMode(DEGREES);

	for(var i = 0; i < enemyImages.length; i++) {
		enemyImages[i] = flipImage(enemyImages[i], false, true);
	}

	dragonImage = flipImage(dragonImage, false, true);
	dragonImageFlipped = flipImage(dragonImage, true, false);

	rocketImage = flipImage(rocketImage, false, true);
	fueltankImage = flipImage(fueltankImage, false, true);

	playerImage = flipImage(playerImage, false, true);

	loadLevel(1);

	musicOn = false;
	toggleMusic();

	frameRate(60);

	screenshot = createImage(width, height);

	for(var i = 0; i < 80; i++) {
		stars.push({
			r: random(worldRad, width / 2),
			ang: random(360),
			scl: random(0.5, 1.5),
			rot: random(360)
		});
	}
}

function loadLevel(lvl) {
	reset();

	currLevel = lvl;

	angleInc = 0.05 * lvl;
	
	var enemyCount = 2 * lvl;
	if(enemyCount > 10)
		enemyCount = 10;
	for(var i = 0; i < enemyCount; i++) {
		var ang = 360 / (2 * lvl - 0) * i;
		enemies.push(entityEnemy(ang));
	}

	invincibleEnd = frameCount + 60 * 2.5;

	if(lvl % 4 == 0) {
		// Spawn dragon(s)
		var amount = lvl / 4;
		if(amount > 6)
			amount = 6;
		for(var i = 0; i < amount; i++) {
			enemies.push(entityDragon(random(360)));
		}
	}

	rocket = entityRocket(random(360));

	var zoom = lvl * 0.1;
	if(zoom < 0.4)
		zoom = 0.4;

	worldRad = 250 * zoom;
	scl = 1 / zoom;


	// DEBUG
	//end();
}

function reset() {
	playerFlickering = false;
	playerFlickeringStart = 0;

	player = entityPlayer(180);

	enemies = [];

	angle = 0;

	bullets = [];
	particles = [];
	meteors = [];

	angleInc = 0.06;

	rocket = undefined;
	fueltank = undefined;

	foundKey = false;

	removeMessage();
}

function draw() {
	if(paused) {
		image(screenshot, 0, 0, width, height);
		textAlign(CENTER);
		fill(255);
		stroke(0);
		if(frameCount % 60 < 30) {
			textSize(120);
			strokeWeight(4);
			text("PAUSED", width / 2, 300);
		}

		strokeWeight(2);
		textSize(60);
		text("Press ESCAPE to resume", width / 2, 390);
		strokeWeight(1);
		return;
	}

	if(inMenu) {
		background(0);

		textAlign(CENTER);
		textSize(100);
		text("Rocket World", width / 2, 120);

		textSize(45);
		fill(255);
		text("A game made for", width / 2, 200);
		image(ludumdareImage, width / 2 - 700 / 2, 220, 700, 700 * (ludumdareImage.height / ludumdareImage.width));
		textSize(80);
		text("38", 1040, 315);

		if(playTimerUp) {
			playTimer += 6;
			if(playTimer > 400) {
				playTimer = 255;
				playTimerUp = false;
			}
		}else{
			playTimer -= 6;
			if(playTimer < 0) {
				playTimer = 0;
				playTimerUp = true;
			}
		}
		textSize(40);
		textAlign(CENTER);
		fill(255, playTimer);
		text("Click anywhere to play!", width / 2, height / 2 + 110);

		fill(255);
		textSize(30);
		text("For a timelapse on how I made this game, check the info below!", width / 2, height / 2 + 180);
		text("DISCLAIMER: I am a programmer. Not an artist.", width / 2, height / 2 + 220);

		return;
	}

	if(ending) {
		background(0);

		var particleAddYSpeed = endingYSpeed;
		if(particleAddYSpeed > 20)
			particleAddYSpeed = 20;
		for(var i = 0; i < endingParticles.length; i++) {
			var p = endingParticles[i];
			p.x += p.dx;
			p.y += p.dy + particleAddYSpeed;
			push();
			fill(p.clr);
			rectMode(CENTER);
			translate(p.x, p.y);
			rotate(p.rot);
			rect(0, 0, p.size, p.size);
			pop();

			if(p.x < 0 || p.y < 0 || p.x >= width || p.y >= height) {
				endingParticles.splice(i--, 1);
			}
		}

		for(var i = 0; i < endingStars.length; i++) {
			var s = endingStars[i];
			s.y += endingYSpeed;
			push();
			translate(s.x, s.y);
			scale(s.scl);
			rotate(s.rot);
			image(starImage, 0, 0);
			pop();

			if(s.x < 0 || s.x >= width || s.y >= height) {
				endingStars[i] = {
					x: random(width),
					y: random(-100, -50),
					scl: random(0.5, 1.5),
					rot: random(360)
				}
			}
		}

		var rocketX = width / 2 - rocketImageCorrect.width / 2;
		var rocketY = height - worldImage.height / 2 - rocketImageCorrect.height;

		for(var i = 0; i < 3; i++) {
			endingParticles.push({
				x: rocketX + rocketImageCorrect.width / 2,
				y: rocketY + rocketImageCorrect.height - 30,
				dx: random(-10, 10),
				dy: random(5, 20),
				clr: color(random(150, 255), 20, 0),
				size: random(4, 12),
				rot: random(360)
			});
		}

		if(endingY < height)
			image(worldImage, width / 2 - worldImage.width / 2, height - worldImage.height / 2 + endingY);

		var wiggling = 0.8;
		var fadeAmount = 0;

		var sinceStart = frameCount - endingStart;

		if(sinceStart > 60 * 4) {
			if(endingY < height)
				endingY += endingYSpeed;
			endingYSpeed += 0.02;
			if(endingYSpeed > 80)
				endingYSpeed = 80;
		}else{
			fadeAmount = map(frameCount, endingStart, endingStart + 60 * 2, 255, 0);
			wiggling = 0;

			//document.getElementsByTagName("body")[0].style.backgroundColor = "rgb(" + fadeAmount + ", " + fadeAmount + ", " + fadeAmount + ")";
		}

		if(sinceStart > 60 * 4 && sinceStart < 60 * 6) {
			wiggling = wiggling * map(sinceStart, 60 * 4, 60 * 6, 0, 1);
		}

		endingRocketRot = random(-wiggling, wiggling);

		push();
		translate(rocketX + rocketImageCorrect.width / 2, rocketY + rocketImageCorrect.height);
		rotate(endingRocketRot);
		image(rocketImageCorrect, -rocketImageCorrect.width / 2, -rocketImageCorrect.height);
		pop();

		if(fadeAmount > 0)
			background(0, 0, 0, fadeAmount);

		function endText(secsStart, secsEnd, secsFade, txt, x, y) {
			if(sinceStart > 60 * secsStart && sinceStart < 60 * secsEnd) {
				var fade = 255;
				if(sinceStart < 60 * (secsStart + secsFade)) {
					// Fade in
					fade = map(sinceStart, 60 * secsStart, 60 * (secsStart + secsFade), 0, 255);
				}
				if(sinceStart > 60 * (secsEnd - secsFade)) {
					// Fade out
					fade = map(sinceStart, 60 * (secsEnd - secsFade), 60 * secsEnd, 255, 0);
				}

				fill(255, fade);
				text(txt, x, y);
			}
		}

		textAlign(CENTER);

		textSize(110);
		endText(6, 14, 1, "Rocket World", width / 2, 120);

		textSize(40);
		endText(9, 14, 1, "A game made in 48 hours for Ludum Dare 38", width / 2, 200);

		textSize(65);
		endText(16, 20, 1, "I hope you enjoyed it!", width / 2, 120);

		textSize(65);
		endText(22, 28, 1, "You can follow me on", width / 2, 100);

		textSize(40);
		endText(24, 28, 1, "Twitter: @TheWGBbroz", width / 2, 170);

		textAlign(LEFT);
		textSize(30);
		endText(-1, 8, 1, "Click anywhere to get back to the normal view", 20, height - 20);

		return;
	}

	if(player.health <= 0) {
		reset();
		dead = true;
		updateScreenshot();
	}

	background(0);

	if(dead) {
		image(screenshot, 0, 0, width, height);

		fill(255);
		textSize(100);
		textAlign(CENTER);
		text("Oh no!", width / 2, 200);
		textSize(40);
		text("You died!", width / 2, 300);
		textSize(25);
		text("Press SPACE to retry", width / 2, 340);

		return;
	}

	push();
	translate(width / 2, height / 2);

	if(eqFire != -1 && frameCount > eqFire) {
		earthquake();
		eqFire = -1;
	}

	// Stars
	for(var i = 0; i < stars.length; i++) {
		var x = cos(stars[i].ang) * stars[i].r;
		var y = sin(stars[i].ang) * stars[i].r;

		push();
		translate(x, y);
		rotate(stars[i].rot);
		scale(stars[i].scl);
		image(starImage, 0, 0);
		pop();

		stars[i].ang += 0.06;

		if(stars[i].shooting) {
			if(frameCount - stars[i].shootingStart > stars[i].shootDuration) {
				stars[i].shooting = false;
			}
			stars[i].ang += stars[i].shootSpeed;
		}

		stars[i].ang %= 360;
	}

	// Earthquake
	if(earthquaking) {
		if(frameCount > eqEnd) {
			earthquaking = false;
		}else{
			var eqLength = eqEnd - eqStart;
			var eqMid = eqStart + (eqEnd - eqStart) / 2;
			var strength = abs(eqMid - frameCount) / (eqLength / 2);
			//if(frameCount < eqMid) {
				strength = 1 - strength;
			//}
			var s = map(currLevel, 0, 10, 10, 25);
			translate(random(-s * strength, s * strength), random(-s * strength, s * strength));
		}
	}

	if(random() < map(currLevel, 0, 10, 0.001, 0.01)) {
		meteors.push(entityMeteor(random(360), random(500, 1000)));
	}

	rotate(angle);

	scale(scl);

	angle += angleInc;
	angle %= 360;

	image(worldImage, -worldRad - 2, -worldRad - 2, worldRad * 2 + 4, worldRad * 2 + 4);

	// Player
	player.update();
	if(!playerFlickering || (playerFlickering && frameCount % 15 > 7)) {
		push();
		rotate(player.angle);
		fill(255, 0, 0);
		//rect(-player.width / 2, worldRad + player.yoff, player.width, player.height);
		image(playerImage, -player.width / 2, worldRad + player.yoff, player.width, player.height);
		pop();
	}

	if(playerFlickering && frameCount - playerFlickeringStart > 60 * 2) {
		playerFlickering = false;
	}

	rocket.update();
	push();
	rotate(rocket.angle);
	image(rocketImage, -rocket.width / 2, worldRad + rocket.yoff, rocket.width, rocket.height);
	pop();

	if(fueltank) {
		fueltank.update();
		push();
		rotate(fueltank.angle);
		image(fueltankImage, -fueltank.width / 2, worldRad + fueltank.yoff, fueltank.width, fueltank.height);
		pop();
	}else if(!foundKey) {
		if(enemies.length == 0) {
			fueltank = entityFueltank(random(360));
		}
	}

	var distToRocket = distSq(player.x, player.y, rocket.x, rocket.y);
	if(distToRocket < 50 * 50) {
		if(!foundKey) {
			if(frameCount - rocket.msgstart > 60 * 5) {
				rocket.msgstart = frameCount;
				errorSound.play();
				if(enemies.length == 0)
					setMessage("You need to fill the rocket with fuel first!");
				else
					setMessage("You need to fill the rocket with fuel first! Kill all enemies to get a fuel tank.");
			}
		}else{
			pickupSound.play();
			setMessage("You filled the rocket!");
			fuelTarget += 100 / numLevels;
			loadLevel(currLevel + 1);

			if(fuelTarget >= 100) {
				end();
			}
		}
	}

	if(fueltank) {
		var distToFuel = distSq(player.x, player.y, fueltank.x, fueltank.y);
		if(frameCount - fueltank.created > 60 && distToFuel < 50 * 50) {
			fueltank = null;
			setMessage("You found a fuel tank! Bring it to the rocket!");
			foundKey = true;
			pickupSound.play();
		}
	}

	// Enemies
	for(var i = 0; i < enemies.length; i++) {
		enemies[i].update();
		push();
		rotate(enemies[i].angle);
		if(enemies[i].type == 1)
			image(enemyImages[enemies[i].animationFrame], -enemies[i].width / 2, worldRad + enemies[i].yoff, enemies[i].width, enemies[i].height);
		else if(enemies[i].type == 2)
			image(enemies[i].lastLeft ? dragonImage : dragonImageFlipped, -enemies[i].width / 2, worldRad + enemies[i].yoff, enemies[i].width, enemies[i].height);
		pop();

		if(enemies[i].health <= 0) {
			// Enemy died
			for(var j = 0; j < 30; j++) {
				particles.push(new Particle(enemies[i].angle, enemies[i].yoff, random(-2, 2), random(0, 7), color(random(200, 255))));
			}
			enemies.splice(i--, 1);
		}
	}

	// Bullets
	for(var i = 0; i < bullets.length; i++) {
		bullets[i].update();
		push();
		fill(bullets[i].clr);
		rotate(bullets[i].angle);
		rect(-2.5, worldRad + bullets[i].yoff - 2.5, 5, 5);
		pop();

		if(bullets[i].remove) {
			bullets.splice(i--, 1);
		}
	}

	// Particles
	for(var i = 0; i < particles.length; i++) {
		particles[i].update();
		push();
		fill(particles[i].clr);
		rotate(particles[i].angle);
		translate(0, worldRad + particles[i].yoff);
		rectMode(CENTER);
		rotate(particles[i].rot);
		rect(0, 0, 5, 5);
		pop();

		if(particles[i].remove) {
			particles.splice(i--, 1);
		}
	}

	// Meteors
	for(var i = 0; i < meteors.length; i++) {
		meteors[i].update();
		push();
		fill(255, 255, 255);
		rotate(meteors[i].angle);
		image(meteorImage, -meteors[i].width / 2, worldRad + meteors[i].yoff, meteors[i].width, meteors[i].height);
		pop();

		if(meteors[i].remove) {
			meteors.splice(i--, 1);
		}
	}

	pop();

	if(message) {
		fill(90);
		rect(0, height - 60, width, 60);

		if(typingMessage.length < message.length && frameCount % 4 == 0) {
			typingMessage += message.charAt(typingMessage.length);
			typingSound.play();
		}

		textSize(30);
		textAlign(LEFT);
		fill(255);

		var msg = typingMessage;
		if(frameCount % 60 < 30) {
			msg += "_";
		}
		text(msg, 200, height - 20);
	}

	textSize(20);
	textAlign(LEFT);
	fill(255);
	text("Level: " + currLevel, 10, 25);
	text("FPS: " + floor(frameRate()), 10, height - 10);

	image(musicOn ? musicImages[0] : musicImages[1], width - 32, height - 32, 32, 32);

	while(particles.length > 200) {
		particles.splice(particles.length - 1, 1);
	}

	if(random() < map(currLevel, 0, 10, 0.0001, 0.001)) {
		eqFire = frameCount + 60 * 1.5;
		setMessage("Watch out! An earthquake is coming!");
	}

	if(random() < 0.01) {
		shootStar();
	}

	fill(255);
	textSize(20);
	textAlign(LEFT);
	text("Fuel:", 10, 50);
	drawProgressBar(60, 35, 100, 16, fuel / 100);

	fill(255);
	textSize(20);
	textAlign(LEFT);
	text("HP:", 10, 75);
	drawProgressBar(48, 60, 100, 16, visualHP / 100);

	fuel = lerp(fuel, fuelTarget, 0.1);
	visualHP = lerp(visualHP, player.health, 0.1);
}

function removeElement(id) {
	var element = document.getElementById(id);
	element.outerHTML = "";
	delete element;
}

function end() {
	document.getElementById("title").style.display = "none";
	document.getElementById("content").style.display = "none";
	resizeCanvas(windowWidth, windowHeight);

	inMenu = false;
	endingStart = frameCount;
	ending = true;

	for(var i = 0; i < 50; i++) {
		endingStars.push({
			x: random(width),
			y: random(height),
			scl: random(0.5, 1.5),
			rot: random(360)
		});
	}
}

function drawProgressBar(x, y, w, h, percent) {
	fill(255, 0, 0);
	rect(x, y, w, h);
	fill(0, 255, 0);
	rect(x, y, w * percent, h);
}

function shootStar() {
	var star = random(stars);
	star.shooting = true;
	star.shootingStart = frameCount;
	star.shootDuration = floor(random(60 * 0.1, 60 * 0.8));
	star.shootSpeed = random(2, 5);
}

function earthquake() {
	earthquaking = true;
	eqStart = frameCount;
	eqEnd = frameCount + floor(random(60 * 3, 60 * 6));
}

function updateScreenshot() {
	screenshot = createImage(width, height);
	screenshot.loadPixels();
	loadPixels();
	for(var i = 0; i < pixels.length; i++)
		screenshot.pixels[i] = pixels[i];
	screenshot.updatePixels();
}

function toggleMusic() {
	musicOn = !musicOn;
	if(musicOn) {
		bgmusic.loop();
		bgmusic.setVolume(5);
	}else{
		bgmusic.stop();
	}
}

function keyPressed() {
	if(paused) {
		if(keyCode == ESCAPE) {
			paused = false;
		}
		return;
	}else if(keyCode == ESCAPE) {
		updateScreenshot();
		paused = true;
	}

	if(ending)
		return;

	if(dead) {
		if(key == ' ') {
			loadLevel(currLevel);
			dead = false;
		}
		return;
	}

	if(key == 'a') {
		player.left = true;
	}else if(key == 'd') {
		player.right = true;
	}else if(key == ' ' || key == 'w') {
		player.jump();
	}else if(key == 'f') {
		player.shoot();
		player.autofiring = true;
	}else if(key == 'm') {
		toggleMusic();
	}
}

function keyReleased() {
	if(key == 'a') {
		player.left = false;
	}else if(key == 'd') {
		player.right = false;
	}else if(key == 'f') {
		player.autofiring = false;
	}
}

function mousePressed() {
	if(ending) {
		document.getElementById("title").style.display = "";
		document.getElementById("content").style.display = "";
		resizeCanvas(1280, 720);
		return;
	}

	if(inMenu) {
		inMenu = false;
		return;
	}

	if(mouseX > width - 32 && mouseY > height - 32 && mouseX < width && mouseY < height) {
		toggleMusic();
	}else if(message) {
		if(typingMessage.length == message.length) {
			removeMessage();
		}
		typingMessage = message;
	}else{
		// DEBUG
		//meteors.push(entityMeteor(random(360), random(50)));
	}
}

function rotatePoint(x, y, angle) {
	var newx = cos(angle) * x - sin(angle) * y;
    var newy = sin(angle) * x + cos(angle) * y;
    return {x:newx, y:newy};
}

function distSq(x1, y1, x2, y2) {
	return (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);
}

function flipImage(img, horizontal, vertical) {
	var newimg = createImage(img.width, img.height);
	newimg.loadPixels();
	img.loadPixels();

	for(var y = 0; y < img.height; y++) {
		for(var x = 0; x < img.width; x++) {
			var newx = x;
			var newy = y;

			if(horizontal) {
				newx = img.width - x;
			}

			if(vertical) {
				newy = img.height - y;
			}

			var i = (x + y * img.width) * 4;
			var newi = (newx + newy * img.width) * 4;

			newimg.pixels[newi + 0] = img.pixels[i + 0];
			newimg.pixels[newi + 1] = img.pixels[i + 1];
			newimg.pixels[newi + 2] = img.pixels[i + 2];
			newimg.pixels[newi + 3] = img.pixels[i + 3];
		}
	}

	newimg.updatePixels();

	return newimg;
}

function setMessage(msg) {
	message = msg;
	typingMessage = "";
}

function removeMessage() {
	message = undefined;
	typingMessage = "";
}