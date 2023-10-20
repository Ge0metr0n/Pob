let cubes = [];
let collidables = [];
let pointForces = [];

let pressedKeys = {};
window.onkeyup = (e) => { pressedKeys[e.keyCode] = false; }
window.onkeydown = (e) => { pressedKeys[e.keyCode] = true; }

let pos;
let cube;
let otherCube;
let distance;
let centre27 = [284, 285, 286, 295, 296, 297, 306, 307, 308, 381, 382, 383, 392, 393, 394, 403, 404, 405, 478,  479, 480, 489, 490, 491, 500, 501, 502];
let avX = 0;
let avY = 0;
let avZ = 0;
let pobRotation;
let combineRotation;

let floor = new THREE.Mesh(new THREE.BoxGeometry(120, 0.5, 120), new THREE.MeshStandardMaterial());
floor.position.y = -0.25;
floor.receiveShadow = true;

let restLen = 2;

const scene = new THREE.Scene();
scene.add(floor);
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);

const lights = [];
for (let q = 0; q < 2; q++) {
	for (let w = 0; w < 2; w++) {
		lights.push(new THREE.DirectionalLight( 0xffffff, 2 ));
		lights[lights.length - 1].position.x = -100 + q * 200;
		lights[lights.length - 1].position.y = 100;
		lights[lights.length - 1].position.z = -100 + w * 200;
		lights[lights.length - 1].castShadow = true;
	}
}
for (let q = 0; q < 4; q++) {
	scene.add(lights[q]);
}
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);
class Collidable {
	constructor(x, y, z, sizeX, sizeY, sizeZ, colour, killsPlayer) {
		this.sizeX = sizeX;
		this.sizeY = sizeY;
		this.sizeZ = sizeZ;
		this.cube = new THREE.Mesh(new THREE.BoxGeometry(sizeX, sizeY, sizeZ), new THREE.MeshStandardMaterial({ color: colour }));
		this.cube.castShadow = true; 
		this.cube.receiveShadow = true;
		scene.add(this.cube);
		this.cube.position.x = x;
		this.cube.position.y = y;
		this.cube.position.z = z;
		this.killsPlayer = killsPlayer;
	}
}
collidables.push(new Collidable(30, 15, 0, 30, 30, 30, 0xff0000, false));
collidables.push(new Collidable(90, 75, 0, 30, 30, 30, 0x00ff00, true));
collidables.push(new Collidable(150, 135, 0, 30, 30, 30, 0x0000ff, false));
collidables.push(new Collidable(150, 195, -60, 30, 30, 30, 0xff0000, false));
collidables.push(new Collidable(150, 255, -120, 30, 30, 30, 0x00ff00, false));
collidables.push(new Collidable(150, 315, -180, 30, 30, 30, 0x0000ff, false));
class Cube {
	constructor(x, y, z, colour) {
		this.cube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: colour }));
		this.cube.castShadow = true; 
		this.cube.receiveShadow = true;
		scene.add(this.cube);
		this.cube.position.x = x;
		this.cube.position.y = y;
		this.cube.position.z = z;
		this.VX = 0;
		this.VY = 0;
		this.VZ = 0;
		this.connections = [];
		this.forceFrame = [0, 0, 0];
		this.grounded = false;
	}
	colliding() {
		for (let q = 0; q < collidables.length; q++) {
			let x = this.cube.position.x;
			let y = this.cube.position.y;
			let z = this.cube.position.z;
			let ox = collidables[q].cube.position.x;
			let oy = collidables[q].cube.position.y;
			let oz = collidables[q].cube.position.z;
			let sx = collidables[q].sizeX;
			let sy = collidables[q].sizeY;
			let sz = collidables[q].sizeZ;
			let axis;
			let points;
			let distance;
			if ((x >= ox - (sx / 2) && x <= ox + (sx / 2)) && (y >= oy - (sy / 2) && y <= oy + (sy / 2)) && (z >= oz - (sz / 2) && z <= oz + (sz / 2))) {
				if (Math.abs(x - ox) > Math.abs(y - oy) && Math.abs(x - ox) > Math.abs(z - oz)) {
					axis = 1;
					points = [x, ox];
					if (points[0] > points[1]) {
						distance = (sx / 2) - new THREE.Vector3(x, 0, 0).distanceTo(new THREE.Vector3(ox, 0, 0));
					} else {
						distance = ((sz / 2) - new THREE.Vector3(x, 0, 0).distanceTo(new THREE.Vector3(ox, 0, 0))) * -1;
					}
				} else if (Math.abs(y - oy) > Math.abs(x - ox) && Math.abs(y - oy) > Math.abs(z - oz)) {
					axis = 2;
					points = [y, oy];
					if (points[0] > points[1]) {
						distance = (sy / 2) - new THREE.Vector3(0, y, 0).distanceTo(new THREE.Vector3(0, oy, 0));
					} else {
						distance = ((sy / 2) - new THREE.Vector3(0, y, 0).distanceTo(new THREE.Vector3(0, oy, 0))) * -1;
					}
				} else {
					axis = 3;
					points = [z, oz];
					if (points[0] > points[1]) {
						distance = (sz / 2) - new THREE.Vector3(0, 0, z).distanceTo(new THREE.Vector3(0, 0, oz));
					} else {
						distance = ((sz / 2) - new THREE.Vector3(0, 0, z).distanceTo(new THREE.Vector3(0, 0, oz))) * -1;
					}
				}
				return [q, axis, distance];
			}
		}
		return 0;
	}
}

