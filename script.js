const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas dimensions
canvas.width = 800;
canvas.height = 400;

// Load images
const cowImage = new Image();
cowImage.src = 'assets/images/cow.png'; // Adjust path if needed

const bugImage = new Image();
bugImage.src = 'assets/images/bug.png'; // Adjust path if needed

const gameOverImage = new Image();
gameOverImage.src = 'assets/images/game_over.jpeg'; // Adjust path if needed

// Cow properties
const cow = {
    x: 50, // Keep x fixed
    y: 200,
    width: 80,
    height: 60,
    verticalSpeed: 0,
    gravity: 0.1,
    jumpStrength: -5
};

// Bug properties (array of these)
let obstacles = [];
const obstacleWidth = 40;
const obstacleHeight = 40;
const obstacleSpawnRate = 150; // Adjust for frequency
let obstacleSpawnCounter = 0;
const obstacleSpeed = 1.5;
const obstacleSpawnVariance = 100;

// Game state
let gameStarted = false;
let score = 0;
let gameOver = false; // New game over state

// Audio elements
const backgroundMusic = document.getElementById('backgroundMusic');
const collisionSound = document.getElementById('collisionSound');

function startGame() {
    cow.y = 200;
    cow.verticalSpeed = 0;
    obstacles.length = 0;
    score = 0;
    obstacleSpawnCounter = 0;
    gameOver = false; // Reset game over state
    gameStarted = true;
    backgroundMusic.currentTime = 0; // Reset music to start
    backgroundMusic.play(); // Start playing the music
}

function spawnObstacle() {
    const spawnCenterY = cow.y;
    const randomOffset = (Math.random() * 2 - 1) * obstacleSpawnVariance;
    let randomY = spawnCenterY + randomOffset;

    if (randomY < 0) {
        randomY = 0;
    } else if (randomY > canvas.height - obstacleHeight) {
        randomY = canvas.height - obstacleHeight;
    }

    obstacles.push({
        x: canvas.width,
        y: randomY,
        width: obstacleWidth,
        height: obstacleHeight
    });
}

function updateObstacles() {
    if (!gameStarted || gameOver) return;

    obstacleSpawnCounter++;
    if (obstacleSpawnCounter >= obstacleSpawnRate) {
        spawnObstacle();
        obstacleSpawnCounter = 0;
    }

    for (let i = 0; i < obstacles.length; i++) {
        obstacles[i].x -= obstacleSpeed;
    }

    obstacles = obstacles.filter(obstacle => obstacle.x + obstacleWidth > 0);
}

function updateCow() {
    if (!gameStarted || gameOver) return;

    cow.y += cow.verticalSpeed;
    cow.verticalSpeed += cow.gravity;

    if (cow.y > canvas.height - cow.height) {
        cow.y = canvas.height - cow.height;
        cow.verticalSpeed = 0;
    }
    if (cow.y < 0) {
        cow.y = 0;
        cow.verticalSpeed = 0;
    }
}

function checkCollision() {
    if (!gameStarted || gameOver) return false;

    for (const obstacle of obstacles) {
        if (
            cow.x < obstacle.x + obstacleWidth &&
            cow.x + cow.width > obstacle.x &&
            cow.y < obstacle.y + obstacleHeight &&
            cow.y + cow.height > obstacle.y
        ) {
            gameOver = true; // Set game over state
            backgroundMusic.pause(); // Stop background music
            collisionSound.currentTime = 0; // Reset sound to start
            collisionSound.play(); // Play collision sound
            return true;
        }
    }
    return false;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(cowImage, cow.x, cow.y, cow.width, cow.height);

    for (const obstacle of obstacles) {
        ctx.drawImage(bugImage, obstacle.x, obstacle.y, obstacleWidth, obstacleHeight);
    }

    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + Math.floor(score), 10, 30);

    if (!gameStarted) {
        ctx.fillStyle = 'black';
        ctx.font = '30px Arial';
        const startText = 'Press Space to Start';
        const textWidth = ctx.measureText(startText).width;
        const textX = (canvas.width - textWidth) / 2;
        const textY = canvas.height / 2;
        ctx.fillText(startText, textX, textY);
    }

    // Draw game over image
    if (gameOver) {
        const imageX = (canvas.width - gameOverImage.width) / 2;
        const imageY = (canvas.height - gameOverImage.height) / 2;
        ctx.drawImage(gameOverImage, imageX, imageY);
        ctx.fillStyle = 'black';
        ctx.font = '30px Arial';
        const gameOverText = 'Game Over! Score: ' + Math.floor(score);
        const gameOverTextWidth = ctx.measureText(gameOverText).width;
        const gameOverTextX = (canvas.width - gameOverTextWidth) / 2;
        const gameOverTextY = imageY + gameOverImage.height + 40; // Position below the image
        ctx.fillText(gameOverText, gameOverTextX, gameOverTextY);

        ctx.font = '20px Arial';
        const restartText = 'Press Space to Restart';
        const restartTextWidth = ctx.measureText(restartText).width;
        const restartTextX = (canvas.width - restartTextWidth) / 2;
        const restartTextY = gameOverTextY + 30;
        ctx.fillText(restartText, restartTextX, restartTextY);
    }
}

function gameLoop() {
    if (!gameOver) {
        updateCow();
        updateObstacles();
        checkCollision();
        if (gameStarted) {
            score += 0.01;
        }
    }
    draw();
    requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        if (!gameStarted) {
            startGame();
        } else if (gameOver) {
            gameOver = false;
            startGame(); // Restart the game
        }
    }
    if (gameStarted && !gameOver) {
        if (event.code === 'ArrowUp') {
            cow.verticalSpeed = cow.jumpStrength;
        } else if (event.code === 'ArrowDown') {
            cow.verticalSpeed = Math.abs(cow.jumpStrength);
        }
    }
});

requestAnimationFrame(gameLoop);