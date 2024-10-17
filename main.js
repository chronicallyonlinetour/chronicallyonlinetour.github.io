const customImagePositions = [
    { x: 10, y: 105, width: 80, height: 150, rotationAngle: 15, used: false },
    { x: 370, y: 129, width: 84, height: 136, rotationAngle: -2, used: false },
    { x: 40, y: 295, width: 80, height: 140, rotationAngle: 5, used: false },
    { x: 350, y: 310, width: 80, height: 170, rotationAngle: 5, used: false },
];
const UPLOAD_BUTTON_SIZE = 50;

var canvas = null;
var ctx = null;
var CURRENT_REGION_INDEX = -1;

function main() {
    canvas = document.getElementById('canvas');

    canvas.onclick = (ev) => {
        let coords = getCursorPosition(canvas, ev);

        for (let customRegionIndex = 0; customRegionIndex < customImagePositions.length; customRegionIndex++) {
            let pos = customImagePositions[customRegionIndex];

            if (coords.x > pos.x && coords.x <= pos.x + pos.width &&
                coords.y > pos.y && coords.y <= pos.y + pos.height
            ) {
                CURRENT_REGION_INDEX = customRegionIndex;
                inp.click();
            }
        }
    }
    canvas.onmousemove = (ev) => {
        let coords = getCursorPosition(canvas, ev);

        for (let customRegionIndex = 0; customRegionIndex < customImagePositions.length; customRegionIndex++) {
            let pos = customImagePositions[customRegionIndex];
            if (pos.used) continue;

            if (coords.x > pos.x && coords.x <= pos.x + pos.width &&
                coords.y > pos.y && coords.y <= pos.y + pos.height
            ) {
                ctx.drawImage(uploadIconSrcLight, pos.x - (UPLOAD_BUTTON_SIZE - pos.width) / 2, pos.y - (UPLOAD_BUTTON_SIZE - pos.height) / 2, 50, 50);
            } else {
                ctx.drawImage(uploadIconSrcDark, pos.x - (UPLOAD_BUTTON_SIZE - pos.width) / 2, pos.y - (UPLOAD_BUTTON_SIZE - pos.height) / 2, 50, 50);
            }
        }
    };

    ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(mainSrc, 0, 0, canvas.width, canvas.height);

    for (let customRegionIndex = 0; customRegionIndex < customImagePositions.length; customRegionIndex++) {
        let pos = customImagePositions[customRegionIndex];
        ctx.drawImage(uploadIconSrcDark, pos.x - (50 - pos.width) / 2, pos.y - (50 - pos.height) / 2, 50, 50);
    }

    for (let i of customImagePositions) {
        // ctx.fillStyle = "rgba(255,0,0,0.4)";
        // ctx.fillRect(i.x, i.y, i.width, i.height);
    }
}

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

    return { x, y };
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
        ctx.drawImage(uploadIconSrcDark, pos.x - (UPLOAD_BUTTON_SIZE - pos.width) / 2, pos.y - (UPLOAD_BUTTON_SIZE - pos.height) / 2, UPLOAD_BUTTON_SIZE, UPLOAD_BUTTON_SIZE);
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