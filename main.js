const originalImagePositions = [
    { x: 10, y: 105, width: 80, height: 150, rotationAngle: 15, used: false, hover: false },
    { x: 370, y: 129, width: 84, height: 136, rotationAngle: -2, used: false, hover: false },
    { x: 40, y: 295, width: 80, height: 140, rotationAngle: 5, used: false, hover: false },
    { x: 350, y: 310, width: 80, height: 170, rotationAngle: 2, used: false, hover: false },
];
let customImagePositions = JSON.parse(JSON.stringify(originalImagePositions));
let UPLOAD_BUTTON_SIZE = 50;

var canvas = null;
var ctx = null;
var CURRENT_REGION_INDEX = -1;
let canvasWidth = 500;
let canvasHeight = 500;
let scale = 1;

function main() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    adjustCanvasSize();

    canvas.onclick = (ev) => {
        let coords = getCursorPosition(canvas, ev);
        for (let i = 0; i < customImagePositions.length; i++) {
            let pos = customImagePositions[i];
            if (coords.x > pos.x && coords.x <= pos.x + pos.width && coords.y > pos.y && coords.y <= pos.y + pos.height) {
                CURRENT_REGION_INDEX = i;
                inp.click();
            }
        }
    };

    canvas.onmousemove = (ev) => {
        let coords = getCursorPosition(canvas, ev);
        for (let i = 0; i < customImagePositions.length; i++) {
            let pos = customImagePositions[i];
            if (pos.used) continue;

            if (coords.x > pos.x && coords.x <= pos.x + pos.width && coords.y > pos.y && coords.y <= pos.y + pos.height) {
                pos.hover = true;
            } else {
                pos.hover = false;
            }
        }

        drawCanvas();
    };

    drawCanvas();
}

function adjustCanvasSize() {
    const MAX_SCALE = 1.25;
    var scale = Math.min(window.innerWidth / canvasWidth, window.innerHeight / canvasHeight);
    scale = Math.min(MAX_SCALE, Math.max(scale, 1));
    if (scale > MAX_SCALE) scale = MAX_SCALE;

    canvas.width = canvasWidth * scale;
    canvas.height = canvasHeight * scale;

    UPLOAD_BUTTON_SIZE = scale * 50;

    for (let i = 0; i < originalImagePositions.length; i++) {
        let origPos = originalImagePositions[i];
        customImagePositions[i].x = origPos.x * scale;
        customImagePositions[i].y = origPos.y * scale;
        customImagePositions[i].width = origPos.width * scale;
        customImagePositions[i].height = origPos.height * scale;
    }

    drawCanvas();
}

function drawCanvas() {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(mainSrc, 0, 0, canvas.width, canvas.height);

    for (let pos of customImagePositions) {
        if (pos.used) continue;

        ctx.drawImage(pos.hover ? uploadIconSrcLight : uploadIconSrcDark, pos.x - (UPLOAD_BUTTON_SIZE - pos.width) / 2, pos.y - (UPLOAD_BUTTON_SIZE - pos.height) / 2, UPLOAD_BUTTON_SIZE, UPLOAD_BUTTON_SIZE);
    }
}

window.addEventListener('resize', () => {
    adjustCanvasSize();
    drawCanvas();
    reset();
});

var inp = document.createElement('input');
inp.type = 'file';
inp.accept = 'image/*';
inp.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        customImagePositions[CURRENT_REGION_INDEX].used = true;
        const img = new Image();
        const reader = new FileReader();

        reader.onload = function (event) {
            img.src = event.target.result;

            img.onload = function () {
                let CURRENT_REGION = customImagePositions[CURRENT_REGION_INDEX];
                ctx.clearRect(CURRENT_REGION.x, CURRENT_REGION.y, CURRENT_REGION.width, CURRENT_REGION.height);
                ctx.save();
                ctx.translate(CURRENT_REGION.x + CURRENT_REGION.width / 2, CURRENT_REGION.y + CURRENT_REGION.height / 2);
                ctx.rotate(CURRENT_REGION.rotationAngle * Math.PI / 180);
                ctx.drawImage(img, -CURRENT_REGION.width / 2, -CURRENT_REGION.height / 2, CURRENT_REGION.width, CURRENT_REGION.height);
                ctx.restore();
                ctx.drawImage(mainSrc, 0, 0, canvas.width, canvas.height);
            };
        };

        reader.readAsDataURL(file);
    }
});

function getCursorPosition(canvas, event) {
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    return { x: x * scale, y: y * scale };
}

function download() {
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'chronically-online.png';
    link.click();
}
function reset() {
    for (var pos of customImagePositions) {
        pos.used = false;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(mainSrc, 0, 0, canvas.width, canvas.height);

    for (let customRegionIndex = 0; customRegionIndex < customImagePositions.length; customRegionIndex++) {
        let pos = customImagePositions[customRegionIndex];
        ctx.drawImage(pos.hover ? uploadIconSrcLight : uploadIconSrcDark, pos.x - (UPLOAD_BUTTON_SIZE - pos.width) / 2, pos.y - (UPLOAD_BUTTON_SIZE - pos.height) / 2, UPLOAD_BUTTON_SIZE, UPLOAD_BUTTON_SIZE);
    }
}

var mainSrc = new Image();
var uploadIconSrcLight = new Image();
var uploadIconSrcDark = new Image();
uploadIconSrcLight.src = './res/upload-icon-light.png';
uploadIconSrcLight.onload = () => {
    uploadIconSrcDark.src = './res/upload-icon-dark.png';
    uploadIconSrcDark.onload = () => {
        mainSrc.src = './res/main-no-content.png';
        mainSrc.onload = () => {
            main();
        };
    };
};
