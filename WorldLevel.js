class WorldLevel {
  constructor(json, assets) {
    this.assets = assets;
    
    let bg = this.assets['background'];
    this.bgScale = 2.0; 
    this.w = bg ? bg.width * this.bgScale : 6000;
    this.h = bg ? bg.height * this.bgScale : 4000;
    
    this.target = json.discoverableTarget ?? { x: 1600, y: 1200, note: "Peace." };
    this.sceneryCount = json.sceneryCount ?? 200;
    
    this.scenery = [];
    this.discoverableCluster = [];
    this.hiddenSymbols = []; 
    
    this.activeNote = "";
    this.noteAlpha = 0;
    this.thoughts = json.hiddenThoughts ?? ["Breathe."];

    this.generateWorld();
  }

  generateWorld() {
    const generalSceneryTypes = [
      'tree_1', 'tree_2', 'rock_1', 'rock_2', 'rock_3', 'rock_4', 'rock_5',
      'stick_1', 'stick_2', 'sign_1', 'fence_1', 'grass_1', 'grass_2', 'grass_3', 'grass_4'
    ];
    
    const flowerTypes = ['flower_1', 'flower_2', 'flower_3', 'flower_4', 'flower_5', 'flower_6', 'flower_7', 'flower_8', 'flower_9'];

    for (let i = 0; i < this.sceneryCount; i++) {
      this.scenery.push({
        type: random(generalSceneryTypes),
        x: random(50, this.w - 100), 
        y: random(50, this.h - 100)
      });
    }

    // MAKE IT VISIBLE: Doubled the flowers to 50, widened the radius slightly
    for (let i = 0; i < 50; i++) {
      let angle = random(TWO_PI);
      let radius = random(0, 160); 
      this.discoverableCluster.push({
        type: random(flowerTypes),
        x: this.target.x + cos(angle) * radius,
        y: this.target.y + sin(angle) * radius
      });
    }

    for (let i = 0; i < this.thoughts.length; i++) {
      this.hiddenSymbols.push({
        x: random(400, this.w - 400),
        y: random(400, this.h - 400),
        thought: this.thoughts[i],
        alpha: 0 
      });
    }
  }

  drawBackground() {
    let bg = this.assets['background'];
    if (bg) {
      image(bg, 0, 0, this.w, this.h);
    } else {
      noStroke();
      fill(245, 248, 250);
      rect(0, 0, this.w, this.h); 
    }
  }

  drawWorld(player) {
    push();
    noFill();
    stroke(255, 255, 255, 60); 
    strokeWeight(10);
    rect(0, 0, this.w, this.h);
    pop();

    for (let s of this.scenery) {
      let img = this.assets[s.type];
      if (img) {
        image(img, s.x, s.y, img.width * 0.5, img.height * 0.5);
      }
    }

    let currentHoverNote = "";
    let distToTarget = dist(player.x, player.y, this.target.x, this.target.y);

    // --- VISIBLE FLOWERBED GLOW ---
    // Draws a soft, pulsing warm light underneath the flowers so they are easy to spot
    push();
    noStroke();
    let glowAlpha = map(sin(frameCount * 0.03), -1, 1, 20, 60);
    fill(255, 250, 220, glowAlpha); 
    circle(this.target.x, this.target.y, 450);
    pop();

    // Draw the flowers
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
      currentHoverNote = this.target.note;
    }
    this.drawGuideArrow(player, distToTarget);

    for (let sym of this.hiddenSymbols) {
      let d = dist(player.x, player.y, sym.x, sym.y);
      
      if (d < 150) {
        sym.alpha = lerp(sym.alpha, 255, 0.05);
        currentHoverNote = sym.thought; 
      } else {
        sym.alpha = lerp(sym.alpha, 0, 0.05); 
      }

      if (sym.alpha > 1) {
        push();
        translate(sym.x, sym.y);
        rotate(frameCount * 0.01); 
        
        noFill();
        stroke(255, 255, 255, sym.alpha);
        strokeWeight(2);
        quad(0, -20, 20, 0, 0, 20, -20, 0);
        
        fill(255, 255, 255, sym.alpha * 0.4);
        noStroke();
        circle(0, 0, 15 + sin(frameCount * 0.05) * 5);
        pop();
      }
    }

    if (currentHoverNote !== "") {
      this.activeNote = currentHoverNote;
      this.noteAlpha = lerp(this.noteAlpha, 255, 0.05);
    } else {
      this.noteAlpha = lerp(this.noteAlpha, 0, 0.05);
    }
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