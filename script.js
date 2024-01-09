import * as MyMath from "./mathFunctions.js";
import * as Draw from "./drawFunctions.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const mainContainer = document.getElementById("main-container");
const infoContainer = document.getElementById("infos")
// const canvasColor = "black";
const canvasColor = "rgba(0, 0, 0, 1)"

let mousePosition = {
	x: mainContainer.clientWidth,
	y: mainContainer.clientHeight / 2
}

const jointRadius = 1;
const bodySegments = 30;
const baseSegmentLength = 10;
const tailSegments = 30;
const tailGrowthRate = 0.92;

const creatureColor = "white";
const maxTurnAngle = MyMath.degToRad(30);
const pushInterval = 2; // boh
const pushForce = 10; // boh
const maxSpeed = 200 // pixels per second
let frameLength = 17
const body = [];

let gameLoopIntervalId

resizeCanvas();
canvas.addEventListener("mousemove", function (event) {
	mousePosition = getRelativeCanvasPosition(canvas, event);
});
Draw.clearCanvas(ctx, "black")
generateCreature()

let lastTime = 0
let lastTimeFramesChecked = performance.now()
let fps = 0;
let lastFpsValue = 0
requestAnimationFrame(gameLoop)

function gameLoop(timestamp) {
	// let c
	// for(let i = 0; i < 100_000_000; i++){
	// 	c = i + i / 2
	// }
	const deltaTime = (timestamp - lastTime) / 1000; // Convert to seconds
	lastTime = timestamp
	update(deltaTime)
	render()
	const currentTime = performance.now()
	fps++
	if(currentTime - lastTimeFramesChecked  > 1000){
		lastTimeFramesChecked = currentTime
		lastFpsValue = fps
		fps = 0
	}
	requestAnimationFrame(gameLoop);
	updateInfo({
		"fps": lastFpsValue,
		"delta": deltaTime
	})

}

function update(delta){
	moveHead(delta)
	for(let i = 1; i < body.length; i++){
		const movResult = moveTowards(body[i].pos, body[i-1].pos, body[i].direction, body[i-1].direction, maxTurnAngle, body[i].length)
		body[i].pos = movResult.newPosition
		body[i].direction = movResult.newDirection	
	}
}

function render(){
	Draw.clearCanvas(ctx, canvasColor)
	// Draw.drawSegmentWithAngle(ctx, body[0].pos, body[0].direction, 5000, 1, "cyan")
	// Draw.drawSegmentWithAngle(ctx, body[1].pos, body[1].direction, 5000, 1, "red")
	// body[1].pos = movResult.newPosition
	// body[1].direction = movResult.newDirection
	

	for(let i = 0; i < body.length; i++){
		Draw.drawCircle(ctx, body[i].pos, jointRadius, creatureColor, true, 1)
		if(i == 0) continue
		Draw.drawSegmentBetweenPoints(ctx, body[i].pos, body[i-1].pos, 1, creatureColor)
	}
}

function moveTowards(p1, p2, a1, a2, maxAngle, length){
	// Draw.drawCircle(ctx, p1, 8, "red")
	// Draw.drawCircle(ctx, p2, 3, "cyan")
	// Draw.drawSegmentWithAngle(ctx, p1, a1, 5000, 1, "red")
	// Draw.drawSegmentWithAngle(ctx, p2, a2, 5000, 1, "cyan")
	// Draw.drawCircle(ctx, p2, length, "cyan", false)
	const angleDiff = MyMath.getVectorAngleDifference(a1, a2)
	
	const turnDirection = angleDiff < 0 ? 1 : -1
	let newDirection
	let newPosition
	if(Math.abs(angleDiff) > maxAngle){

		// newDirection = a1 + maxAngle * turnDirection
		newDirection = MyMath.angleBetweenPoints(a1, a2)
		const dum = MyMath.getNormalizedVectorFromAngle(Math.PI + a2 + maxAngle * -turnDirection)
		// const dum = MyMath.getNormalizedVectorFromAngle(a2)
		const dumdum = MyMath.multiplyVector(dum, length)
		// Draw.drawSegmentWithAngle(ctx, p2, Math.PI + a2 + maxAngle * -turnDirection, 5000, 1, "red")
		
		newPosition = MyMath.sumVector(dumdum, p2)
		// Draw.drawCircle(ctx, newPosition, 10, "yellow")
	} else {
		// newDirection = MyMath.angleBetweenPoints(p1, p2)
		newDirection = MyMath.getVectorAngle(MyMath.getVectorFromPoints(p1, p2))
		// Draw.drawSegmentWithAngle(ctx, p1, newDirection, 5000, 1, "orange")
		const dum = MyMath.getNormalizedVectorFromAngle(newDirection)
		const dumdum = MyMath.multiplyVector(dum, -length)
		newPosition = MyMath.sumVector(dumdum, p2)
		// Draw.drawCircle(ctx, newPosition, 5, "yellowgreen")
	}

	return {
		newPosition,
		newDirection
	}

}


