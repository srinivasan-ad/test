import './App.css';
import { useState, useEffect } from 'react';
import { Stage, Container, Sprite, Graphics, Text } from '@pixi/react';

const App = () => {
  const [birdY, setBirdY] = useState(300);
  const [velocity, setVelocity] = useState(0);
  const [pipes, setPipes] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [passedPipes, setPassedPipes] = useState(0);
  const [obstacleSpeed, setObstacleSpeed] = useState(2); 

  const gravity = 0.5;
  const lift = -7;
  const gapSize = 140;

  useEffect(() => {
    const speedIncreaseInterval = 20; 
    const speedIncrement = 1; 
    const newSpeed = 2 + Math.floor(passedPipes / speedIncreaseInterval) * speedIncrement;
    setObstacleSpeed(newSpeed); 
  }, [passedPipes]);

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
        x: 800 + i * 300,
        gapY: Math.floor(Math.random() * (400 - gapSize)), 
      }));
      setPipes(initialPipes);
    }
  }, [gameOver]);

  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {
      setVelocity((prevVelocity) => prevVelocity + gravity);
      setBirdY((prevY) => Math.max(Math.min(prevY + velocity, 550), 0));

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

      if (pipes.length > 0 && pipes[pipes.length - 1].x < 500) {
        setPipes((prevPipes) => [
          ...prevPipes,
          {
            x: 800,
            gapY: Math.floor(Math.random() * (400 - gapSize)), 
          },
        ]);
      }
    }, 16);

    return () => clearInterval(interval);
  }, [velocity, pipes, gameOver, obstacleSpeed]);

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
    graphics.drawRect(pipe.x, pipe.gapY + gapSize, 50, 600 - (pipe.gapY + gapSize)); 
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
      className="relative w-[800px] h-[600px] mx-auto bg-gradient-to-b from-sky-300 to-sky-500"
    >
      <Stage
        width={800}
        height={600}
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
              x={250}
              y={250}
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
