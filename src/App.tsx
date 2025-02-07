import ChatInterface from './components/ChatInterface';
import DarkModeToggle from './components/DarkModeToggle';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      <header className="sticky top-0 z-10 backdrop-blur-lg bg-white/70 dark:bg-gray-800/70 border-b border-gray-200/80 dark:border-gray-700/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
              Perplexity AI
            </h1>
          </div>
          <DarkModeToggle />
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ChatInterface />
      </main>
    </div>
  );
}

export default App;
