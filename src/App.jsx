import './App.css';
import { useState, useEffect, useCallback } from 'react';
import { Stage, Container, Sprite, Graphics, Text } from '@pixi/react';

const App = () => {
  const [birdY, setBirdY] = useState(300);
  const [velocity, setVelocity] = useState(0);
  const [pipes, setPipes] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [passedPipes, setPassedPipes] = useState(0);
  const [obstacleSpeed, setObstacleSpeed] = useState(2); 
  const [stageWidth, setStageWidth] = useState(window.innerWidth);
  const [stageHeight, setStageHeight] = useState(window.innerHeight);

  const gravity = 0.6;
  const lift = -5;
  const gapSize = 140;

  useEffect(() => {
    const speedIncreaseInterval = 20; 
    const speedIncrement = 1; 
    const newSpeed = 2 + Math.floor(passedPipes / speedIncreaseInterval) * speedIncrement;
    setObstacleSpeed(newSpeed); 
  }, [passedPipes]);

  // Update stage size dynamically when window is resized
  const updateStageSize = useCallback(() => {
    setStageWidth(window.innerWidth);
    setStageHeight(window.innerHeight);
  }, []);

  useEffect(() => {
    window.addEventListener('resize', updateStageSize);
    return () => window.removeEventListener('resize', updateStageSize);
  }, [updateStageSize]);

  const resetGame = () => {
    setBirdY(300);
    setVelocity(0);
    setPipes([]);
    setScore(0);
    setPassedPipes(0);
    setObstacleSpeed(2); 
    setGameOver(false);
  };

  useEffect(() => {
    if (!gameOver) {
      const initialPipes = Array.from({ length: 3 }, (_, i) => ({
        x: stageWidth + i * 300,
        gapY: Math.floor(Math.random() * (stageHeight - gapSize)), 
      }));
      setPipes(initialPipes);
    }
  }, [gameOver, stageWidth, stageHeight]);

  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {
      setVelocity((prevVelocity) => prevVelocity + gravity);
      setBirdY((prevY) => Math.max(Math.min(prevY + velocity, stageHeight - 50), 0));

      setPipes((prevPipes) => {
        let passedPipesThisInterval = 0;

        const updatedPipes = prevPipes.map((pipe) => {
          if (pipe.x + 50 < 100 && !pipe.passed) {
            passedPipesThisInterval += 1;
            return { ...pipe, passed: true };
          }
          return { ...pipe };
        }).filter((pipe) => pipe.x > -50);

        if (passedPipesThisInterval > 0) {
          setPassedPipes((prevCount) => prevCount + passedPipesThisInterval);
          setScore((prevScore) => prevScore + passedPipesThisInterval);
        }

        return updatedPipes.map((pipe) => ({
          ...pipe,
          x: pipe.x - obstacleSpeed,
        }));
      });

      if (pipes.length > 0 && pipes[pipes.length - 1].x < stageWidth - 100) {
        setPipes((prevPipes) => [
          ...prevPipes,
          {
            x: stageWidth,
            gapY: Math.floor(Math.random() * (stageHeight - gapSize)),
          },
        ]);
      }
    }, 16);

    return () => clearInterval(interval);
  }, [velocity, pipes, gameOver, obstacleSpeed, stageHeight, stageWidth]);

  const handleTap = () => {
    if (gameOver) {
      resetGame();
    } else {
      setVelocity(lift);
    }
  };

  const renderPipes = (graphics, pipe) => {
    graphics.clear();
    graphics.beginFill(0x00ff00);
    graphics.drawRect(pipe.x, 0, 50, pipe.gapY);
    graphics.drawRect(pipe.x, pipe.gapY + gapSize, 50, stageHeight - (pipe.gapY + gapSize));
    graphics.endFill();
  };

  const checkCollision = () => {
    for (let pipe of pipes) {
      if (
        100 + 50 > pipe.x &&
        100 < pipe.x + 50 &&
        (birdY < pipe.gapY || birdY > pipe.gapY + gapSize)
      ) {
        return true;
      }
    }
    return false;
  };

  const isGameOver = checkCollision();

  useEffect(() => {
    if (isGameOver) {
      setGameOver(true);
    }
  }, [isGameOver]);

  return (
    <div
      onTouchStart={handleTap}
      onMouseDown={handleTap}
      className="relative w-full h-full overflow-hidden"
      style={{ margin: 0 }}
    >
      <Stage
        width={stageWidth}
        height={stageHeight}
        options={{ backgroundColor: 0x87ceeb }}
      >
        <Container>
          <Sprite
            image="/bunny.png"
            x={100}
            y={birdY}
            anchor={{ x: 0.5, y: 0.5 }}
          />
          {pipes.map((pipe, index) => (
            <Graphics
              key={index}
              draw={(graphics) => renderPipes(graphics, pipe)}
            />
          ))}
          <Text
            text={`Score: ${score}`}
            x={20}
            y={20}
            style={{
              fontFamily: 'Arial',
              fontSize: 24,
              fill: 0xffffff,
              align: 'center',
            }}
          />
          {gameOver && (
            <Text
              text="Game Over! Tap to Restart"
              x={stageWidth / 4}
              y={stageHeight / 2}
              style={{
                fontFamily: 'Arial',
                fontSize: 36,
                fill: 0xff0000,
                align: 'center',
              }}
            />
          )}
        </Container>
      </Stage>
    </div>
  );
};

export default App;

