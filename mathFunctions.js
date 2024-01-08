export function normalizeVector(v){
    const length = getVectorLength(v)
    return {
        x: v.x / length,
        y: v.y / length
    }
}

export function getVectorLength(v){
    return getDistanceBetweenPoints({x: 0, y: 0}, v)
}

export function getDistanceBetweenPoints(p1, p2){
    return Math.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2)
}

export function multiplyVector(v, length){
    return {
        x: v.x * length,
        y: v.y * length
    }
}

export function angleBetweenPoints(p1, p2){
    const dotProduct = p1.x * p2.x + p1.y * p2.y;  
    return Math.atan2(p1.x * p2.y - p1.y * p2.x, dotProduct);
}

export function degToRad(degrees){
    return degrees * Math.PI / 180
}

export function radToDeg(rad){
    return rad * 180 / Math.PI
}

export function rotateVector(v, rads) {
    const cosTheta = Math.cos(rads);
    const sinTheta = Math.sin(rads);
    const rotatedX = v.x * cosTheta - v.y * sinTheta;
    const rotatedY = v.x * sinTheta + v.y * cosTheta;
    return { x: rotatedX, y: rotatedY };
}

export function findClosestIntersectionSlopeCircle(slope, center, radius) { // slope, circleX, circleY, radius
    // Calculate coefficients for tcenter.xe quadratic equation
    const a = 1 + slope**2;
    const b = -2 * center.x - 2 * slope * center.y;
    const c = center.x **2  + center.y **2 - radius**2;
    const discriminant = b**2 - 4 * a * c;
    if(discriminant < 0) return null
    const x1 = (-b + Math.sqrt(discriminant)) / (2 * a);
    const y1 = slope * x1;
    const x2 = (-b - Math.sqrt(discriminant)) / (2 * a);
    const y2 = slope * x2;
    const distance1 = x1 ** 2 + y1 ** 2
    const distance2 = x2 ** 2 + y2 ** 2
    return distance1 < distance2 ? { x: x1, y: y1 } : { x: x2, y: y2 }
}

export function getNormalizedVectorFromAngle(rad){
    return {
        x: Math.cos(rad),
        y: Math.sin(rad)
    }
}

export function getVectorAngle(v){
    return Math.atan2(v.y, v.x)
}

export function getVectorFromPoints(p1, p2){
    return {
        x: p2.x - p1.x,
        y: p2.y - p1.y
    }
}

export function sumVector(v1, v2){
    return {
        x: v1.x + v2.x,
        y: v1.y + v2.y
    }
}