let GameState = 0;
let scl = 50, extension = 5, day_in_secconds = 10;
let tiles, camera, selection, resources, gui, house_img, lmart_img;
let firstRun = true;
let structures = [ 
  ["Grass",           10,   0,  68, 189,  50,   0, "None"       ,  0,   0, "Nothing"              ,  0,  0], 
  ["Solar Panel",     1000, 1,  58, 107, 173,  10, "Electricity",  0,   0, "Electricity Creator"  ,  0,  0],
  ["House",           250,  2, 235,  47,   6,   0, "None"       ,  5,   5, "People Container"     ,  0,  5],
  ["Battery",         100,  3,  33,  33,  33,   0, "None"       ,  0, 200, "Electricity Container",  0,  0],
  ["Road",            50,   5,  33,  33,  33,   0, "None"       ,  0,   0, "Path"                 ,  0,  0],
  ["Lmart",           500,  6, 255, 255, 255, 250, "Money"      , 10,   0, "Money Creator"        , 15, 10],
  ["Water Tower",     700,  7, 251, 197,  49,   0, "None"       ,  0, 400, "Water Container"      ,  0,  0],
  ["Water Generator", 1250, 8,   0,   0,   0,  50, "Water"      , 10,   0, "Water Creator"        ,  2,  0],
  ["Nothing",         0,    4, 255, 255, 255,   0, "None"       ,  0,   0, "Nothing"              ,  0,  0],
];
// NAME, PRICE, INDEX, R, G, B, RENDEMENT, TYPE D'ENERGIE YIELDED, ELECRICITY USE, MAX_CAPACITY, 
// TYPE OF BUILDING, MIN_POPULATION TO WORK, WATER USE
function Resources() {
  this.money = 10000; this.electricity = 0; this.frames = 0; this.population = 0; this.water = 10;
  this.freeWorkers = 0;
  this.do_its_thing = function() {
    this.render(); this.update();
  }
  this.render = function() {
    stroke(0); strokeWeight(1); textAlign(CENTER); textSize(scl/2); 
      fill(76, 209, 55); 
        rect(width-3*scl, 0, 3*scl, scl);
    fill(255); text("€", width-3*scl+scl/2, scl / 1.5);
    fill(255); text(this.money, width-2*scl+scl/2, scl / 1.5);
    fill(76, 209, 55); rect(0, 0, 3*scl, scl);
    fill(255); text("Elec.", scl / 2 + 10, scl / 1.5);
    fill(255); text(this.electricity, 2*scl, scl / 1.5);
    stroke(0); strokeWeight(1); fill(76, 209, 55); rect(3*scl, 0, 3*scl, scl);
    fill(255); text("Pop.", scl / 2 + 10 + 3*scl, scl / 1.5);
    fill(255); text(this.population, 2*scl+3*scl, scl / 1.5);
    fill(76, 209, 55); rect(6*scl, 0, 3*scl, scl);
    fill(255); text("Water", scl / 2 + 15 + 6*scl, scl / 1.5);
    fill(255); text(this.water, 2*scl+6*scl, scl / 1.5);
    fill(76, 209, 55); rect(9*scl, 0, 5*scl, scl);
    fill(255); textAlign(LEFT);
      text("Free Workers", 9*scl + 10, scl / 1.5);
      textAlign(CENTER); text(this.freeWorkers, 13*scl, scl / 1.5);
  }
  this.update = function() {
    let elec = 0, Battery_index = 3, total_electricity_usage = 0, pop = 0, pop_required = 0, water = 0;
    let total_water_usage = 0;
    for (let i = 0; i < tiles.length; i ++) {
      elec += tiles[i].contained_energy; 
      total_electricity_usage += structures[tiles[i].i][8];
      pop += tiles[i].contained_people;
      pop_required += structures[tiles[i].i][11];
      water += tiles[i].contained_water;
      total_water_usage += structures[tiles[i].i][12];
    }
    this.electricity = elec; this.population = pop; this.water = water; this.freeWorkers = this.population - pop_required;
    if(this.frames <= 30*day_in_secconds) {this.frames ++;} else {
      this.frames = 0; this.electricity -= total_electricity_usage;
      let total_to_be_removed = total_electricity_usage;
      let total_water_to_be_removed = total_water_usage;
      let SolarPanelIndex = 1; GeneratedElectricity = 0; GeneratedWater = 0;
      for (let i = 0; i < tiles.length; i ++) {
        if(structures[tiles[i].i][10] === "Electricity Container") {
          electricity_able_to_remove = tiles[i].contained_energy;
          electricity_to_remove = 0;
          if(electricity_able_to_remove >= total_to_be_removed) {
            electricity_to_remove = electricity_able_to_remove - total_to_be_removed;
            tiles[i].contained_energy -= total_to_be_removed;
            total_to_be_removed = 0;
          } else {
            electricity_to_remove = electricity_able_to_remove;
            tiles[i].contained_energy -= electricity_to_remove;
            total_to_be_removed -= electricity_to_remove;
          }
        } else if(structures[tiles[i].i][10] === "Water Container") {
          water_able_to_remove = tiles[i].contained_water;
          water_to_remove = 0;
          if(water_able_to_remove >= total_water_to_be_removed) {
            water_to_remove = water_able_to_remove - total_water_to_be_removed;
            tiles[i].contained_water -= total_water_to_be_removed;
            total_water_to_be_removed = 0;
          } else {
            water_to_remove = water_able_to_remove;
            tiles[i].contained_water -= water_to_remove;
            total_water_to_be_removed -= water_to_remove;
          }
        }
        if(structures[tiles[i].i][10] === "Money Creator") {
          this.money += structures[tiles[i].i][6];
        }
        if(structures[tiles[i].i][10] === "People Container") {
          tiles[i].contained_people = structures[tiles[i].i][9];
        }
        if(structures[tiles[i].i][10] === "Electricity Creator") {
          GeneratedElectricity += structures[tiles[i].i][6];
        }
        if(structures[tiles[i].i][10] === "Water Creator") {
          GeneratedWater += structures[tiles[i].i][6];
        }
      }
      EnergyLeftToBeStored = GeneratedElectricity;
      ELTBS = GeneratedWater;
      for (let i = 0; i < tiles.length; i ++) {
        current = tiles[i].contained_energy; maximum = structures[Battery_index][9];
        c = tiles[i].contained_water; m = structures[tiles[i].i][9];
        if (structures[tiles[i].i][10] === "Electricity Container") {
          diff = maximum-current;
          if(EnergyLeftToBeStored <= diff) {
            tiles[i].contained_energy += EnergyLeftToBeStored;
            EnergyLeftToBeStored = 0;            
          } else {tiles[i].contained_energy += diff; EnergyLeftToBeStored -= diff;}
        } else if(structures[tiles[i].i][10] === "Water Container") {
          diff = m-c;
          if(ELTBS <= diff) {
            tiles[i].contained_water += ELTBS;
            ELTBS = 0;
          } else {tiles[i].contained_water += diff; ELTBS -= diff;}
        }
      }
      if(firstRun === false) {if(this.population < pop_required || this.electricity < 0 || total_water_usage > water) {endGame();}} 
      else {firstRun = false;}
    }
  }
}
function Selection() {
  this.xonscreen = 0, this.yonscreen = 0, this.visible = true;
  this.render = function() {
    if(this.visible == true) {
      stroke(0); strokeWeight(2); noFill(); rect(this.xonscreen, this.yonscreen, scl, scl);
    }
  }
}
function Camera() {
  this.xoffset = 0; this.yoffset = 0;
  this.getx = function(x) {return x+this.xoffset;}
  this.gety = function(y) {return y+this.yoffset;}
  this.revx = function(x) {return x-this.xoffset;}
  this.revy = function(y) {return y-this.yoffset;}}
