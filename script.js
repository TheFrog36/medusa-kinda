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
const maxTurnAngle = MyMath.degToRad(5);
const pushInterval = 2; // boh
const pushForce = 10; // boh
const maxSpeed = 700 // pixels per second
const friction = maxSpeed / 1.5
const minSpeed = 10
let currentSpeed = 0
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

let infosToDisplay = []

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

	infosToDisplay.push(["fps", lastFpsValue])
	infosToDisplay.push(["delta", deltaTime])

	updateInfo(infosToDisplay)
}

let cycleTime = 2
const jointStartingAngle = 150
const jointEndAngle =  20 
const segmentStartingAngle = 5
const segmentEndAngle = 25
let cycleCounter = 0
const chargingTimePercentage = 0.8
const chargingTime = cycleTime * chargingTimePercentage
const releaseTime = cycleTime - chargingTime

let currentJointAngle = jointStartingAngle
let currentSegmentAngle = segmentStartingAngle
const chargeJoingAngleDiff = (jointStartingAngle - jointEndAngle) / chargingTime
const releaseJointAngleDiff = (jointStartingAngle - jointEndAngle) / releaseTime

const releaseSegmentFullyExtendedPercentage = 0.4
const chargeSegmentFullyExtendedPercentage = 0.8
const chargeSegmentAngleDifference = (segmentStartingAngle - segmentEndAngle) / (chargingTime * chargeSegmentFullyExtendedPercentage)
const releaseSegmentAngleDifference = (segmentStartingAngle - segmentEndAngle) / (releaseTime * releaseSegmentFullyExtendedPercentage)

// function drawLeg(pos, direction, angleJoint, segmentsNumber, segmentLength, segmentsAngle){
// pos direction segment number segment legnth should not change during cycle
// only angle joint & segment angle should change based on speed (?)
// divide cycle in 2 part: charging & releasing
// during charging joing angle becomes smaller && segmentAngle becomes larger
// during release joing angle becomes bigger and segment angle become smaller
// some parameters to program them :
// also joint starting and end angle should be always the same
// segmentAngle should increase faster than joint

// Each leg pair should be an object with same parameters
// Then each leg should be trated as an array 
// Should add delay? 
// Also now make it based on speed ugh
// add spd to debugger


function update(delta){
	const dist = MyMath.getDistanceBetweenPoints(mousePosition, body[0].pos)
	cycleCounter += delta
	if(cycleCounter > cycleTime) {
		cycleCounter = 0
		currentJointAngle = jointStartingAngle
	}
	if(cycleCounter > chargingTime) {
		releaseLeg(delta, chargingTime)
	} else {
		// if(cycleCounter == 0) currentJointAngle = jointStartingAngle
		chargeLeg(delta, chargingTime)
	}
	// if(currentSpeed < minSpeed  && dist < 100) return 
	moveHead(delta)
	for(let i = 1; i < body.length; i++){
		const movResult = moveTowards(body[i].pos, body[i-1].pos, body[i].direction, body[i-1].direction, maxTurnAngle * 6, body[i].length)
		body[i].pos = movResult.newPosition
		body[i].direction = movResult.newDirection	
	}
}

function releaseLeg(delta, chargingTime){
	currentJointAngle += releaseJointAngleDiff * delta
	currentSegmentAngle += releaseSegmentAngleDifference * delta
	if(currentSegmentAngle < segmentStartingAngle) currentSegmentAngle = segmentStartingAngle
}

function chargeLeg(delta, chargingTime){
	currentJointAngle -= chargeJoingAngleDiff * delta
	currentSegmentAngle -= chargeSegmentAngleDifference * delta
	if(currentSegmentAngle > segmentEndAngle) currentSegmentAngle = segmentEndAngle
}


