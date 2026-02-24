class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    
    // Smooth, drifting movement variables
    this.vx = 0;
    this.vy = 0;
    this.accel = 0.35;     // INCREASED from 0.08. You will pick up speed much faster now.
    this.friction = 0.92;  // Slightly adjusted so you don't slide out of control at high speeds.
    
    this.pulse = 0;
  }

  updateInput() {
    const dx = (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) - (keyIsDown(LEFT_ARROW) || keyIsDown(65));
    const dy = (keyIsDown(DOWN_ARROW) || keyIsDown(83)) - (keyIsDown(UP_ARROW) || keyIsDown(87));

    this.vx += dx * this.accel;
    this.vy += dy * this.accel;

    this.vx *= this.friction;
    this.vy *= this.friction;

    this.x += this.vx;
    this.y += this.vy;
    
    this.pulse += 0.03;
  }

  draw() {
    push();
    noStroke();
    // Ethereal glowing dot
    for(let i = 3; i > 0; i--) {
      fill(255, 255, 255, 50 / i);
      let size = 20 + i * 15 + sin(this.pulse) * 5; 
      circle(this.x, this.y, size);
    }
    pop();
  }
}