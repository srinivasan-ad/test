import './App.css';
import { useState, useEffect } from 'react';
import { Stage, Container, Sprite, Graphics } from '@pixi/react';

const App = () => {
  const [birdY, setBirdY] = useState(300); 
  const [velocity, setVelocity] = useState(0); 
  const [pipes, setPipes] = useState([]); 

  const gravity = 0.5;
  const lift = -7
  const obstacleSpeed = 2; 
  const gapSize = 140; 


  useEffect(() => {
    const initialPipes = Array.from({ length: 3 }, (_, i) => ({
      x: 800 + i * 300, 
      gapY: Math.floor(Math.random() * (400 - gapSize)),
    }));
    setPipes(initialPipes);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setVelocity((prevVelocity) => prevVelocity + gravity);
      setBirdY((prevY) => Math.max(Math.min(prevY + velocity, 550), 0));

      setPipes((prevPipes) =>
        prevPipes.map((pipe) => ({
          ...pipe,
          x: pipe.x - obstacleSpeed,
        })).filter((pipe) => pipe.x > -50)
      );
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
  }, [velocity, pipes]);
  const handleTap = () => {
    setVelocity(lift); 
  };

  const renderPipes = (graphics, pipe) => {
    graphics.clear();
    graphics.beginFill(0x00ff00); 
    graphics.drawRect(pipe.x, 0, 50, pipe.gapY);
    graphics.drawRect(pipe.x, pipe.gapY + gapSize, 50, 600 - (pipe.gapY + gapSize));
    graphics.endFill();
  };

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
        </Container>
      </Stage>
    </div>
  );
};

export default App;
