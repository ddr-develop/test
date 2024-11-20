const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const BEE_SPEED = 5;
const HEART_SPEED = 6;
const ENEMY_SPAWN_RATE = 0.02;

class Game {
    constructor() {
        this.bee = {
            x: 300,
            y: 400,
            width: 48,
            height: 48,
            element: document.getElementById('bee')
        };

        this.hearts = [];
        this.flowers = [];
        this.score = 0;
        this.gameOver = false;
        this.keysPressed = new Set();
        this.lastShot = 0;
        this.birthdayShown = false;


        this.backgroundMusic = new Audio('sounds/fondo.mp3'); // Ruta al sonido de fondo
        this.birthdaySound = new Audio('sounds/birthday.mp3');

        // Configura el sonido de fondo
        this.backgroundMusic.loop = true; // Reproducir en bucle
        this.backgroundMusic.volume = 0.5; // Ajustar el volumen



        this.setupEventListeners();
        this.gameLoop();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
                e.preventDefault();
                this.keysPressed.add(e.key);
            }
        });

        document.addEventListener('keyup', (e) => {
            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
                e.preventDefault();
                this.keysPressed.delete(e.key);
            }
        });
    }

    updateBeePosition() {
        if (this.keysPressed.has('ArrowLeft')) this.bee.x -= BEE_SPEED;
        if (this.keysPressed.has('ArrowRight')) this.bee.x += BEE_SPEED;
        if (this.keysPressed.has('ArrowUp')) this.bee.y -= BEE_SPEED;
        if (this.keysPressed.has('ArrowDown')) this.bee.y += BEE_SPEED;

        // Keep bee within bounds
        this.bee.x = Math.max(0, Math.min(GAME_WIDTH - this.bee.width, this.bee.x));
        this.bee.y = Math.max(0, Math.min(GAME_HEIGHT - this.bee.height, this.bee.y));

        this.bee.element.style.transform = `translate(${this.bee.x}px, ${this.bee.y}px)`;
    }

    shootHeart() {
        const now = Date.now();
        if (this.keysPressed.has(' ') && now - this.lastShot > 250) {
            const heart = document.createElement('div');
            heart.className = 'heart';
            heart.style.transform = `translate(${this.bee.x + 24}px, ${this.bee.y}px)`;
            document.getElementById('gameContainer').appendChild(heart);

            this.hearts.push({
                x: this.bee.x + 24,
                y: this.bee.y,
                width: 20,
                height: 20,
                element: heart
            });

            this.lastShot = now;
        }
    }

    updateHearts() {
        for (let i = this.hearts.length - 1; i >= 0; i--) {
            const heart = this.hearts[i];
            heart.y -= HEART_SPEED;
            heart.element.style.transform = `translate(${heart.x}px, ${heart.y}px)`;

            if (heart.y < -20) {
                heart.element.remove();
                this.hearts.splice(i, 1);
            }
        }
    }

    spawnFlower() {
        if (Math.random() < ENEMY_SPAWN_RATE) {
            const flower = document.createElement('div');
            flower.className = 'flower';
            for (let i = 0; i < 4; i++) {
                const petal = document.createElement('div');
                petal.className = 'petal';
                flower.appendChild(petal);
            }
            const center = document.createElement('div');
            center.className = 'flower-center';
            flower.appendChild(center);

            const x = Math.random() * (GAME_WIDTH - 40);
            flower.style.transform = `translate(${x}px, ${-40}px)`;
            document.getElementById('gameContainer').appendChild(flower);

            this.flowers.push({
                x,
                y: -40,
                width: 40,
                height: 40,
                speed: 1 + Math.random(), // Reduced from 2 + Math.random()
                element: flower
            });
        }
    }

    updateFlowers() {
        for (let i = this.flowers.length - 1; i >= 0; i--) {
            const flower = this.flowers[i];
            flower.y += flower.speed;
            flower.element.style.transform = `translate(${flower.x}px, ${flower.y}px)`;


            // Verificar si la flor toca la abeja
            if (this.isColliding(this.bee, flower)) {
                this.endGame(); // Finaliza el juego si hay colisión con la abeja
                return;
            }

            /*if (flower.y > GAME_HEIGHT) {
                flower.element.remove();
                this.flowers.splice(i, 1);
                this.endGame();
                return;
            }*/
        }
    }

    checkCollisions() {
        for (let i = this.hearts.length - 1; i >= 0; i--) {
            const heart = this.hearts[i];
            for (let j = this.flowers.length - 1; j >= 0; j--) {
                const flower = this.flowers[j];
                if (this.isColliding(heart, flower)) {
                    heart.element.remove();
                    this.hearts.splice(i, 1);
                    flower.element.remove();
                    this.flowers.splice(j, 1);
                    this.updateScore(100);
                    break;
                }
            }
        }
    }

    isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y;
    }

    updateScore(points) {
        this.score += points;
        document.getElementById('score').textContent = `Score: ${this.score}`;

        // Detener el juego cuando se alcance o supere los 1000 puntos
        if (this.score >= 1000 && !this.birthdayShown) {
            this.showBirthdayMessage(); // Mostrar el mensaje
            this.birthdayShown = true;
            this.gameOver = true; // Detener el juego
            this.cleanGameElements(); // Limpiar elementos del juego

            this.backgroundMusic.pause(); // Detener la música de fondo
            this.birthdaySound.play(); // Reproducir sonido de cumpleaños

            // Coordenadas centrales para los fuegos artificiales
            const centerX = GAME_WIDTH / 2;
            const centerY = GAME_HEIGHT / 2;

            // Generar fuegos artificiales repetidamente
            for (let i = 0; i < 135; i++) { // 135 explosiones
                setTimeout(() => this.generateFireworks(centerX, centerY), i * 500);
            }
        }


    }

    cleanGameElements() {
        // Eliminar todos los corazones y flores
        document.querySelectorAll('.heart, .flower').forEach(el => el.remove());
    }
    showBirthdayMessage() {
        const birthdayDiv = document.createElement('div');
        birthdayDiv.className = 'birthday-message';
        birthdayDiv.innerHTML = '¡Feliz Cumpleaños Wendy! 🎂✨';
        document.getElementById('gameContainer').appendChild(birthdayDiv);


        setTimeout(() => {
            // birthdayDiv.classList.add('fade-out');
            //setTimeout(() => birthdayDiv.remove(), 1000);
        }, 3000);
    }

    endGame() {
        this.gameOver = true;
        this.backgroundMusic.pause(); // Detener la música de fondo
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOver').style.display = 'flex';
    }

    gameLoop() {

        if (!this.gameOver) {
            this.backgroundMusic.play(); // Iniciar la música de fondo
            this.updateBeePosition();
            this.shootHeart();
            this.updateHearts();
            this.spawnFlower();
            this.updateFlowers();
            this.checkCollisions();
            requestAnimationFrame(() => this.gameLoop());
        }
    }

    generateFireworks(x, y) {
        for (let i = 0; i < 20; i++) { // 20 partículas
            const particle = document.createElement('div');
            particle.className = 'firework';

            // Posición inicial
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;

            // Direcciones aleatorias
            const angle = Math.random() * 2 * Math.PI; // Ángulo aleatorio
            const speed = Math.random() * 0.5 + 0.5; // Velocidad aleatoria
            particle.style.setProperty('--dx', Math.cos(angle) * speed);
            particle.style.setProperty('--dy', Math.sin(angle) * speed);

            document.getElementById('gameContainer').appendChild(particle);

            // Remover la partícula después de la animación
            setTimeout(() => particle.remove(), 1000);
        }
    }


    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
                e.preventDefault();
                this.keysPressed.add(e.key);
            }
        });

        document.addEventListener('keyup', (e) => {
            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
                e.preventDefault();
                this.keysPressed.delete(e.key);
            }
        });

        // Mobile controls
        document.getElementById('moveLeft').addEventListener('touchstart', () => this.keysPressed.add('ArrowLeft'));
        document.getElementById('moveLeft').addEventListener('touchend', () => this.keysPressed.delete('ArrowLeft'));

        document.getElementById('moveRight').addEventListener('touchstart', () => this.keysPressed.add('ArrowRight'));
        document.getElementById('moveRight').addEventListener('touchend', () => this.keysPressed.delete('ArrowRight'));

        document.getElementById('moveUp').addEventListener('touchstart', () => this.keysPressed.add('ArrowUp'));
        document.getElementById('moveUp').addEventListener('touchend', () => this.keysPressed.delete('ArrowUp'));

        document.getElementById('moveDown').addEventListener('touchstart', () => this.keysPressed.add('ArrowDown'));
        document.getElementById('moveDown').addEventListener('touchend', () => this.keysPressed.delete('ArrowDown'));

        document.getElementById('shoot').addEventListener('touchstart', () => this.keysPressed.add(' '));
        document.getElementById('shoot').addEventListener('touchend', () => this.keysPressed.delete(' '));
    }


}

function restartGame() {
    // Clean up existing game elements
    document.querySelectorAll('.heart, .flower, .birthday-message').forEach(el => el.remove());
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('score').textContent = 'Score: 0';

    // Start new game
    window.game = new Game();
}

// Start initial game


document.getElementById('startGame').addEventListener('click', () => {
    document.getElementById('menu').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'block';
    window.game = new Game();
});

document.getElementById('credits').addEventListener('click', () => {
    document.getElementById('menu').style.display = 'none';
    document.getElementById('creditsMenu').style.display = 'flex';
});

document.getElementById('backToMenu').addEventListener('click', () => {
    document.getElementById('creditsMenu').style.display = 'none';
    document.getElementById('menu').style.display = 'flex';
});