function object_render(x, y, rgb, index, s, a) {
  let Tsize = scl; if(s) {Tsize = s;}
  let Ta = 0;
  if(a > 0) {Ta = a;}
  push();
    translate(camera.getx(x) + Tsize / 2, camera.gety(y) + Tsize / 2); 
    angleMode(DEGREES); rotate(Ta);
    stroke(0); strokeWeight(0.25); fill(rgb[0], rgb[1], rgb[2]); 
    rect(-Tsize / 2, -Tsize / 2, Tsize, Tsize);
    if(structures[index][2] === 1) {
      noStroke(); fill(245, 246, 250);
      rect(-Tsize / 2, -Tsize / 2, 2, Tsize); rect(-Tsize / 2 - 1 + Tsize / 3, -Tsize / 2, 2, Tsize); rect(-Tsize / 2 - 1 + 2*Tsize / 3, -Tsize / 2, 2, Tsize); rect(-Tsize / 2 - 2 + Tsize, -Tsize / 2, 2, Tsize);
    } else if(structures[index][2] === 2) {
      image(house_img, -Tsize / 2, -Tsize / 2, Tsize, Tsize);
    } else if(structures[index][2] == 3) {
      stroke(251, 197, 49); strokeWeight(2); 
        line(-Tsize / 2,   -Tsize / 2+1, Tsize / 2,    -Tsize / 2+1);
        line(-Tsize / 2,   Tsize / 2-1,  Tsize / 2,    Tsize / 2-1);
        line(-Tsize / 2+1, -Tsize / 2,   -Tsize / 2+1, Tsize / 2);
        line(Tsize / 2-1,  -Tsize / 2,   Tsize / 2-1,  Tsize / 2);
      fill(251, 197, 49); textAlign(CENTER); textSize(scl / 1.5);
        text("B", 0, 0 + 1/4*scl);
    } else if(structures[index][2] === 5) {
      fill(251, 197, 49); 
        rect(-Tsize / 2, -Tsize / 2, Tsize, Tsize / 4); 
        rect(-Tsize / 2, -Tsize / 2 + 3 / 4 * Tsize, Tsize, Tsize / 4);
      fill(83, 92, 104);
        rect(-Tsize / 2, -Tsize / 2 + 2 / 8 * Tsize, Tsize, Tsize / 8);
        rect(-Tsize / 2, -Tsize / 2 + Tsize - Tsize / 4 - Tsize / 8, Tsize, Tsize / 8);
    } else if(structures[index][2] === 6) {
      noStroke(); image(lmart_img, -Tsize / 2, -Tsize / 2, Tsize, Tsize);
    } else if(structures[index][2] === 7) {
      noStroke(); ellipseMode(CENTER); 
        fill(213, 221, 234); ellipse(0, 0, Tsize, Tsize);
        fill(94, 216, 249);  ellipse(0, 0, 0.8 * Tsize, 0.8 * Tsize);
    }
  pop();
}
function tile(x, y, index) {
  this.x = x; this.y = y; this.i = index; this.rgb = [structures[index][3], structures[index][4], structures[index][5]];
  this.angle = 0; this.contained_energy = 0; this.contained_people = 0; this.contained_water = 0;
  this.initVariables = function(index) {
    this.contained_energy = 0; this.angle = 0; this.contained_people = 0; this.contained_water = 0;
    if(structures[index][10] === "People Container") {this.contained_people = structures[index][9];}
  }
  this.render = function() {
    object_render(this.x, this.y, this.rgb, this.i, 0, this.angle);
  }
  this.modify = function(index) {
    this.i = index; this.rgb = [structures[index][3], structures[index][4], structures[index][5]];
    this.initVariables(index);
  }
  this.initVariables(index);}
