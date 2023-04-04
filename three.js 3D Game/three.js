import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();

const aspect = innerWidth / innerHeight;
const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
camera.position.set(2.67, 2.72, 7.5);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);
renderer.setClearColor("#0c4a6e");

const controls = new OrbitControls(camera, renderer.domElement);

// light
const light = new THREE.DirectionalLight(0xffffff, 1);
scene.add(new THREE.AmbientLight(0xffffff, 0.5));
light.position.set(0, 3, 2)
scene.add(light);

// Shadow
renderer.shadowMap.enabled = true;
light.castShadow = true;

class Box extends THREE.Mesh {
  constructor ({width, height, depth, color = "#00ff00", velocity, position, zEnabled}) {
    super ( new THREE.BoxGeometry(width, height, depth), 
    new THREE.MeshStandardMaterial( { color }) )
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.position.set(position.x, position.y, position.z);
    this.bottom = this.position.y - this.height / 2; // box
    this.top = this.position.y + this.height / 2; // ground
    this.velocity = velocity;
    this.gravity = -0.002;
    this.zEnabled = zEnabled;
  };
  
  update(ground) {
    this.bottom = this.position.y - this.height / 2;
    this.top = this.position.y + this.height / 2;
    
    if (this.zEnabled) {
      this.velocity.z += 0.0003;
    };
    
    this.position.x += this.velocity.x;
    this.position.z += this.velocity.z;
    this.applyGravity(ground);
  };
  
  applyGravity() {
    this.velocity.y += this.gravity;
    if ( 
      this.bottom + this.velocity.y <= ground.top &&
      this.position.x - this.width / 2 <= ground.width / 2  &&
      this.position.x - this.width / 2 <= ground.width / 2 && 
      this.position.x + ground.width / 2 >= -ground.height &&
      this.position.z - this.depth / 2 <= ground.depth / 2 &&
      this.position.z + this.depth / 2 >= -ground.depth / 2 
      ) {
      this.velocity.y *= 0.6;
      this.velocity.y = -this.velocity.y / 1.5;
    } else this.position.y += this.velocity.y
  }
}

let box = new Box (
  {
    width: 1,
    height: 1,
    depth: 1,
    velocity: {
      x: 0,
      y: -0.01,
      z: 0,
    },
    position: {
      x: 0,
      y: 0,
      z: 0,
    },
    zEnabled: false,
  }
);

box.castShadow = true;
scene.add(box);

let ground = new Box(
  {
    width: 15,
    height: 0.5,
    depth: 50,
    color: "#0369a1",
    position: {
      x: 0,
      y: -2,
      z: 0,
    },
    zEnabled: false,
  }
);

ground.receiveShadow = true;
scene.add(ground);

let enemy = new Box (
  {
    width: 1,
    height: 1,
    depth: 1,
    velocity: {
      x: 0,
      y: -0.01,
      z: 0.05,
    },
    position: {
      x: 0,
      y: 0,
      z: -20,
    },
    color: "red",
    zEnabled: true,
  }
);

let enemies = [enemy];

enemy.castShadow = true;
scene.add(enemy);

// setup animation movement
let keyStatus = {
  w: {
    press: false,
  },
  d: {
    press: false,
  },
  a: {
    press: false,
  },
  s: {
    press: false,
  },
  space: {
    press: false,
  },
}

let lastKey = "";

addEventListener("keydown", (e) => {
  let key = e.key;
  switch (key) {
    case "w":
      keyStatus.w.press = true;
      lastKey = "w";
    break;
    case "d":
      keyStatus.d.press = true;
      lastKey = "d";
    break;
    case "a":
      keyStatus.a.press = true;
      lastKey = "a";
    break;
    case "s":
      keyStatus.s.press = true;
      lastKey = "s";
    break;
    case " ":
      if (box.velocity.y >= 0) {
        keyStatus.space.press = true;
        lastKey = "space";
        if (box.position.y < 0.07) {
          box.velocity.y = 0.07;
        }
      }
    break;
  };
})

addEventListener("keyup", (e) => {
  let key = e.key;
  switch (key) {
    case "w":
      keyStatus.w.press = false;
      box.velocity.z = 0;
    break;
    case "d":
      keyStatus.d.press = false;
      box.velocity.x = 0;
    break;
    case "a":
      keyStatus.a.press = false;
      box.velocity.x = 0;
    break;
    case "s":
      keyStatus.s.press = false;
      box.velocity.z = 0;
    break;
    case " ":
      keyStatus.space.press = false;
    break;
  };
})


// swapping the enemy: 
let frame = 0;
let positionRandom = Math.floor(Math.random() * (ground.width / 2));
let arrPosition = [positionRandom, -positionRandom];
let randomPositionToArr = Math.floor(Math.random() * arrPosition.length);

// end game senary
let endGame = false;

function animate() {
  
  if (endGame != true) {
    requestAnimationFrame(animate);
  };
  
  renderer.render(scene, camera);
  
  box.update(ground);
  
  // start swapping enemies
  frame++;
  
  if (frame % 20 === 0) {
    let positionRandom = Math.floor(Math.random() * (ground.width / 2));
    let arrPosition = [positionRandom, -positionRandom];
    let randomPositionToArr = Math.floor(Math.random() * arrPosition.length);
    
    let swappingEnemy = new Box (
      {
        width: 1,
        height: 1,
        depth: 1,
        velocity: {
          x: 0,
          y: -0.01,
          z: 0.02,
        },
        position: {
          x: 0,
          y: 0,
          z: -20,
        },
        color: "red",
        zEnabled: true,
      }
    );
    
    arrPosition.forEach(() => {
      swappingEnemy.position.x = arrPosition[randomPositionToArr];
    });
    
    enemies.push(swappingEnemy);
    swappingEnemy.castShadow = true;
    scene.add(swappingEnemy);
  };
    // control enemies
    enemies.forEach((enemy) => {
    enemy.update(ground);
    
    arrPosition.forEach(() => {
      enemies[0].position.x = arrPosition[randomPositionToArr];
    });
    // end game
    if (
      enemy.position.z <= box.position.z + box.width  &&
      enemy.position.z >= box.position.z - box.width &&
      box.position.y >= enemy.position.y - enemy.height &&
      box.position.y <= enemy.position.y + enemy.height &&
      box.position.x >= enemy.position.x - enemy.width && 
      box.position.x <= enemy.position.x + enemy.width
      ) {
      endGame = true;
    };
  })
  
  if (box.position.z <= (-ground.depth / 2) + 4) {
    console.log("You wen");
  };
  
  // movement
  if (keyStatus.w.press && lastKey == "w" ) {
    box.velocity.z = -0.04;
  } else if (keyStatus.d.press && lastKey == "d") {
    box.velocity.x = 0.04;
  } else if (keyStatus.a.press && lastKey == "a") {
    box.velocity.x = -0.04;
  } else if (keyStatus.s.press && lastKey == "s") {
    box.velocity.z = 0.04;
  }
};

animate();