function render(){
	Draw.clearCanvas(ctx, canvasColor)

	// Draw.drawSegmentWithAngle(ctx, body[0].pos, body[0].direction, 5000, 1, "cyan")
	// Draw.drawSegmentWithAngle(ctx, body[1].pos, body[1].direction, 5000, 1, "red")
	// body[1].pos = movResult.newPosition
	// body[1].direction = movResult.newDirection
	
	const angle = MyMath.getVectorAngle(MyMath.getVectorFromPoints(body[1].pos, body[0].pos))
	const jointAngle = MyMath.degToRad(jointEndAngle)
	const legAngle = MyMath.degToRad(1)
	// drawLeg(body[0].pos, angle, jointAngle, 100, baseSegmentLength, legAngle)
	drawLeg(body[0].pos, angle, MyMath.degToRad(currentJointAngle), 10, baseSegmentLength, MyMath.degToRad(currentSegmentAngle))
	// drawLeg(body[0].pos, angle, jointAngle / 2, 6, baseSegmentLength * 5, MyMath.degToRad(15))
	// drawLeg(body[0].pos, angle, jointAngle * 1.5, 2, baseSegmentLength * 5, MyMath.degToRad(40))

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
		newDirection = MyMath.angleBetweenPoints(a1, a2) + maxAngle * turnDirection
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
	// generateTail();
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

function moveHead(delta){
	if(currentSpeed < minSpeed) {
		currentSpeed = maxSpeed
	}
	const speed = currentSpeed * delta
	const pos = body[0].pos
	const direction = body[0].direction
	const vectorToTarget = MyMath.getVectorFromPoints(pos, mousePosition)	
	const baseAngleToTarget = MyMath.getVectorAngle(vectorToTarget)
	const targetDistance = MyMath.getDistanceBetweenPoints(pos, mousePosition)
	const angleDiff = MyMath.getVectorAngleDifference(baseAngleToTarget,  direction)

	const turnDireciton = angleDiff > 0 ? 1 : -1
	let newDirection = (Math.abs(angleDiff) > maxTurnAngle) ? direction + maxTurnAngle * turnDireciton : baseAngleToTarget
	// if(targetDistance < speed) return 
	const movementLength = speed
	const movementVector = MyMath.rotateVector({x: movementLength, y: 0}, newDirection)
	const newPos = MyMath.sumVector(pos, movementVector)
	// body[0].pos = newPos
	// body[0].direction = newDirection
	currentSpeed -= friction * delta
	infosToDisplay.push(["speed", currentSpeed])
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
	for(let i = 0; i < infos.length; i++){
		infoContainer.innerHTML +=
		`<tr>
			<td>${infos[i][0]}</td><td>${infos[i][1]}</td>
		</tr>`
	}
	infosToDisplay = []
}

function drawLeg(pos, direction, angleJoint, segmentsNumber, segmentLength, segmentsAngle){
	Draw.drawSegmentWithAngle(ctx, pos, direction, 5000, 1)
	Draw.drawSegmentWithAngle(ctx, pos, Math.PI + direction, 5000, 1)
	
	
	ctx.save()
	ctx.beginPath()
	ctx.translate(pos.x, pos.y)

	const angle = direction - angleJoint

	ctx.rotate(angle)
	ctx.moveTo(0, 0)
	ctx.lineTo(segmentLength, 0)
	ctx.arc(segmentLength, 0, jointRadius, 0, Math.PI * 2)



	for(let i = 0; i < segmentsNumber-1; i++){
		ctx.translate(segmentLength, 0)	
		ctx.rotate(-segmentsAngle)
		ctx.moveTo(0, 0)
		ctx.lineTo(segmentLength, 0)
		ctx.arc(segmentLength, 0, jointRadius, 0, Math.PI * 2)	
	}
	ctx.restore()
	ctx.save()
	ctx.translate(pos.x, pos.y)


	// ctx.rotate( direction + angleJoint)
	// ctx.moveTo(0, 0)
	// ctx.lineTo(segmentLength, 0)
	// ctx.arc(segmentLength, 0, 5, 0, Math.PI * 2)

	ctx.rotate(direction + angleJoint)
	ctx.moveTo(0, 0)
	ctx.lineTo(segmentLength, 0)
	ctx.arc(segmentLength, 0, jointRadius, 0, Math.PI * 2)

	for(let i = 0; i < segmentsNumber-1; i++){
		ctx.translate(segmentLength, 0)	
		ctx.rotate(+segmentsAngle)
		ctx.moveTo(0, 0)
		ctx.lineTo(segmentLength, 0)
		ctx.arc(segmentLength, 0, jointRadius, 0, Math.PI * 2)
	}

	ctx.strokeStyle = "white"
	ctx.fillStyle = "white"
	ctx.stroke()
	ctx.fill()
	ctx.closePath()
	ctx.restore()
}