function delete_tile(bx, by) {
  let x = camera.revx(bx), y = camera.revy(by);
  for (let i = 0; i < tiles.length; i ++) {
    let tx = tiles[i].x, ty = tiles[i].y;
    if(tx + scl > x && tx < x) {
      if(ty + scl > y && ty < y) {
        tiles[i].modify(4);
      }
    }
  }
}
function Shop() {
  this.selected = true; this.item_waiting_to_be_placed = false; this.item_index = 0; this.yoffset = 0;
  this.render = function() {
    if(this.selected == true) {
      let x = gui.x, y = gui.y + this.yoffset, s = gui.h / 5;
      for(let i = 0; i < structures.length; i ++) {
        if(y >= gui.y && y + s <= gui.y + gui.h) {
          rgb = [structures[i][3], structures[i][4], structures[i][5]]; 
          object_render(camera.revx(x), camera.revy(y), rgb, i, s);
          fill(255); textSize(20); textAlign(LEFT); textStyle(NORMAL);
          text(structures[i][0], x + s + 15, y + s / 2 + 20 / 4);
          stroke(255); strokeWeight(2); line(x, y + s, x + gui.w, y + s);
          textAlign(LEFT); textSize(15);
            let tx = gui.x + gui.w - 1 / 5*gui.w; let ty = y + s / 2 - 1/4*s; let diff = 2.5;
              text("Type of Energy : " + structures[i][7], gui.x + gui.w - 1/5*gui.w, y + s / 2 - 1/4*s + diff);
              text("Yield : " + structures[i][6], tx, ty + 1 / 4 * s + 2*diff);
              text("Use of Energy : " + structures[i][8], tx, ty + 2 / 4 * s + 3*diff);
            tx -= 1.5 / 5*gui.w;
              text("Type of Structure : " + structures[i][10], tx, y + s / 2 - 1/4*s + diff);
              text("max Pop. / Capacity : " + structures[i][9], tx, ty + 1 / 4 * s + 1*diff);
              text("Price : " + structures[i][1] + " €", tx, ty + 2 / 4 * s + 3*diff);
            tx -= 1 / 5*gui.w
              text("Required Workers : " + structures[i][11], tx, y + s / 2 - 1/4*s + diff);
              text("Water Use : " + structures[i][12], tx, ty + 1 / 4 * s + 1*diff);
        }
        y += s;
      }
      fill(255); line(gui.x, gui.y, gui.x + gui.w, gui.y); line(gui.x + s, gui.y, gui.x + s, gui.y + gui.h);
    }
    fill(255); line(gui.x, gui.y, gui.x, gui.y + gui.h); line(gui.x + gui.w, gui.y, gui.x + gui.w, gui.y + gui.h);
  }
  this.scrollUp = function()   {if(this.yoffset <= -scl) {this.yoffset += gui.h / 5;}}
  this.scrollDown = function() {this.yoffset -= gui.h / 5;}
  this.pick_item = function() {
    let x = gui.x, y = gui.y + this.yoffset, s = gui.h / 5;
    for(let i = 0; i < structures.length; i ++) {
      if(x + s > mouseX && x < mouseX) {
        if(y + s > mouseY && y < mouseY) {
          let price = structures[i][1], nw = structures[i][11];
          if(resources.money - price >= 0 && resources.freeWorkers >= nw) {resources.money -= price; this.item_index = i; this.item_waiting_to_be_placed = true; gui.open = false;}
          break;
        }
      }
      y += s;
    }
  }
  this.place_element = function() {
    for(let i = 0; i < tiles.length; i ++) {
      let tx = tiles[i].x; let ty = tiles[i].y;
      if(tx + scl > camera.revx(mouseX) && tx < camera.revx(mouseX)) {
        if(ty + scl > camera.revy(mouseY) && ty < camera.revy(mouseY)) {
          if(tiles[i].i === 0 || tiles[i].i === 4) {
            tiles[i].i = this.item_index; this.item_waiting_to_be_placed = false; gui.open = false;
            tiles[i].rgb = [structures[this.item_index][3], structures[this.item_index][4], structures[this.item_index][5]];
          }
          break;
        }
      }
    }
  }
}
function Gui() {
  this.w = width-50*2; this.h = height-50*2; this.x = 50; this.y = 50; this.open = false;
  this.shop = new Shop();
  this.render = function() {
    if(this.open == true) {
      noStroke(); fill(38, 50, 56);  rect(this.x, this.y, this.w, this.h);
      this.shop.render();
    }
  }
  this.action = function(action) {
    if(action === "m") {if(this.open == true) {this.open = false;} else {this.open = true;}}
  }
}
function setup() {
  createCanvas(1000, 500); frameRate(30);
  tiles = []; camera = new Camera(); selection = new Selection(); resources = new Resources();
  house_img = loadImage("house.png"); lmart_img = loadImage("lmart.png");
  gui = new Gui();
  for (x = -scl*extension; x <= width+extension*scl-scl; x += scl) {
    for (y = -scl*extension; y <= height+extension*scl-scl; y += scl) {
      let index = 0;
      if(camera.getx(x) === 0     && camera.gety(y) === scl) {index = 2;}
      if(camera.getx(x) === scl   && camera.gety(y) === scl) {index = 1;}
      if(camera.getx(x) === 2*scl && camera.gety(y) === scl) {index = 3;}
      tiles.push(new tile(x, y, index));
    }
  }
}
function draw() {
  clear(); background(0, 168, 255);
  if(GameState === 0) {
    cursor(HAND); textAlign(CENTER); fill(255); textSize(80); text("PLAY", width / 2, height / 2 + 1 / 4 * 80);
  } else if(GameState === 1) {
    cursor(ARROW);
    let sx = 0, sy = 0;
    for (let i = 0; i < tiles.length; i ++) {
      tiles[i].render();
      tx = camera.getx(tiles[i].x); ty = camera.gety(tiles[i].y);
      if(tx < mouseX && tx + scl > mouseX) {
        if(ty < mouseY && ty + scl > mouseY) {
          sx = tx; sy = ty;
        }
      }
    }
    selection.xonscreen = sx; selection.yonscreen = sy;
    selection.render(); resources.do_its_thing();
    gui.render();
  } else if(GameState === 2) {
    cursor(HAND); textAlign(CENTER); fill(255); textSize(80); 
      text("You've Lost", width / 2, height / 2 + 1 / 4 * 80);
      textSize(40);
      reason = "";
      if(resources.population < resources.pop_required) {
        reason = "Not All The Jobs Were filled !";
      } else if(resources.electricity < 0) {
        reason = "Out of Electricity !";
      } else if(total_water_usage > water) {
        reason = "Out Of Water !";
      }
      text("Reason : "+reason, width / 2, height / 2 + 1 / 4 * 80 + 50)
  }
}
function mousePressed() {
  if(mouseButton === "left") {
    if(GameState === 0) {
      GameState = 1;
    }
    if(gui.shop.selected == true && gui.shop.item_waiting_to_be_placed == true) {
      gui.shop.place_element();
    } else if(gui.shop.selected == true && gui.shop.item_waiting_to_be_placed == false) {
      gui.shop.pick_item();
    }
  } else if(mouseButton === "right") {
    gui.action("m");
  }
}
function keyPressed() {
  if(GameState === 0) {

  } else if(GameState === 1) {
    diff = scl;
    if(gui.open === false) {
      if(keyCode === UP_ARROW)    {camera.yoffset += diff;}
      if(keyCode === DOWN_ARROW)  {camera.yoffset -= diff;}
      if(keyCode === LEFT_ARROW)  {camera.xoffset += diff;}
      if(keyCode === RIGHT_ARROW) {camera.xoffset -= diff;}
      if(keyCode === 82)          {
        let x = camera.revx(mouseX), y = camera.revy(mouseY);
        for (let i = 0; i < tiles.length; i ++) {
          let tx = tiles[i].x, ty = tiles[i].y;
          if(tx + scl > x && tx < x) {
            if(ty + scl > y && ty < y) {
              if(tiles[i].angle === 360) {tiles[i].angle = 90;} else {tiles[i].angle += 90;}
              break;
            }
          }
        }
      }
    } else if(gui.open === true && gui.shop.selected === true) {
      if(keyCode === UP_ARROW)    {gui.shop.scrollUp();}
      if(keyCode === DOWN_ARROW)  {gui.shop.scrollDown();}
    }
    if(keyCode === 77)            {gui.action("m");}
  }
}
function endGame() {
  GameState = 2;
}