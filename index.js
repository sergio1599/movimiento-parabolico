const btnStart = document.getElementById("start");
const btnPause = document.getElementById("pause_resume");
const btnReset = document.getElementById("reset");

// first movement
const iH = document.getElementById("ih");
const iV = document.getElementById("iv");
const iA = document.getElementById("ia");
const fr = document.getElementById("fr");
const ag = document.getElementById("ag");
// Second movement
const iH2 = document.getElementById("ih2");
const iV2 = document.getElementById("iv2");
const iA2 = document.getElementById("ia2");
const ag2 = document.getElementById("ag2");
const fr2 = document.getElementById("fr2");

const sP = document.getElementById("sp");
const sH = document.getElementById("sh");
const sV = document.getElementById("sv");
const sC = document.getElementById("sc");
const sA = document.getElementById("sa");
const sG = document.getElementById("sg");

let calMaxHeight = 0;
let calMaxHeight2 = 0;
let calMaxDistance = 0;
let calMaxDistance2 = 0;

const maxHeightElement = document.getElementById("maxHeight");
const maxDistanceElement = document.getElementById("maxDistance");
const riseTimeElement = document.getElementById("riseTime");
const flyTimeElement = document.getElementById("flyTime");

const maxHeightElement2 = document.getElementById("maxHeight2");
const maxDistanceElement2 = document.getElementById("maxDistance2");
const riseTimeElement2 = document.getElementById("riseTime2");
const flyTimeElement2 = document.getElementById("flyTime2");

const canvas = document.getElementById("c");
var ctx = canvas.getContext("2d");

const width = 1100; // Ancho inicial
const height = 830; // Altura inicial
canvas.width = width;
canvas.height = height;

let frameRate = 240;
let intervalMs = Math.floor(1000 / frameRate);

const toRad = (angle) => angle * (Math.PI / 180);
const xOffset = 30;
const yOffset = height - 30;
const textOffset = 30;
let g = ag.value;
let g2 = ag2.value;
let radius = 10;

let frame = 0;
let intervalHandle = null;

const iAngle = iA.value;
const iAngle2 = iA2.value;
const iVelocity = iV.value;
const iVelocity2 = iV2.value;
const iHeight = iH.value;
const iHeight2 = iH2.value;
const acelerationGravity = ag.value;
const acelerationGravity2 = ag2.value;

const setupInterval = () => {
  intervalHandle = setInterval(tick, intervalMs);
};

const removeInterval = () => {
  if (!intervalHandle) return;
  clearInterval(intervalHandle);
  intervalHandle = null;
};

let initialHeight = 0; // initial height
let initialVelocity = 0; // initial velocity (m/s)
let initialAngle = 0; // launch angle (degrees)
let initialHeight2 = 0; // initial height
let initialVelocity2 = 0; // initial velocity (m/s)
let initialAngle2 = 0; // launch angle (degrees)

let showPath = true; // show path
let showHorizontal = false; // show horizontal
let showVertical = false; // show vertical
let showCoordinates = false; // show coordinates
let showAxes = true; // show axes
let showGrid = false; // show grid

let angle = 0;
let vCos = 0;
let vSin = 0;
let flightTime = 0;
let angle2 = 0;
let vCos2 = 0;
let vSin2 = 0;
let flightTime2 = 0;
let xReference = -1;

const enableInputs = () => {
  btnStart.removeAttribute("disabled");
  btnPause.setAttribute("disabled", "disabled");
  btnReset.setAttribute("disabled", "disabled");
  iH.removeAttribute("disabled");
  iV.removeAttribute("disabled");
  iA.removeAttribute("disabled");
  fr.removeAttribute("disabled");
  ag.removeAttribute("disabled");
  sP.removeAttribute("disabled");
  sH.removeAttribute("disabled");
  sV.removeAttribute("disabled");
  sC.removeAttribute("disabled");
  sA.removeAttribute("disabled");
  sG.removeAttribute("disabled");
  iH2.removeAttribute("disabled");
  iV2.removeAttribute("disabled");
  iA2.removeAttribute("disabled");
  ag2.removeAttribute("disabled");
  ag2.removeAttribute("disabled");
  fr2.removeAttribute("disabled");
};

const disableInputs = () => {
  btnStart.setAttribute("disabled", "disabled");
  btnPause.removeAttribute("disabled");
  btnReset.removeAttribute("disabled");
  iH.setAttribute("disabled", "disabled");
  iV.setAttribute("disabled", "disabled");
  iA.setAttribute("disabled", "disabled");
  fr.setAttribute("disabled", "disabled");
  ag.setAttribute("disabled", "disabled");
  sP.setAttribute("disabled", "disabled");
  sH.setAttribute("disabled", "disabled");
  sV.setAttribute("disabled", "disabled");
  sC.setAttribute("disabled", "disabled");
  sA.setAttribute("disabled", "disabled");
  sG.setAttribute("disabled", "disabled");
  iH2.setAttribute("disabled", "disabled");
  iV2.setAttribute("disabled", "disabled");
  iA2.setAttribute("disabled", "disabled");
  ag2.setAttribute("disabled", "disabled");
  fr2.setAttribute("disabled", "disabled");
};