function addPob() {
	for (let e = 0; e < 11; e ++) {
		for (let q = 0; q < 11; q ++) {
			for (let w = 0; w < 11; w ++) {
				if (e == 5 && q == 5 && w == 10) {
					cubes.push(new Cube(-5 + q, 20 + e, -5 + w, 0xff0000));
				} else if (w == 10 && (((e == 6 || e == 7) && (q == 3 || q == 7)) || (e == 3 && (q > 3 && q < 7)) || (e == 4 && (q == 3 || q == 7)))) {
					cubes.push(new Cube(-5 + q, 20 + e, -5 + w, 0x000000));
				} else if ((!((e == 0 || e == 10) && ((q > -1 && q < 3) || (q > 7 && q < 11))) && !((e == 1 || e == 9) && ((q > -1 && q < 2) || (q > 8 && q < 11))) && !((e == 2 || e == 8) && ((q > -1 && q < 1) || (q > 9 && q < 11)))) && (!((w == 0 || w == 10) && ((q > -1 && q < 3) || (q > 7 && q < 11))) && !((w == 1 || w == 9) && ((q > -1 && q < 2) || (q > 8 && q < 11))) && !((w == 2 || w == 8) && ((q > -1 && q < 1) || (q > 9 && q < 11)))) && (!((e == 0 || e == 10) && ((w > -1 && w < 3) || (w > 7 && w < 11))) && !((e == 1 || e == 9) && ((w > -1 && w < 2) || (w > 8 && w < 11))) && !((e == 2 || e == 8) && ((w > -1 && w < 1) || (w > 9 && w < 11))))) {
					cubes.push(new Cube(-5 + q, 20 + e, -5 + w, 0xffff00));
				}
			}
		}
	}
}

function pobDie() {
	for (let q = 0; q < cubes.length; q++) {
		cubes[q].connections = [];
	}
}

function collisions(q) {
	let result = cubes[q].colliding();
	if (result != 0) {
		if (collidables[result[0]].killsPlayer) {
			
		}
		if (result[1] == 1) {
			cubes[q].cube.position.x += result[2];
			cubes[q].VX *= -0.5;
			cubes[q].VY *= 0.9;
			cubes[q].VZ *= 0.9;
		} else if (result[1] == 2) {
			cubes[q].cube.position.y += result[2];
			cubes[q].VY *= -0.5;
			if (result[2] > 0) {
				cubes[q].grounded = true;
			}
			cubes[q].VX *= 0.9;
			cubes[q].VZ *= 0.9;
		} else {
			cubes[q].cube.position.z += result[2];
			cubes[q].VZ *= -0.5;
			cubes[q].VY *= 0.9;
			cubes[q].VX *= 0.9;
		}
	}
}

