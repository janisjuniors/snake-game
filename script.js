const board = document.querySelector('.board');
const scores = document.querySelector('.scores');
const screenControls = document.querySelectorAll('.material-symbols-outlined');
const gameOverDialog = document.querySelector('.game-over-dialog');
const restartGameButton = document.querySelector('.restart-game-button');

const boardHorizontalSquares = 30;
const boardVerticalSquares = 30;

const highScoreStorageKey = 'high-score';

let foodPositionX = Math.floor(Math.random() * boardHorizontalSquares) + 1;
let foodPositionY = Math.floor(Math.random() * boardVerticalSquares) + 1;

let snakeHeadX = Math.floor(Math.random() * boardHorizontalSquares) + 1;
let snakeHeadY = Math.floor(Math.random() * boardVerticalSquares) + 1;
let snakeBody = [];

let velocityX = 0;
let velocityY = 0;

let gameOver = false;

let score = 0;

let boardUpdateInterval;

const violatesBoardBoundaries = () => {
    return snakeHeadX <= 0 || snakeHeadX > boardHorizontalSquares || snakeHeadY <= 0 || snakeHeadY > boardVerticalSquares;
};

const handleGameOver = () => {
    clearInterval(boardUpdateInterval);
    gameOverDialog.showModal();
};

restartGameButton.addEventListener('click', () => {
    gameOverDialog.close();
})

gameOverDialog.addEventListener('close', () => {
    resetGame();
})

const isTouchingFood = () => {
    return snakeHeadX === foodPositionX && snakeHeadY === foodPositionY;
};

const changeFoodPosition = () => {
    foodPositionX = Math.floor(Math.random() * boardHorizontalSquares) + 1;
    foodPositionY = Math.floor(Math.random() * boardVerticalSquares) + 1;
};

const changeSnakesHeadPosition = () => {
    snakeHeadX = Math.floor(Math.random() * boardHorizontalSquares) + 1;
    snakeHeadY = Math.floor(Math.random() * boardVerticalSquares) + 1;
};

const eatFood = () => {
    snakeBody.push([foodPositionX, foodPositionY]);
};

const getHighScore = () => {
    const item = localStorage.getItem(highScoreStorageKey);
    return item ? Number(JSON.parse(item)) : 0;
};

const initializeScores = () => {
    scores.querySelector('.high').innerHTML = `High score: ${ getHighScore() }`;
    scores.querySelector('.current').innerHTML = 'Score: 0';
};

const updateScores = () => {
    score++;

    if (score > getHighScore()) {
        localStorage.setItem(highScoreStorageKey, String(score));
        scores.querySelector('.high').innerHTML = `High score: ${ getHighScore() }`;
    }

    scores.querySelector('.current').innerHTML = `Score: ${ score }`;
};

const updateBoard = () => {
    let boardInnerHTML = `<span class="food" style="grid-area: ${ foodPositionY } / ${ foodPositionX }"></span>`;

    if (isTouchingFood()) {
        changeFoodPosition();
        eatFood();
        updateScores();
    }

    for (let index = snakeBody.length - 1; index > 0; index--) {
        snakeBody[index] = snakeBody[index - 1]; // Move the snakes tail forward.
    }

    snakeHeadX += velocityX;
    snakeHeadY += velocityY;

    snakeBody[0] = [snakeHeadX, snakeHeadY];

    snakeBody.forEach((bodyPart, index) => {
        boardInnerHTML += `<span class="snake" style="grid-area: ${ bodyPart[1] } / ${ bodyPart[0] }"></span>`;

        if (index !== 0 && snakeBody[0][0] === bodyPart[0] && snakeBody[0][1] === bodyPart[1]) {
            gameOver = true;
        }
    });

    if (violatesBoardBoundaries() || gameOver) {
        return handleGameOver();
    }

    board.innerHTML = boardInnerHTML;
};

/**
 * Changes the snake head direction.
 * Direction change happens only in when the previous direction was not the opposite of the newly selected direction.
 *
 * Examples:
 * Valid - ArrowLeft, ArrowUp, ArrowLeft, ArrowDown.
 * Invalid - ArrowLeft, ArrowRight.
 * Invalid - ArrowUp, ArrowDown.
 *
 * @param event
 */
const changeSnakeHeadDirection = (event) => {
    if (event.key === 'ArrowLeft' && canSnakeChangeHorizontalDirection()) {
        velocityY = 0;
        velocityX = -1;
    }

    if (event.key === 'ArrowRight' && canSnakeChangeHorizontalDirection()) {
        velocityY = 0;
        velocityX = 1;
    }

    if (event.key === 'ArrowUp' && canSnakeChangeVerticalDirection()) {
        velocityY = -1;
        velocityX = 0;
    }

    if (event.key === 'ArrowDown' && canSnakeChangeVerticalDirection()) {
        velocityY = 1;
        velocityX = 0;
    }
};

/**
 * Checks the snake head's X position and the snake head's closest body part's X position to determine if the snake
 * is moving in the same axis. If not, then snake can change the axis - go up or go down.
 *
 * Examples.
 *
 * Can change vertical direction as the snakes head direction change will not result in a crash.
 * [ ][ ][ ][ ][ ][ ]
 * [ ][-][-][-][>][ ]
 * [ ][ ][ ][ ][ ][ ]
 * [ ][ ][ ][ ][ ][ ]
 * [ ][ ][ ][ ][ ][ ]
 *
 * Can not change vertical direction as it will result in a loss. (the head will crash into the body)
 * [ ][ ][ ][ ][ ][ ]
 * [ ][-][-][|][ ][ ]
 * [ ][ ][ ][|][ ][ ]
 * [ ][ ][ ][v][ ][ ]
 * [ ][ ][ ][ ][ ][ ]
 *
 * @returns {boolean}
 */
const canSnakeChangeVerticalDirection = () => {
    return snakeBody[0]?.[0] !== snakeBody[1]?.[0];
}

/**
 * Checks the snake head's Y position and the snake head's closest body part's Y position to determine if the snake
 * is moving in the same axis. If not, then snake can change the axis - go left or go right.
 *
 * Examples.
 *
 * Can not change horizontal direction as it will result in a loss. (the head will crash into the body)
 * [ ][ ][ ][ ][ ][ ]
 * [ ][-][-][-][>][ ]
 * [ ][ ][ ][ ][ ][ ]
 * [ ][ ][ ][ ][ ][ ]
 * [ ][ ][ ][ ][ ][ ]
 *
 * Can change horizontal direction as the snakes head horizontal direction change will not result in a crash.
 * [ ][ ][ ][ ][ ][ ]
 * [ ][-][-][|][ ][ ]
 * [ ][ ][ ][|][ ][ ]
 * [ ][ ][ ][v][ ][ ]
 * [ ][ ][ ][ ][ ][ ]
 *
 * @returns {boolean}
 */
const canSnakeChangeHorizontalDirection = () => {
    return snakeBody[0]?.[1] !== snakeBody[1]?.[1];
}

const resetGame = () => {
    score = 0;
    snakeBody = [];
    gameOver = false;

    velocityX = 0;
    velocityY = 0;

    changeFoodPosition();

    changeSnakesHeadPosition()

    initializeScores();

    boardUpdateInterval = setInterval(updateBoard, 100);
}

addEventListener('keydown', changeSnakeHeadDirection);
screenControls.forEach((control) => {
    control.addEventListener('click', () => {
        const arrowKey = control.getAttribute('data-control');
        changeSnakeHeadDirection({ key: arrowKey });
    });
});

initializeScores();
boardUpdateInterval = setInterval(updateBoard, 100);