function createScene() {
  const scene = new THREE.Scene();
  scene.add(new THREE.AmbientLight(0x888888));

  const light = new THREE.DirectionalLight('#FFFFFF', 1);
  light.position.set(0, 0, 10);
  scene.add(light);

  return scene;
}

function createWall() {
  const geom = new THREE.BoxGeometry(1, 1, 0.4);
  const mat = new THREE.MeshLambertMaterial({ color: '#153C4E' });

  const wall = new THREE.Mesh(geom, mat);
  wall.isWall = true;

  return wall;
}

function createDot() {
  const geom = new THREE.SphereGeometry(DOT_RADIUS);
  const mat = new THREE.MeshStandardMaterial({
    color: '#FFFFFF',
    roughness: 0.0,
  });

  const dot = new THREE.Mesh(geom, mat);
  dot.isDot = true;

  return dot;
}

function createPowerUp() {
  const geom = new THREE.SphereGeometry(UP_RADIUS, 16, 16);
  const mat = new THREE.MeshStandardMaterial({
    color: '#CD607E',
    roughness: 0.0,
  });

  const power = new THREE.Mesh(geom, mat);
  power.isPowerUp = true;

  return power;
}

function createPacman() {
  const geom = new THREE.SphereGeometry(
    PACMAN_RADIUS,
    32,
    32,
    0,
    Math.PI * 1.8,
  );
  const mat = new THREE.MeshStandardMaterial({ color: '#FFFF31' });

  const pacman = new THREE.Mesh(geom, mat);

  const eye1 = new THREE.Mesh(
    new THREE.SphereGeometry(DOT_RADIUS),
    new THREE.MeshLambertMaterial({ color: '#000000' }),
  );

  eye1.position.x -= PACMAN_RADIUS * 0.7;
  eye1.position.y += PACMAN_RADIUS * 0.3;
  eye1.position.z += PACMAN_RADIUS * 0.5;

  pacman.add(eye1);

  const eye2 = new THREE.Mesh(
    new THREE.SphereGeometry(DOT_RADIUS),
    new THREE.MeshLambertMaterial({ color: '#000000' }),
  );

  eye2.position.x -= PACMAN_RADIUS * 0.7;
  eye2.position.y -= PACMAN_RADIUS * 0.3;
  eye2.position.z += PACMAN_RADIUS * 0.5;

  pacman.add(eye2);

  pacman.direction = new THREE.Vector3(-1, 0, 0);
  pacman.isPacman = true;
  pacman.isMoving = false;
  pacman.isPowered = false;
  pacman.prevWasWall = 0;

  return pacman;
}

function createGhost(color) {
  const geom = new THREE.SphereGeometry(GHOST_RADIUS, 32, 32);
  const mat = new THREE.MeshStandardMaterial({ color: color });

  const ghost = new THREE.Mesh(geom, mat);
  ghost.direction = new THREE.Vector3(-1, 0, 0);
  ghost.isGhost = true;
  ghost.isScared = false;

  return ghost;
}