function generateCreature() {
	generateHead();
	generateBody();
	generateTail();
}

function generateHead() {
	body.push({
		pos: {
			x: canvas.width / 2,
			y: canvas.height / 2,
		},
		direction: 0,
	});
}

function generateBody() {
	//bodySegments
	for (let i = 0; i < bodySegments; i++) {
		body.push({
			pos: {
				x: body[i].pos.x - baseSegmentLength,
				y: body[i].pos.y,
			},
			direction: 0,
			length: baseSegmentLength
		});
	}
}

function generateTail() {
	let currentSegmentLength = baseSegmentLength * tailGrowthRate;
	for (let i = 0; i < tailSegments; i++) {
		body.push({
			pos: {
				x: body.at(-1).pos.x - currentSegmentLength,
				y: body.at(-1).pos.y,
			},
			direction: 0,
			length: currentSegmentLength
		});
		currentSegmentLength *= tailGrowthRate;
	}
}

function resizeCanvas() {
	canvas.width = mainContainer.clientWidth;
	canvas.height = mainContainer.clientHeight;
}

function getRelativeCanvasPosition(canvas, event) {
	const rect = canvas.getBoundingClientRect();
	const scaleX = canvas.width / rect.width;
	const scaleY = canvas.height / rect.height;
	const x = (event.clientX - rect.left) * scaleX;
	const y = (event.clientY - rect.top) * scaleY;
	return { x, y };
}

// function moveTowards(p1, p2, maxAngle, currentDirection, distance){

// 	Draw.drawCircle(ctx, p1, 3, "white")
// 	Draw.drawCircle(ctx, p2, 3, "cyan")
// 	Draw.drawCircle(ctx, p2, distance, "cyan", false, 1)
// 	Draw.drawSegmentWithAngle(ctx, p1, currentDirection, 5000, 1, "red")
// 	const targetVector = MyMath.getVectorFromPoints(p1, p2)
// 	let targetAngle //= MyMath.getVectorAngle(targetVector)
// 	targetAngle =  MyMath.angleBetweenPoints(MyMath.getNormalizedVectorFromAngle(currentDirection), targetVector) + currentDirection

// 	const angleDiff = currentDirection - targetAngle
// 	if(Math.abs(angleDiff) > maxAngle) {
// 		targetAngle = currentDirection - (maxAngle) * (angleDiff > 0 ? 1 : -1)
// 	}
// 	Draw.drawSegmentWithAngle(ctx, p1, targetAngle, 5000, "red")

// 	Draw.drawSegmentWithAngle(ctx, p1, targetAngle, 5000, 1, "red")
// 	const slope = Math.sin(targetAngle) / Math.cos(targetAngle)
// 	let vector = MyMath.findClosestIntersectionSlopeCircle(slope, targetVector, distance)
// 	if(!vector) {
// 		frameLength = 500
// 		// changeGameFrames(500)
// 		let targetDistance = MyMath.getDistanceBetweenPoints(p1, p2) //- distance
// 		if(targetDistance > distance) targetDistance = distance
// 		vector = MyMath.multiplyVector(MyMath.getNormalizedVectorFromAngle(targetAngle),  targetDistance)
// 	}
// 	const newPosition = MyMath.sumVector(p1, vector)
// 	// Draw.drawCircle(ctx, MyMath.sumVector(p1, vector), 3, "yellow")
// 	return {newPosition, newDirection: targetAngle}
// 	// return newPosition & new directio  
// }

function moveHead(delta){
	const speed = maxSpeed * delta
	const pos = body[0].pos
	const direction = body[0].direction
	const vectorToTarget = MyMath.getVectorFromPoints(pos, mousePosition)	
	const baseAngleToTarget = MyMath.getVectorAngle(vectorToTarget)
	const targetDistance = MyMath.getDistanceBetweenPoints(pos, mousePosition)
	const angleDiff = MyMath.getVectorAngleDifference(baseAngleToTarget,  direction)

	const turnDireciton = angleDiff > 0 ? 1 : -1
	let newDirection = (Math.abs(angleDiff) > maxTurnAngle) ? direction + maxTurnAngle * turnDireciton : baseAngleToTarget
	if(targetDistance < speed) return 
	const movementLength = speed
	const movementVector = MyMath.rotateVector({x: movementLength, y: 0}, newDirection)
	const newPos = MyMath.sumVector(pos, movementVector)
	body[0].pos = newPos
	body[0].direction = newDirection
}

function startGameLoop(frameLength){
	gameLoopIntervalId = gameLoop(frameLength)
}

function stopGameLoop(){
	clearInterval(gameLoopIntervalId)
}

function changeGameFrames(frameLength){
	stopGameLoop()
	startGameLoop(frameLength)
}

function updateInfo(infos){ // [{infoName, infoValue}]
	infoContainer.innerHTML = ""
	for(let info in infos){
		
		infoContainer.innerHTML +=
		`<tr>
			<td>${info}</td><td>${infos[info]}</td>
		</tr>`
	}
}
