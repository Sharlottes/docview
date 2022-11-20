import React from 'react';

function App() {
  React.useEffect(() => {
    for (const child of Object.entries(document.children)) {
      console.log('react App component has been mounted! there are ', child, ' in this document')
    }
  }, []);
  return (
    <div style={{ width: '200px' }}>
      Q: 왜 리액트가 있나요?<br />
      A: 간지나잖아요.
    </div>
  );
}

export default App;
