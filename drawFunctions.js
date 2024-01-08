export function drawCircle(ctx, center, radius = 10, color = "red", filled = true, strokeWidth = 1){
    ctx.beginPath()
    ctx.arc(center.x, center.y, radius, 0, Math.PI * 2)
    if(filled){
        ctx.fillStyle = color
        ctx.fill()
    } else {
        ctx.strokeStyle = color
        ctx.strokeWidth = strokeWidth
        ctx.stroke()
    }
    ctx.closePath()
}

export function drawSegmentBetweenPoints(ctx, p1, p2, width = 10, color = "red"){
    ctx.beginPath()
    ctx.lineWidth = width
    ctx.strokeStyle = color
    ctx.moveTo(p1.x, p1.y)
    ctx.lineTo(p2.x, p2.y)
    ctx.stroke()
    ctx.closePath()
}
export function drawSegmentWithAngle(ctx, p1, rad, length, width = 10, color = "red") {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.translate(p1.x, p1.y);
    ctx.rotate(rad);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(length, 0);
    ctx.stroke();
    ctx.restore();
}


export function clearCanvas(ctx, color = undefined){
    if(color){
        ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height)
        ctx.fillStyle = color
        ctx.fill()
    } else {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    }
}