const drawAxes = () => {
  ctx.beginPath();
  ctx.moveTo(xOffset, yOffset);
  ctx.lineTo(canvas.width - xOffset, yOffset);
  ctx.stroke();

  ctx.fillText("m", canvas.width - xOffset + 5, yOffset + 2);
  for (let i = 0; i <= width - 100; i += 50) {
    ctx.fillText(`${i} m`, xOffset + i - 5, yOffset + textOffset);
  }

  ctx.beginPath();
  ctx.moveTo(xOffset, yOffset);
  ctx.lineTo(xOffset, canvas.height - yOffset);
  ctx.stroke();

  ctx.fillText("m", xOffset - 5, 20);
  for (let i = yOffset; i >= canvas.height - yOffset; i -= 50) {
    ctx.fillText(`${yOffset - i} m`, xOffset - textOffset, i + 2);
  }
};

const drawGrid = () => {
  ctx.strokeStyle = "#999";

  for (let i = 50; i <= width - 100; i += 50) {
    ctx.beginPath();
    ctx.moveTo(xOffset + i, yOffset);
    ctx.lineTo(xOffset + i, canvas.height - yOffset);
    ctx.stroke();
  }

  for (let i = yOffset; i >= canvas.height - yOffset; i -= 50) {
    ctx.beginPath();
    ctx.moveTo(xOffset, i);
    ctx.lineTo(canvas.width - xOffset, i);
    ctx.stroke();
  }

  ctx.strokeStyle = "#000";
};

const drawCircle = (x, y) => {
  if (y <= 802) {
    ctx.moveTo(x, y);
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.stroke();
  } else if (y >= 801 && xReference === -1) {
    xReference = x;
  } else {
    ctx.moveTo(xReference, 801);
    ctx.beginPath();
    ctx.arc(xReference, 801, radius, 0, 2 * Math.PI);
    ctx.stroke();
  }
};

