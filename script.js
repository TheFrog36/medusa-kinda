import * as MyMath from "./mathFunctions.js";
import * as Draw from "./drawFunctions.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const mainContainer = document.getElementById("main-container");
// const canvasColor = "black";
const canvasColor = "rgba(0, 0, 0, 1)"

let mousePosition = {
	x: mainContainer.clientWidth,
	y: mainContainer.clientHeight / 2
}

const jointRadius = 2;
const bodySegments = 20;
const baseSegmentLength = 10;
const tailSegments = 15;
const tailGrowthRate = 1.15;

const creatureColor = "white";
const maxTurnAngle = MyMath.degToRad(3);
const pushInterval = 2; // boh
const pushForce = 10; // boh
let speed = baseSegmentLength / 4; // boh

const body = [];

resizeCanvas();
canvas.addEventListener("mousemove", function (event) {
	mousePosition = getRelativeCanvasPosition(canvas, event);
});
Draw.clearCanvas(ctx, "black")
generateCreature()

gameLoop()


function gameLoop(){
	setInterval(()=>{
		update()
		render()
	}, 17)
}

function update(){
	moveHead()
	for(let i = 1; i < body.length; i++){
		const p1 = body[i].pos
		const p2 = body[i-1].pos

		const distance = MyMath.getDistanceBetweenPoints(p1, p2)
		const intersection = moveTowards(p1, p2, maxTurnAngle, body[i].direction, baseSegmentLength)
		body[i].pos = intersection.newPosition
		body[i].direction = intersection.newDirection
	
	}
}

function render(){
	Draw.clearCanvas(ctx, canvasColor)


	// moveTowards(body[0].pos, mousePosition, maxTurnAngle, body[0].direction, baseSegmentLength)
	for(let i = 0; i < body.length; i++){
		Draw.drawCircle(ctx, body[i].pos, jointRadius, creatureColor, true, 1)
		if(i == 0) continue
		Draw.drawSegmentBetweenPoints(ctx, body[i].pos, body[i-1].pos, 1, creatureColor)
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
		direction: 0
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
			direction: 0
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
			direction: 0
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

function moveTowards(p1, p2, maxAngle, currentDirection, distance){

	// Draw.drawCircle(ctx, p1, 3, "white")
	// Draw.drawCircle(ctx, p2, 3, "cyan")
	// Draw.drawCircle(ctx, p2, distance, "cyan", false, 1)
	// Draw.drawSegmentWithAngle(ctx, p1, currentDirection, 5000, 1, "red")
	const targetVector = MyMath.getVectorFromPoints(p1, p2)
	let targetAngle //= MyMath.getVectorAngle(targetVector)
	targetAngle =  MyMath.angleBetweenPoints(MyMath.getNormalizedVectorFromAngle(currentDirection), targetVector) + currentDirection

	const angleDiff = currentDirection - targetAngle
	if(Math.abs(angleDiff) > maxTurnAngle) targetAngle = currentDirection - (maxTurnAngle) * (angleDiff > 0 ? 1 : -1)
	// Draw.drawSegmentWithAngle(ctx, p1, targetAngle, 5000, "red")

	// Draw.drawSegmentWithAngle(ctx, p1, targetAngle, 5000, 1, "red")
	const slope = Math.sin(targetAngle) / Math.cos(targetAngle)
	let vector = MyMath.findClosestIntersectionSlopeCircle(slope, targetVector, distance)
	if(!vector) {
		console.log("%cDIOPORCO", "color: red; font-size: 50px")
		const targetDistance = MyMath.getDistanceBetweenPoints(p1, p2) //- distance
		vector = MyMath.multiplyVector(MyMath.getNormalizedVectorFromAngle(targetAngle),  targetDistance)
	}
	const newPosition = MyMath.sumVector(p1, vector)
	// Draw.drawCircle(ctx, MyMath.sumVector(p1, vector), 3, "yellow")
	return {newPosition, newDirection: targetAngle}
	// return newPosition & new directio  
}

function moveHead(){
	const pos = body[0].pos
	const direction = body[0].direction
	const vectorToTarget = MyMath.getVectorFromPoints(pos, mousePosition)
	// let angleToTarget = MyMath.getVectorAngle(vectorToTarget)
	let angleToTarget =  MyMath.angleBetweenPoints(MyMath.getNormalizedVectorFromAngle(direction), vectorToTarget) + direction
	const targetDistance = MyMath.getVectorLength(vectorToTarget)
	const angleDiff = direction - angleToTarget
	if(Math.abs(angleDiff) > maxTurnAngle) angleToTarget = direction - (maxTurnAngle) * (angleDiff > 0 ? 1 : -1)
	const movementLength = speed > targetDistance ? 0 : speed
	const movementVector = MyMath.rotateVector({x: movementLength, y: 0}, angleToTarget)
	const newPos = MyMath.sumVector(pos, movementVector)
	body[0].pos = newPos
	body[0].direction = angleToTarget
}