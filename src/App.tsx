import ChatInterface from './components/ChatInterface';
import DarkModeToggle from './components/DarkModeToggle';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Chat Assistant</h1>
          <DarkModeToggle />
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ChatInterface />
      </main>
    </div>
  );
}

export default App;
