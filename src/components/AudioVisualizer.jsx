import { useEffect, useState } from 'react';

const AudioVisualizer = ({ isPlaying }) => {
  const [bars, setBars] = useState(Array(20).fill(0));

  useEffect(() => {
    if (!isPlaying) {
      setBars(Array(20).fill(0));
      return;
    }

    const interval = setInterval(() => {
      setBars(prevBars =>
        prevBars.map(() => Math.random() * 100)
      );
    }, 150);

    return () => clearInterval(interval);
  }, [isPlaying]);

  if (!isPlaying) {
    return (
      <div className="w-full mt-1 flex items-end justify-center space-x-1 h-10">
        {Array(20).fill(0).map((_, i) => (
          <div
            key={i}
            className="bg-gray-300 rounded-sm transition-all duration-150"
            style={{
              width: '3px',
              height: '4px',
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full mt-1 flex items-end justify-center space-x-1 h-10">
      {bars.map((height, i) => (
        <div
          key={i}
          className="bg-blue-500 rounded-sm transition-all duration-150"
          style={{
            width: '3px',
            height: `${Math.max(4, height * 0.4)}px`,
          }}
        />
      ))}
    </div>
  );
};

export default AudioVisualizer;