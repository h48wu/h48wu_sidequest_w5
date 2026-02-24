/*
Week 5 — Meditative Camera Experience
Move: WASD/Arrows
*/

const VIEW_W = 800;
const VIEW_H = 480;

let worldData;
let level;
let player;
let assets = {};

let camX = 0;
let camY = 0;

function preload() {
  worldData = loadJSON("world.json");
  
  assets['background'] = loadImage('assets/background.png');
  
  assets['tree_1'] = loadImage('assets/tree_1.png');
  assets['tree_2'] = loadImage('assets/tree_2.png');
  
  assets['flower_1'] = loadImage('assets/flower_1.png');
  assets['flower_2'] = loadImage('assets/flower_2.png');
  assets['flower_3'] = loadImage('assets/flower_3.png');
  assets['flower_4'] = loadImage('assets/flower_4.png');
  assets['flower_5'] = loadImage('assets/flower_5.png');
  assets['flower_6'] = loadImage('assets/flower_6.png');
  assets['flower_7'] = loadImage('assets/flower_7.png');
  assets['flower_8'] = loadImage('assets/flower_8.png');
  assets['flower_9'] = loadImage('assets/flower_9.png');
  
  assets['rock_1'] = loadImage('assets/rock_1.png');
  assets['rock_2'] = loadImage('assets/rock_2.png');
  assets['rock_3'] = loadImage('assets/rock_3.png');
  assets['rock_4'] = loadImage('assets/rock_4.png');
  assets['rock_5'] = loadImage('assets/rock_5.png');
  
  assets['stick_1'] = loadImage('assets/stick_1.png');
  assets['stick_2'] = loadImage('assets/stick_2.png');
  
  assets['sign_1'] = loadImage('assets/sign_1.png');
  assets['fence_1'] = loadImage('assets/fence_1.png');
  
  assets['grass_1'] = loadImage('assets/grass_1.png');
  assets['grass_2'] = loadImage('assets/grass_2.png');
  assets['grass_3'] = loadImage('assets/grass_3.png');
  assets['grass_4'] = loadImage('assets/grass_4.png');
}

function setup() {
  createCanvas(VIEW_W, VIEW_H);
  
  level = new WorldLevel(worldData, assets);

  const start = worldData.playerStart ?? { x: 800, y: 600 };
  player = new Player(start.x, start.y);
  
  camX = player.x - width / 2;
  camY = player.y - height / 2;
}

function draw() {
  player.updateInput();
  
  player.x = constrain(player.x, width / 2, level.w - width / 2);
  player.y = constrain(player.y, height / 2, level.h - height / 2);

  let targetCamX = player.x - width / 2;
  let targetCamY = player.y - height / 2;

  // INCREASED from 0.08 to 0.15 so the camera keeps up with your faster movement
  camX = lerp(camX, targetCamX, 0.15);
  camY = lerp(camY, targetCamY, 0.15);

  background(20);

  push();
  translate(-camX, -camY);
  
  level.drawBackground();
  level.drawWorld(player); 
  player.draw(); 
  
  pop();

  level.drawHUD();
}

function keyPressed() {
  if (key === "r" || key === "R") {
    const start = worldData.playerStart ?? { x: 800, y: 600 };
    player.x = start.x;
    player.y = start.y;
    player.vx = 0;
    player.vy = 0;
  }
}