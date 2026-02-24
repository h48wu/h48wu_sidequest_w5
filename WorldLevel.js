class WorldLevel {
  constructor(json, assets) {
    this.assets = assets;
    
    let bg = this.assets['background'];
    this.bgScale = 2.0; 
    this.w = bg ? bg.width * this.bgScale : 6000;
    this.h = bg ? bg.height * this.bgScale : 4000;
    
    this.target = json.discoverableTarget ?? { x: 1600, y: 1200, note: "Peace." };
    this.sceneryCount = json.sceneryCount ?? 300; // Increased to account for scattered flowers
    
    // We will put ALL visual objects into one array so we can sort them by priority
    this.allObjects = []; 
    this.hiddenSymbols = []; 
    
    this.activeNote = "";
    this.noteAlpha = 0;
    this.thoughts = json.hiddenThoughts ?? ["Breathe."];

    this.generateWorld();
  }

  generateWorld() {
    // Included flowers in the general pool so they scatter everywhere
    const generalSceneryTypes = [
      'tree_1', 'tree_2', 
      'rock_1', 'rock_2', 'rock_3', 'rock_4', 'rock_5',
      'stick_1', 'stick_2', 'sign_1', 'fence_1', 
      'grass_1', 'grass_2', 'grass_3', 'grass_4',
      'flower_1', 'flower_2', 'flower_3', 'flower_4', 
      'flower_5', 'flower_6', 'flower_7', 'flower_8', 'flower_9'
    ];
    
    const flowerTypes = ['flower_1', 'flower_2', 'flower_3', 'flower_4', 'flower_5', 'flower_6', 'flower_7', 'flower_8', 'flower_9'];

    // Helper function to assign rendering priority
    const getPriority = (type) => {
      if (type.startsWith('tree')) return 3; // Highest priority (drawn last, on top)
      if (type.startsWith('rock')) return 2; // Medium priority
      return 1; // Lowest priority (grass, sticks, flowers drawn first, on the bottom)
    };

    // 1. Scatter random scenery and flowers everywhere
    for (let i = 0; i < this.sceneryCount; i++) {
      let type = random(generalSceneryTypes);
      this.allObjects.push({
        type: type,
        x: random(50, this.w - 100), 
        y: random(50, this.h - 100),
        priority: getPriority(type),
        isCluster: false
      });
    }

    // 2. Generate the special dense flowerbed target
    for (let i = 0; i < 50; i++) {
      let angle = random(TWO_PI);
      let radius = random(0, 160); 
      let type = random(flowerTypes);
      this.allObjects.push({
        type: type,
        x: this.target.x + cos(angle) * radius,
        y: this.target.y + sin(angle) * radius,
        priority: getPriority(type), // Priority 1
        isCluster: true
      });
    }

    // 3. SORT EVERYTHING
    // First by priority (Flowers -> Rocks -> Trees). 
    // If priorities are equal, sort by Y-coordinate so objects lower on the screen overlap objects higher up.
    this.allObjects.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return a.y - b.y;
    });

    // 4. Generate hidden symbols
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
    // Draw visual world borders
    push();
    noFill();
    stroke(255, 255, 255, 60); 
    strokeWeight(10);
    rect(0, 0, this.w, this.h);
    pop();

    let currentHoverNote = "";
    let distToTarget = dist(player.x, player.y, this.target.x, this.target.y);

    // Draw the warm glow under the flowerbed FIRST, so it sits behind the sorted objects
    push();
    noStroke();
    let glowAlpha = map(sin(frameCount * 0.03), -1, 1, 20, 60);
    fill(255, 250, 220, glowAlpha); 
    circle(this.target.x, this.target.y, 450);
    pop();

    // Iterate through the properly sorted master list
    for (let obj of this.allObjects) {
      let img = this.assets[obj.type];
      if (!img) continue;

      let drawW = img.width * 0.5;
      let drawH = img.height * 0.5;

      // If it's part of the discoverable flower cluster, gently bloom it when the player is near
      if (obj.isCluster) {
        push();
        if (distToTarget < 200) {
          let scaleEffect = map(distToTarget, 0, 200, 1.2, 1.0);
          translate(obj.x + drawW/2, obj.y + drawH/2);
          scale(scaleEffect);
          image(img, -drawW/2, -drawH/2, drawW, drawH);
          currentHoverNote = this.target.note;
        } else {
          image(img, obj.x, obj.y, drawW, drawH);
        }
        pop();
      } 
      // Otherwise, just draw normal scenery
      else {
        image(img, obj.x, obj.y, drawW, drawH);
      }
    }

    this.drawGuideArrow(player, distToTarget);

    // Draw hidden interactive symbols
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

    // Update the meditative text on the HUD
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