function getRotation(f, t) {
	let x;
	let y;
	let noseCube = t;
	let oNoseCube = cubes[f].cube;
	if (oNoseCube.position.x > noseCube.x) {
		if (oNoseCube.position.z < noseCube.z) {
			y = Math.atan(Math.abs(noseCube.x - oNoseCube.position.x) / Math.abs(noseCube.z - oNoseCube.position.z)) * 57.2958;
		} else {
			y = (90 - Math.atan(Math.abs(noseCube.x - oNoseCube.position.x) / Math.abs(noseCube.z - oNoseCube.position.z)) * 57.2958) + 90;
		}
	} else {
		if (oNoseCube.position.z > noseCube.z) {
				y = (Math.atan(Math.abs(noseCube.x - oNoseCube.position.x) / Math.abs(noseCube.z - oNoseCube.position.z)) * 57.2958) + 180;
		} else {
			y = (90 - Math.atan(Math.abs(noseCube.x - oNoseCube.position.x) / Math.abs(noseCube.z - oNoseCube.position.z)) * 57.2958) + 270;
		}
	}

	if (oNoseCube.position.y > noseCube.y) {
		if (oNoseCube.position.z < noseCube.z) {
			x = Math.atan(Math.abs(noseCube.y - oNoseCube.position.y) / Math.abs(noseCube.z - oNoseCube.position.z)) * 57.2958;
		} else {
			x = (90 - Math.atan(Math.abs(noseCube.y - oNoseCube.position.y) / Math.abs(noseCube.z - oNoseCube.position.z)) * 57.2958) + 90;
		}
	} else {
		if (oNoseCube.position.z > noseCube.z) {
				x = (Math.atan(Math.abs(noseCube.y - oNoseCube.position.y) / Math.abs(noseCube.z - oNoseCube.position.z)) * 57.2958) + 180;
		} else {
			x = (90 - Math.atan(Math.abs(noseCube.y - oNoseCube.position.y) / Math.abs(noseCube.z - oNoseCube.position.z)) * 57.2958) + 270;
		}
	}
	return [x, y];
}

function addConnections() {
	for (let q = 0; q < cubes.length; q++) {
		for (let w = 0; w < cubes.length; w++) {
			let cubeX = cubes[q].cube.position.x;
			let cubeY = cubes[q].cube.position.y;
			let cubeZ = cubes[q].cube.position.z;
			let ocubeX = cubes[w].cube.position.x;
			let ocubeY = cubes[w].cube.position.y;
			let ocubeZ = cubes[w].cube.position.z;
			if ((ocubeX >= cubeX - 2 && ocubeX <= cubeX + 2 && ocubeY >= cubeY - 2 && ocubeY <= cubeY + 2 && ocubeZ >= cubeZ - 2 && ocubeZ <= cubeZ + 2) && q != w) {
				let dX = 0;
				let dY = 0;
				let dZ = 0;
				if (ocubeX == cubeX - 2 || ocubeX == cubeX + 2) {
					dX = 2;
				} else if (ocubeX == cubeX - 1 || ocubeX == cubeX + 1) {
					dX = 1
				}
				if (ocubeY == cubeY - 2 || ocubeY == cubeY + 2) {
					dY = 2;
				} else if (ocubeY == cubeY - 1 || ocubeY == cubeY + 1) {
					dY = 1
				}
				if (ocubeZ == cubeZ - 2 || ocubeZ == cubeZ + 2) {
					dZ = 2;
				} else if (ocubeZ == cubeZ - 1 || ocubeZ == cubeZ + 1) {
					dZ = 1
				}
				cubes[q].connections.push([w, (Math.sqrt((Math.sqrt((dX ** 2) + (dZ ** 2)) ** 2) + (dY ** 2))) * restLen]);
			}
		}
	}
}

