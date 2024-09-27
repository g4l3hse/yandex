let particles = [];
let colors = ["#04080F", "#1451ff", "#39ff14", "#14ffc2", "#FFDDA1"];
let blobs = [];
let variation = 0;
let xScale, yScale, centerX, centerY;
let changeDuration = 2000;
let lastChange = 0;
let startAnimation;

let handPose;
let video;
let hands = [];
let pinch = 0; 
let pinchPosition = { x: null, y: null };

let textDisplayed = false;

function preload() {
  handPose = ml5.handPose();
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  background("#1a0633");

  video = createCapture(VIDEO,{ flipped:true });
  video.size(640, 480);
  video.hide();
  handPose.detectStart(video, gotHands);

  startAnimation = new StartAnimation();

  xScale = width / 20;
  yScale = height / 20 * (width / height);
  centerX = width / 2;
  centerY = height / 2;
}

function draw() {
  if (hands.length > 0) {
    let finger = hands[0].index_finger_tip;
    let thumb = hands[0].thumb_tip;
    pinch = dist(finger.x, finger.y, thumb.x, thumb.y);
    
    pinchPosition.x = map((finger.x + thumb.x) / 2, video.width, 0, 0, width);
pinchPosition.y = map((finger.y + thumb.y) / 2, 0, video.height, 0, height);

  }

  if (startAnimation) {
    startAnimation.update();
    startAnimation.draw();

    if (pinch > 50) {
      startAnimation = null;
    }
  } else {
    
    if (pinch > 50 && pinchPosition.x !== null && pinchPosition.y !== null) { 

      stroke(255, 255, 255, 100);
      strokeWeight(5);
      noFill();
      ellipse(pinchPosition.x, pinchPosition.y, 70);

      for (let i = 0; i < 5; i++) {
        let newP = new Particle({
          v: createVector(random(-2, 2), random(-2, 2)).mult(2),
          p: createVector(pinchPosition.x, pinchPosition.y), 
          color: color(random(colors)),
          a: createVector(0, 0),
          r: random(5) * random()
        });
        particles.push(newP);
      }

      for (let i = 0; i < 20; i++) {
        let x = pinchPosition.x + random(-100, 100);
        let y = pinchPosition.y + random(-100, 100); 
        let blob = {
          x: getXPos(x),
          y: getYPos(y),
          size: random(1, 5),
          lastX: x,
          lastY: y,
          color: colors[floor(random(colors.length))],
          direction: createVector(random([-1, 1]), random([-1, 1])).mult(random(0.5, 1))
        };
        blobs.push(blob);
      }
    }

    particles.forEach(p => {
      p.update();
      p.draw();
    });

    let length = blobs.length;
    if (length == 0) {
      restartSketch();
      return;
    }

    noStroke();
    fill(26, 6, 51, 10);
    rect(0, 0, width, height);

    let time = millis();
    if (time - lastChange > changeDuration) {
      lastChange = time;
      variation++;
      if (variation > 11) variation = 0;
    }

    let stepsize = deltaTime * 0.002;
    for (let i = length - 1; i >= 0; i--) {
      let blob = blobs[i];

      let x = getSlopeX(blob.x, blob.y);
      let y = getSlopeY(blob.x, blob.y);
      blob.x += blob.direction.x * x * stepsize;
      blob.y += blob.direction.y * y * stepsize;

      x = getXPrint(blob.x);
      y = getYPrint(blob.y);
      stroke(blob.color);
      strokeWeight(blob.size);
      line(x, y, blob.lastX, blob.lastY);
      blob.lastX = x;
      blob.lastY = y;

      const border = 200;
      if (x < -border || y < -border || x > width + border || y > height + border) {
        blobs.splice(i, 1);
      }
    }
  }
}

function restartSketch() {
  particles = [];
  blobs = [];
  startAnimation = new StartAnimation();
  //background("#1a0633");
}

function gotHands(results) {
  hands = results;
}

function keyPressed() {
  if (key === ' ') {
    saveCanvas('thisIsMe', 'png');
  }
}

class StartAnimation {
  constructor() {
    this.particles = [];
    for (let i = 0; i < 400; i++) {
      let newP = new Particle({
        v: createVector(random(-2, 2), random(-2, 2)).mult(2),
        p: createVector(width / 2, height / 2),
        color: color(random(colors)),
        a: createVector(0, 0),
        r: random(5) * random()
      });
      this.particles.push(newP);
    }
  }

  update() {
    this.particles.forEach(p => {
      p.update();
    });
  }

  draw() {
    this.particles.forEach(p => {
      p.draw();
    });
  }
}

class Particle {
  constructor(args) {
    let def = {
      p: createVector(0, 0),
      v: createVector(0, 0),
      a: createVector(0, 0),
      color: color(255),
      r: 30,
    };
    Object.assign(def, args);
    Object.assign(this, def);
  }

  draw() {
    push();
    translate(this.p);
    noStroke();
    fill(this.color);
    circle(0, 0, this.r);
    if (random() < 0.05) {
      stroke(this.color);
      noFill();
      circle(0, 0, this.r * 4);
    }
    pop();
  }

  update() {
    this.p.add(this.v);
    this.v.add(this.a);
    this.v.limit(this.r * 3);
    this.v.mult(0.9995);
    if (frameCount % 40 == 0) {
      this.v.x = random([-1, 0, 1]);
      this.v.y = random([-1, 0, 1]);
    }
    this.r *= 0.99;
  }
}

function getSlopeY(x, y) {
  switch (variation) {
    case 0: return (x % 20) - 10;
    case 1: return (y % 20) - 10;
    case 2: return (x % 20) - 10;
    case 3: return (y % 20) - 10;
    case 4: return (x % 20) - 10;
    case 5: return (y % 20) - 10;
    case 6: return Math.tan(x);
    case 7: return -Math.sin(x * 0.1) * 3;
    case 8: return (x - x * x * x) * 0.01;
    case 9: return -Math.sin(x);
    case 10: return -y - Math.sin(1.5 * x) + 0.7;
    case 11: return Math.sin(x) * Math.cos(y);
  }
}

function getSlopeX(x, y) {
  switch (variation) {
    case 0: return (y % 20) - 10;
    case 1: return (x % 20) - 10;
    case 2: return (y % 20) - 10;
    case 3: return (x % 20) - 10;
    case 4: return (y % 20) - 10;
    case 5: return (x % 20) - 10;
    case 6: return Math.tan(y);
    case 7: return Math.sin(y * 0.1) * 3;
    case 8: return y / 3;
    case 9: return -y;
    case 10: return -1.5 * y;
    case 11: return Math.sin(y) * Math.cos(x);
  }
}

function getXPos(x) {
  return (x - centerX) / xScale;
}

function getYPos(y) {
  return (y - centerY) / yScale;
}

function getXPrint(x) {
  return xScale * x + centerX;
}

function getYPrint(y) {
  return yScale * y + centerY;
}