const drawPath = () => {
  ctx.strokeStyle = "#00f";

  let px = 0;
  let py = 0;
  let px2 = 0;
  let py2 = 0;

  for (let i = 0; i <= frame; i++) {
    let t = tCoordinate(i); // t in seconds

    let x = xCoordinate(t);
    let y = yCoordinate(t);

    if (!px) px = x;
    if (!py) py = y;

    if (px >= 0 && px <= 1200 && py >= 0 && py <= 800) {
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    px = x;
    py = y;
  }
  ctx.strokeStyle = "#000";

  for (let i = 0; i <= frame; i++) {
    let t = tCoordinate(i); // t in seconds

    let x2 = xCoordinate2(t);
    let y2 = yCoordinate2(t);

    if (!px2) px2 = x2;
    if (!py2) py2 = y2;

    if (px2 >= 0 && px2 <= 1200 && py2 >= 0 && py2 <= 800) {
      ctx.beginPath();
      ctx.moveTo(px2, py2);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    px2 = x2;
    py2 = y2;
  }

  ctx.strokeStyle = "#000";
};

const drawVertical = (x) => {
  ctx.beginPath();
  ctx.moveTo(x, 0);
  ctx.lineTo(x, canvas.height);
  ctx.stroke();
};

const drawHorizontal = (y) => {
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(canvas.width, y);
  ctx.stroke();
};

const drawCoordinates = (x, y) => {
  ctx.fillText("t: " + tCoordinate(frame).toFixed(3) + "s", x + 10, y - 50);
  ctx.fillText("x: " + (x - xOffset).toFixed(3) + "m", x + 10, y - 40);
  ctx.fillText("y: " + (yOffset - y).toFixed(3) + "m", x + 10, y - 30);
};

const reset = () => {
  initialHeight = iH.value;
  initialHeight2 = iH2.value;
  initialVelocity = iV.value;
  initialVelocity2 = iV2.value;
  initialAngle = iA.value;
  initialAngle2 = iA2.value;
  radius = 10;
  xReference = -1;
  frameRate = fr.value;
  g = ag.value;
  g2 = ag2.value;

  intervalMs = Math.floor(1000 / frameRate);

  showPath = sP.checked;
  showHorizontal = sH.checked;
  showVertical = sV.checked;
  showCoordinates = sC.checked;
  showAxes = sA.checked;
  showGrid = sG.checked;

  angle = toRad(initialAngle);
  angle2 = toRad(initialAngle2);
  vCos = initialVelocity * Math.cos(angle);
  vSin = initialVelocity * Math.sin(angle);
  vCos2 = initialVelocity2 * Math.cos(angle2);
  vSin2 = initialVelocity2 * Math.sin(angle2);

  removeInterval();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  showAxes && drawAxes();
  showGrid && drawGrid();
  drawCircle(xOffset, yOffset - initialHeight);
  drawCircle(xOffset, yOffset - initialHeight2);
  frame = 0;
  enableInputs();
};

reset();

const tCoordinate = (frame) => (frame * intervalMs) / 1000;
const xCoordinate = (t) => xOffset + vCos * t;
const yCoordinate = (t) =>
  yOffset - initialHeight - (vSin * t - (g * t * t) / 2);
const xCoordinate2 = (t) => xOffset + vCos2 * t;
const yCoordinate2 = (t) =>
  yOffset - initialHeight2 - (vSin2 * t - (g2 * t * t) / 2);

const draw = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let t = tCoordinate(frame); // t in seconds

  x = xCoordinate(t);
  y = yCoordinate(t);
  x2 = xCoordinate2(t);
  y2 = yCoordinate2(t);

  drawCircle(x, y);
  drawCircle(x2, y2);
  showPath && drawPath();
  if (showHorizontal) {
    drawHorizontal(y);
    drawHorizontal(y2);
  }
  if (showVertical) {
    drawVertical(x);
    drawVertical(x2);
  }
  if (showCoordinates) {
    drawCoordinates(x, y);
    drawCoordinates(x2, y2);
  }
  showAxes && drawAxes();
  showGrid && drawGrid();

  if (y >= yOffset && y2 >= yOffset && frame > 0) {
    frame = 0;
    removeInterval();
  }
};

const tick = () => {
  draw();
  frame++;
};

btnStart.addEventListener("click", () => {
  if (intervalHandle) return;

  const calAngle = (iA.value * Math.PI) / 180;
  const calAngle2 = (iA2.value * Math.PI) / 180;

  /* Primer  masa */
  calMaxHeight =
    Number(iH.value) +
    (Math.pow(iV.value, 2) * Math.pow(Math.sin(calAngle), 2)) /
      (2 * ag.value);

  maxHeightElement.textContent =
    "Altura máxima: " + calMaxHeight.toFixed(2) + "m";

  if (iH.value > 0) {
    vx = iV.value * Math.cos(calAngle);
    vy = iV.value * Math.sin(calAngle);

    flightTime =
      (vy +
        Math.sqrt(Math.pow(vy, 2) + 2 * ag.value * iH.value)) /
      ag.value;
    flyTimeElement.textContent =
      "Tiempo de vuelo: " + flightTime.toFixed(2) + "s";

    upTime = flightTime / 2;
    riseTimeElement.textContent =
      "Tiempo de subida: " + upTime.toFixed(2) + "s";

    calMaxDistance = vx * flightTime;
  } else {
    flightTime = 2 * ((iV.value * Math.sin(calAngle)) / ag.value);
    flyTimeElement.textContent =
      "Tiempo de vuelo: " + flightTime.toFixed(2) + "s";

    upTime = (iV.value * Math.sin(calAngle)) / ag.value;
    riseTimeElement.textContent =
      "Tiempo de subida: " + upTime.toFixed(2) + "s";

    calMaxDistance = 0 + iV.value * Math.cos(calAngle) * flightTime;
  }
  maxDistanceElement.textContent =
    "Distancia recorrida: " + calMaxDistance.toFixed(2) + "m";

  /* Segunda masa */
  calMaxHeight2 =
    Number(iH2.value) +
    (Math.pow(iV2.value, 2) * Math.pow(Math.sin(calAngle2), 2)) /
      (2 * ag2.value);
  maxHeightElement2.textContent =
    "Altura máxima 2: " + calMaxHeight2.toFixed(2) + "m";

  if (iH2.value > 0) {
    vx2 = iV2.value * Math.cos(calAngle2);
    vy2 = iV2.value * Math.sin(calAngle2);

    flightTime2 =
      (vy2 +
        Math.sqrt(
          Math.pow(vy2, 2) + 2 * ag2.value * iH2.value
        )) /
      ag2.value;
    flyTimeElement2.textContent =
      "Tiempo de vuelo: " + flightTime2.toFixed(2) + "s";

    upTime2 = flightTime2 / 2;
    riseTimeElement2.textContent =
      "Tiempo de subida: " + upTime2.toFixed(2) + "s";

    calMaxDistance2 = vx2 * flightTime2;
  } else {
    flightTime2 = 2 * ((iV2.value * Math.sin(calAngle2)) / ag2.value);
    flyTimeElement2.textContent =
      "Tiempo de vuelo: " + flightTime2.toFixed(2) + "s";

    upTime2 = (iV2.value * Math.sin(calAngle2)) / ag2.value;
    riseTimeElement2.textContent =
      "Tiempo de subida: " + upTime2.toFixed(2) + "s";

    calMaxDistance2 = 0 + iV2.value * Math.cos(calAngle2) * flightTime2;
  }

  maxDistanceElement2.textContent =
    "Distancia recorrida: " + calMaxDistance2.toFixed(2) + "m";

  setupInterval();

  disableInputs();
});

btnPause.addEventListener("click", () => {
  if (intervalHandle) {
    removeInterval();
    btnPause.textContent = "Reanudar";
  } else {
    setupInterval();
    btnPause.textContent = "Pausar";
  }
});

btnReset.addEventListener("click", reset);

Array.from(document.getElementsByTagName("input")).forEach((e) => {
  e.addEventListener("change", reset);
});
