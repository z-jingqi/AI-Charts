import { useState } from 'react';
import { sharedVersion } from '@ai-chart/shared';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>AI-Chart</h1>
      <p>Personal Data Intelligence Dashboard</p>

      <div style={{ marginTop: '2rem' }}>
        <button onClick={() => setCount((count) => count + 1)}>
          Count is {count}
        </button>
      </div>

      <div style={{ marginTop: '2rem', color: '#666', fontSize: '0.875rem' }}>
        <p>Shared Package Version: {sharedVersion}</p>
      </div>
    </div>
  );
}

export default App;
