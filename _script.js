import * as MyMath from "./mathFunctions.js"
import * as Draw from "./drawFunctions.js"

// all radians should be clockwise

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const mainContainer = document.getElementById("main-container");

const canvasColor = "black";

const jointRadius = 2;

// data for head
// data for body
// maybe an obj?
const bodySegments = 20;
const baseSegmentLength = 80;
// data for tail
const tailSegments = 15;
const tailGrowthRate = 1.15;

const creatureColor = "white";
const maxTurnAngle = MyMath.degToRad(20);
const pushInterval = 2;
const pushForce = 10;
let speed = baseSegmentLength / 2

const body = [];

let mousePosition = { x: canvas.width, y: canvas.height / 2 };

resizeCanvas();
clearCanvas();
generateCreature();
drawBody();

console.log(ctx)
// gameLoop();

function drawBody() {
  for (let i = 0; i < body.length; i++) {
    drawDot(
      body[i].point,
      i == 0 ? jointRadius * 1.5 : jointRadius,
      creatureColor
    );
    if (i == 0) continue;
    drawSegment(body[i].point, body[i - 1].point, creatureColor);
  }
}

function generateCreature() {
  generateHead();
  generateBody();
  generateTail();
}

canvas.addEventListener("mousemove", function (event) {
  mousePosition = getRelativeCanvasPosition(canvas, event);
});

function getRelativeCanvasPosition(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = (event.clientX - rect.left) * scaleX;
  const y = (event.clientY - rect.top) * scaleY;
  return { x, y };
}

function gameLoop() {
  setInterval(() => {
    update();
    render();
  }, 30);
}

let temp_dot
let directNormalizedVector
function update() {
  const some_distance = baseSegmentLength * 2
  const dum_distance = MyMath.getDistanceBetweenPoints(body[0].point, mousePosition)
  directNormalizedVector = {
    x: (mousePosition.x - body[0].point.x) / dum_distance,
    y: (mousePosition.y - body[0].point.y) / dum_distance
  }
  temp_dot = {
    x: directNormalizedVector.x * some_distance + body[0].point.x,
    y: directNormalizedVector.y * some_distance + body[0].point.y
  }

}

function render() {
  clearCanvas()
  drawBody()
  drawCircle(temp_dot, baseSegmentLength, "cyan")
  showVector(body[0].point, directNormalizedVector, 2, "yellowgreen")
  showVector(body[0].point, body[0].direction, 2, "cyan")

  const targetAngle = MyMath.angleBetweenPoints(body[0].direction, directNormalizedVector)
  const isAngleOverLimit = Math.abs(targetAngle) > maxTurnAngle
  // console.log(`%cAngle ${radiansToDegrees(targetAngle)}`, `color: ${isAngleOverLimit ? "red" : "yellowgreen"}`)
  let newPosition = {}
  console.log(targetAngle)
  if(!isAngleOverLimit){
    newPosition = {
      x: temp_dot.x - directNormalizedVector.x * baseSegmentLength,
      y: temp_dot.y - directNormalizedVector.y * baseSegmentLength
    }
  } else {
    const newDirection = MyMath.rotateVector(body[0].direction, targetAngle > 0 ? maxTurnAngle : -maxTurnAngle)
    showVector(body[0].point, newDirection, 2, "red")
    const circleCenter = {
      x: temp_dot.x - body[0].point.x,
      y: temp_dot.y - body[0].point.y
    }
    const intersection = MyMath.findClosestIntersectionSlopeCircle(newDirection.y / newDirection.x, circleCenter, baseSegmentLength)
    const normalizedNewDirection = getNormalizedVector(newDirection)
    if(intersection == null) {
      newPosition.x = body[0].point.x + normalizedNewDirection.x * speed
      newPosition.y = body[0].point.y + normalizedNewDirection.y * speed
    } else {
      newPosition.x = body[0].point.x + intersection.x,
      newPosition.y = body[0].point.y + intersection.y
    }
  }
  drawDot(newPosition, 6, "cyan")
  drawDot(temp_dot, 2, "red") 
}

function generateHead() {
  // center point
  body.push({
    point: {
      x: canvas.width / 2,
      y: canvas.height / 2,
    },
    velocity: {
      x: 5,
      y: 0,
    },
    direction: {
      x: 1,
      y: 0,
    },
  });
}

function generateBody() {
  //bodySegments
  for (let i = 0; i < bodySegments; i++) {
    body.push({
      point: {
        x: body[i].point.x - baseSegmentLength,
        y: body[i].point.y,
      },
      direction: {
        x: 1,
        y: 0,
      },
    });
  }
}

function generateTail() {
  let currentSegmentLength = baseSegmentLength * tailGrowthRate;
  for (let i = 0; i < tailSegments; i++) {
    body.push({
      point: {
        x: body.at(-1).point.x - currentSegmentLength,
        y: body.at(-1).point.y,
      },
      direction: {
        x: 1,
        y: 0,
      }
    });
    currentSegmentLength *= tailGrowthRate;
  }
}

function resizeCanvas() {
  canvas.width = mainContainer.clientWidth;
  canvas.height = mainContainer.clientHeight;
}

function clearCanvas() {
  ctx.rect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = canvasColor;
  ctx.fill();
}

function drawSegment(p1, p2, color, width = 1) {
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.lineWidth = width;
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.closePath();
}

function drawDot(p, radius, color) {
  ctx.beginPath();
  ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.closePath();
}



function showVector(p, v, width = 1, color, infinite = true){
  const multiplier = infinite ? 10000 : 1
  const targetPoint = {
    x: p.x + v.x * multiplier,
    y: p.y + v.y * multiplier
  }
  drawSegment(p, targetPoint, color, width)
}

function drawCircle(center, radius, color){
  ctx.beginPath()
   ctx.arc(center.x, center.y, radius, 0, Math.PI * 2)
   ctx.strokeStyle = color
   ctx.stroke()
   ctx.closePath()
}

function moveTowards(p1, p2, fixedLength, currentDirection){ // P1 to P2
  const targetDirection = {
    x: p2.x - p1.x,
    y: p2.y - p1.y
  }
  const angle = angleBetweenPoints(targetDirection, currentDirection)
  if (Math.abs(angle > maxTurnAngle)) {
    const newAngle = angle - (angle < 0 ? maxTurnAngle : -maxTurnAngle)
    const slope = Math.tan(newAngle) 
    const intersection = findIntersectionPoint(slope, targetDirection.x, targetDirection.y, fixedLength) 
    return {x: p1.x + intersection.x, y: p1.y + intersection.y}
  }

    const distance = Math.sqrt(targetDirection.x ** 2 + targetDirection.y ** 2)
  const normalizedDirection = {
      x: targetDirection.x / distance,
      y: targetDirection.y / distance
  }

  let newX = p2.x - normalizedDirection.x * fixedLength 
  let newY = p2.y - normalizedDirection.y * fixedLength
  return  { x: newX, y: newY } 
}
