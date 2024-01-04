const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const mainContainer = document.getElementById("main-container");

const canvasColor = "black";

const jointRadius = 2;

// data for head
// data for body
// maybe an obj?
const bodySegments = 20;
const baseSegmentLength = 10;
// data for tail
const tailSegments = 15;
const tailGrowthRate = 1.15;

const creatureColor = "white";
const maxTurnAngle = degreesToRadians(20);
const pushInterval = 2;
const pushForce = 10;

const body = [];

let mousePosition = { x: canvas.width, y: canvas.height / 2 };

resizeCanvas();
clearCanvas();
generateCreature();
drawBody();
gameLoop();

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
  }, 17);
}

function update() {
  body[0].point = mousePosition

  // for(let i = 1; i < body.length; i++){
  //   const newPosition = moveTowards(body[i].point, body[i-1].point, baseSegmentLength, body[i].direction) // P1 to P2
  //   body[i].direction = {x: newPosition.x - body[i].point.x, y: newPosition.y - body[i].point.y}
  //   body[i].point = newPosition
  // }
}

function render() {
  clearCanvas()
  drawBody()
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

function drawSegment(p1, p2, color) {
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.lineWidth = 1;
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

// function moveTowards(point1, point2, speed, fixedLength) {
//   const direction = {
//       x: point2.x - point1.x,
//       y: point2.y - point1.y
//   };
//   const distance = Math.sqrt(direction.x ** 2 + direction.y ** 2)
//   if(distance < speed && !fixedLength) return mousePosition
//   const normalizedDirection = {
//       x: direction.x / distance,
//       y: direction.y / distance
//   }
//   let newX
//   let newY
//   if(fixedLength) {
//       newX = point2.x - normalizedDirection.x * fixedLength 
//       newY = point2.y - normalizedDirection.y * fixedLength
//   } else {
//       newX = point1.x + normalizedDirection.x * speed
//       newY = point1.y + normalizedDirection.y * speed
//   }
//   return  { x: newX, y: newY } 
// }

function moveTowards(p1, p2, fixedLength, currentDirection){ // P1 to P2
  const targetDirection = {
    x: p2.x - p1.x,
    y: p2.y - p1.y
  }
  const angle = angleBetweenPoints(targetDirection, currentDirection)
  if (Math.abs(angle > maxTurnAngle)) {
    console.log("AH")
    const newAngle = angle - (angle < 0 ? maxTurnAngle : -maxTurnAngle)
    const slope = Math.tan(newAngle) 
    const intersection = findIntersectionPoint(slope, targetDirection.x, targetDirection.y, fixedLength) 
    console.log(intersection)
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

function angleBetweenPoints(p1, p2){
  const angleP1 = Math.atan(p1.y / p1.x);
  const angleP2 = Math.atan(p2.y / p2.x);
  return angleP2 - angleP1
}

function findIntersectionPoint(m, h, k, r) { // slope, circleX, circleY, radius
  // Calculate coefficients for the quadratic equation
  const a = 1 + m * m;
  const b = -2 * h - 2 * m * k;
  const c = h * h + k * k - r * r;

  // Calculate the discriminant
  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) console.log("AHHHHH")
      // Calculate the intersection points
      const x1 = (-b + Math.sqrt(discriminant)) / (2 * a);
      const y1 = m * x1;

      const x2 = (-b - Math.sqrt(discriminant)) / (2 * a);
      const y2 = m * x2;

      const distance1 = x1 ** 2 + y1 ** 2
      const distance2 = x2 ** 2 + y2 ** 2
      return distance1 < distance2 ? { x: x1, y: y1 } : { x: x2, y: y2 }
}


function degreesToRadians(degrees) {
  var radians = degrees * (Math.PI / 180);
  return radians;
}