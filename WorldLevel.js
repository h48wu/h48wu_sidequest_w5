class WorldLevel {
  constructor(json, assets) {
    this.assets = assets;
    
    // Scale the background image up to create a MASSIVE world to explore
    let bg = this.assets['background'];
    this.bgScale = 2.0; 
    this.w = bg ? bg.width * this.bgScale : 6000;
    this.h = bg ? bg.height * this.bgScale : 4000;
    
    this.target = json.discoverableTarget ?? { x: this.w * 0.75, y: this.h * 0.75, note: "Peace." };
    this.sceneryCount = json.sceneryCount ?? 200;
    
    this.scenery = [];
    this.discoverableCluster = [];
    this.activeNote = "";
    this.noteAlpha = 0;

    this.generateWorld();
  }

  generateWorld() {
    const generalSceneryTypes = [
      'tree_1', 'tree_2', 
      'rock_1', 'rock_2', 'rock_3', 'rock_4', 'rock_5',
      'stick_1', 'stick_2', 'sign_1', 'fence_1',
      'grass_1', 'grass_2', 'grass_3', 'grass_4'
    ];
    
    const flowerTypes = [
      'flower_1', 'flower_2', 'flower_3', 'flower_4', 
      'flower_5', 'flower_6', 'flower_7', 'flower_8', 'flower_9'
    ];

    // Scatter general scenery safely INSIDE the massive world borders
    for (let i = 0; i < this.sceneryCount; i++) {
      let type = random(generalSceneryTypes);
      this.scenery.push({
        type: type,
        x: random(50, this.w - 100), 
        y: random(50, this.h - 100)
      });
    }

    // Generate the discoverable flower cluster
    for (let i = 0; i < 25; i++) {
      let angle = random(TWO_PI);
      let radius = random(0, 120); 
      let type = random(flowerTypes);
      this.discoverableCluster.push({
        type: type,
        x: this.target.x + cos(angle) * radius,
        y: this.target.y + sin(angle) * radius
      });
    }
  }

  drawBackground() {
    let bg = this.assets['background'];
    if (bg) {
      // DRAW THE MASSIVE BACKGROUND
      // Because this is now inside the translate() block in sketch.js, the camera will pan over it.
      image(bg, 0, 0, this.w, this.h);
    } else {
      noStroke();
      fill(245, 248, 250);
      rect(0, 0, this.w, this.h); 
    }
  }

  drawWorld(player) {
    // Draw visual world borders
    push();
    noFill();
    stroke(255, 255, 255, 60); 
    strokeWeight(10);
    rect(0, 0, this.w, this.h);
    pop();

    // Draw randomly placed scenery scaled down by 0.5x to emphasize the vastness
    for (let s of this.scenery) {
      let img = this.assets[s.type];
      if (img) {
        let drawW = img.width * 0.5;
        let drawH = img.height * 0.5;
        image(img, s.x, s.y, drawW, drawH);
      }
    }

    // Draw the secret flower cluster
    let distToTarget = dist(player.x, player.y, this.target.x, this.target.y);
    
    for (let f of this.discoverableCluster) {
      let fImg = this.assets[f.type];
      if (!fImg) continue;

      let drawW = fImg.width * 0.5;
      let drawH = fImg.height * 0.5;

      push();
      if (distToTarget < 200) {
        let scaleEffect = map(distToTarget, 0, 200, 1.2, 1.0);
        translate(f.x + drawW/2, f.y + drawH/2);
        scale(scaleEffect);
        image(fImg, -drawW/2, -drawH/2, drawW, drawH);
      } else {
        image(fImg, f.x, f.y, drawW, drawH);
      }
      pop();
    }

    if (distToTarget < 200) {
      this.activeNote = this.target.note;
      this.noteAlpha = lerp(this.noteAlpha, 255, 0.05);
    } else {
      this.noteAlpha = lerp(this.noteAlpha, 0, 0.05);
    }

    this.drawGuideArrow(player, distToTarget);
  }

  drawGuideArrow(player, distToTarget) {
    if (distToTarget > 250) {
      let dx = this.target.x - player.x;
      let dy = this.target.y - player.y;
      let angle = atan2(dy, dx);

      push();
      translate(player.x, player.y);
      rotate(angle);
      translate(60, 0); 

      fill(255, 255, 255, 150);
      noStroke();
      triangle(10, 0, -6, 6, -6, -6);
      
      fill(255, 255, 255, 40);
      circle(0, 0, 25);
      pop();
    }
  }

  drawHUD() {
    if (this.noteAlpha > 1) {
      push();
      textAlign(CENTER);
      textSize(24);
      fill(50, this.noteAlpha); 
      text(this.activeNote, width / 2, height - 80);
      pop();
    }
  }
}