function addSpringForces() {
	for (let q = 0; q < cubes.length; q++) {
		if (cubes[q].connections.length > 0) {
			for (let w = 0; w < cubes[q].connections.length; w++) {
				cube = cubes[q].cube;
				pos = new THREE.Vector3(cube.position.x, cube.position.y, cube.position.z);
				pobRotation = getRotation(388, new THREE.Vector3(cubes[398].cube.position.x, cubes[398].cube.position.y, cubes[398].cube.position.z));
				if (isNaN(pobRotation[0])) {
					pobRotation[0] = 0;
				}
				if (isNaN(pobRotation[1])) {
					pobRotation[1] = 0;
				}
				otherCube = cubes[cubes[q].connections[w][0]].cube;
				distance = Math.sqrt((Math.sqrt(((otherCube.position.x - cube.position.x) ** 2) + ((otherCube.position.y - cube.position.y) ** 2)) ** 2) + ((otherCube.position.z - cube.position.z) ** 2));
				if (distance == cubes[q].connections[w][1]) {
					point = pos.lerp(otherCube.position, 0);
				} else {
					point = pos.lerp(otherCube.position, ((distance - cubes[q].connections[w][1]) / distance));
				}
				cubes[q].forceFrame[0] += ((point.x - cube.position.x) / 25);
				cubes[q].forceFrame[1] += ((point.y - cube.position.y) / 25) - 0.0001;
				cubes[q].forceFrame[2] += ((point.z - cube.position.z) / 25);
				if (w == cubes[q].connections.length - 1) {
					if (cube.position.y < 0.5) {
						cube.position.y = 0.501;
						cubes[q].VY *= -0.5;
						cubes[q].grounded = true;
						cubes[q].VX *= 0.9;
						cubes[q].VZ *= 0.9;
					} else {
						cubes[q].grounded = false;
						collisions(q);
					}
					let momentumX = cubes[q].VX;
					let momentumY = cubes[q].VY;
					let momentumZ = cubes[q].VZ;
					cubes[q].VX += cubes[q].forceFrame[0];
					cubes[q].VY += cubes[q].forceFrame[1];
					cubes[q].VZ += cubes[q].forceFrame[2];
					cubes[q].forceFrame[0] += (momentumX * 0.8);
					cubes[q].forceFrame[1] += (momentumY * 0.8);
					cubes[q].forceFrame[2] += (momentumZ * 0.8);
				}
			}
		} else {
			cube = cubes[q].cube;
			if (cube.position.y < 0.5) {
				cube.position.y = 0.501;
				cubes[q].VY *= -0.5;
				cubes[q].grounded = true;
				cubes[q].VX *= 0.9;
				cubes[q].VZ *= 0.9;
			} else {
				cubes[q].grounded = false;
				collisions(q);
			}
			cubes[q].forceFrame[1] += -0.001;
			let momentumX = cubes[q].VX;
			let momentumY = cubes[q].VY;
			let momentumZ = cubes[q].VZ;
			cubes[q].VX += cubes[q].forceFrame[0];
			cubes[q].VY += cubes[q].forceFrame[1];
			cubes[q].VZ += cubes[q].forceFrame[2];
			cubes[q].forceFrame[0] += (momentumX * 0.8);
			cubes[q].forceFrame[1] += (momentumY * 0.8);
			cubes[q].forceFrame[2] += (momentumZ * 0.8);
		}
	}
	for (let q = 0; q < cubes.length; q ++) {
		cube = cubes[q].cube;
		cube.position.x += cubes[q].forceFrame[0];
		cube.position.y += cubes[q].forceFrame[1];
		cube.position.z += cubes[q].forceFrame[2];
		cubes[q].forceFrame = [0, 0, 0];
		cube.rotation.x = getRotation(388, new THREE.Vector3(cubes[398].cube.position.x, cubes[398].cube.position.y, cubes[398].cube.position.z))[0] / 57.2958;
		cube.rotation.y = getRotation(388, new THREE.Vector3(cubes[398].cube.position.x, cubes[398].cube.position.y, cubes[398].cube.position.z))[1] / 57.2958;
	}
}

addPob();
addConnections();
camera.rotation.y = -30 / 57.2958;
camera.rotation.x = -45 / 57.2958;
camera.rotation.z = -30 / 57.2958;
function animate() {
	renderer.render(scene, camera);
	//setTimeout(() => {
        requestAnimationFrame( animate );
    //}, 200);
	addSpringForces();
	for (let q = 0; q < 27; q++) {
		avX += cubes[centre27[q]].cube.position.x;
		avY += cubes[centre27[q]].cube.position.y;
		avZ += cubes[centre27[q]].cube.position.z;
	}
	avX /= 27;
	avY /= 27;
	avZ /= 27;
	camera.position.x = avX - 50;
	camera.position.y = avY + 50;
	camera.position.z = avZ + 50;
	avX = 0;
	avY = 0;
	avZ = 0;
	if (pressedKeys["68"]) {
		for (let q = 0; q < cubes.length; q ++) {
			if (cubes[q].cube.position.y > cubes[393].cube.position.y + 4) {
				cubes[q].VZ += 0.02;
			}
		}
	} else if (pressedKeys["65"]) {
		for (let q = 0; q < cubes.length; q ++) {
			if (cubes[q].cube.position.y > cubes[393].cube.position.y + 4) {
				cubes[q].VZ -= 0.02;
			}
		}
	}
	if (pressedKeys["87"]) {
		for (let q = 0; q < cubes.length; q ++) {
			if (cubes[q].cube.position.y > cubes[393].cube.position.y + 4) {
				cubes[q].VX += 0.02;
			}
		}
	} else if (pressedKeys["83"]) {
		for (let q = 0; q < cubes.length; q ++) {
			if (cubes[q].cube.position.y > cubes[393].cube.position.y + 4) {
				cubes[q].VX -= 0.02;
			}
		}
	}
	if (pressedKeys["32"]) {
		let canJump = false;
		for (let q = 0; q < cubes.length; q ++) {
			if (cubes[q].grounded) {
				canJump = true;
			}
		}
		if (canJump) {
			for (let q = 0; q < cubes.length; q ++) {
				if (cubes[q].cube.position.y > cubes[393].cube.position.y - 6) {
					cubes[q].VY += 0.1;
				}
			}
		}
	}
	if (pressedKeys["75"]) {
		pobDie();
	}
}
animate();
//"wi wasgra" - midreset 2023
