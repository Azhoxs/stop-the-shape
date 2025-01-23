const shape = document.querySelector('.shape');
const greenZone = document.querySelector('.green-zone');
const scoreDisplay = document.getElementById('score');
const bestRecordDisplay = document.getElementById('best-record');
const gameContainer = document.getElementById('game-container');
const topScoresList = document.getElementById('top-scores-list');

let score = 0;
let bestRecord = localStorage.getItem('bestRecord') || 0;
let movingRight = true;
let shapePosition = 0;
let interval;
let gameStarted = false;
let shapeSpeed = 2;

let bestScores = JSON.parse(localStorage.getItem('bestScores')) || [];

// Afficher les meilleurs scores
function displayBestScores() {
    bestScores.sort((a, b) => b.score - a.score);
    bestScores = bestScores.slice(0, 3); // Garder seulement les 3 meilleurs scores
    topScoresList.innerHTML = bestScores.map((entry, index) => `${index + 1}. ${entry.name}: ${entry.score}`).join('<br>');
}

displayBestScores();

// Start the movement of the shape
function startGame() {
    interval = setInterval(moveShape, 10);
}

// Move the shape back and forth
function moveShape() {
    const containerWidth = gameContainer.offsetWidth;
    const shapeWidth = shape.offsetWidth;

    if (movingRight) {
        shapePosition += shapeSpeed;
        if (shapePosition + shapeWidth >= containerWidth) {
            movingRight = false;
        }
    } else {
        shapePosition -= shapeSpeed;
        if (shapePosition <= 0) {
            movingRight = true;
        }
    }

    shape.style.left = shapePosition + 'px';
}

// Stop the shape and check if it's within the green zone
function stopShape() {
    clearInterval(interval);
    const shapeRect = shape.getBoundingClientRect();
    const greenZoneRect = greenZone.getBoundingClientRect();

    const shapeWidth = shapeRect.width;
    const overlapLeft = Math.max(shapeRect.left, greenZoneRect.left);
    const overlapRight = Math.min(shapeRect.right, greenZoneRect.right);
    const overlapWidth = Math.max(0, overlapRight - overlapLeft);

    if (overlapWidth >= 0.6 * shapeWidth) {
        score++;
        scoreDisplay.textContent = `Score: ${score}`;
        updateZoneAndShape();
        resetShape();
    } else {
        if (score > bestRecord) {
            bestRecord = score;
            localStorage.setItem('bestRecord', bestRecord);
            bestRecordDisplay.textContent = `Record: ${bestRecord}`;
        }
        if (score > (bestScores[2]?.score || 0)) {
            const playerName = prompt('Nouveau record ! Entrez votre pseudo :');
            bestScores.push({ name: playerName, score: score });
            bestScores.sort((a, b) => b.score - a.score);
            bestScores = bestScores.slice(0, 3); // Garder seulement les 3 meilleurs scores
            localStorage.setItem('bestScores', JSON.stringify(bestScores));
            displayBestScores();
        }
        alert(`Game Over! Your score: ${score}`);
        window.location.reload();
    }
}

// Reset the shape position and start moving again
function resetShape() {
    shapePosition = movingRight ? 0 : gameContainer.offsetWidth - shape.offsetWidth;
    shapeSpeed = 2 + score * 0.5; // Increase speed with score
    if (gameStarted) {
        startGame();
    }
}

// Update the size and position of the zones and shape
function updateZoneAndShape() {
    const containerWidth = gameContainer.offsetWidth;

    // Randomize the green zone size and position
    const greenZoneWidth = Math.random() * 5 + 5; // Width between 5% and 10%
    const greenZoneLeft = Math.random() * (100 - greenZoneWidth); // Position between 0% and (100% - width)

    greenZone.style.width = `${greenZoneWidth}%`;
    greenZone.style.left = `${greenZoneLeft}%`;

    // Adjust the red zones to be on either side of the green zone
    const leftRedZone = document.querySelector('.red-zone.left');
    const rightRedZone = document.querySelector('.red-zone.right');

    leftRedZone.style.width = `${greenZoneLeft}%`;
    rightRedZone.style.width = `${100 - greenZoneLeft - greenZoneWidth}%`;

    // Randomize the shape size and type
    const shapeType = Math.random();
    const shapeSize = Math.random() * 20 + 20 - score; // Size between 20px and 40px, decreasing with score
    const shapeHeight = Math.random() * 20 + 20; // Height between 20px and 40px
    const shapeTop = Math.random() * (gameContainer.offsetHeight - shapeHeight); // Random top position

    shape.style.width = `${Math.max(shapeSize, 10)}px`; // Ensure minimum size of 10px
    shape.style.height = `${Math.max(shapeHeight, 10)}px`;
    shape.style.top = `${shapeTop}px`;

    // Remove circle shapes
    if (shapeType < 0.5) {
        shape.style.borderRadius = '0'; // Square or rectangle
    } else {
        shape.style.borderRadius = '0'; // Rectangle
        shape.style.width = `${Math.max(shapeSize * 2, 20)}px`; // Ensure minimum width of 20px
    }

    // Randomize shape direction
    movingRight = Math.random() < 0.5;
}

// Listen for spacebar press
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        if (!gameStarted) {
            gameStarted = true;
            startGame();
        } else {
            stopShape();
        }
    }
});

// Initialize the game
updateZoneAndShape();
resetShape();