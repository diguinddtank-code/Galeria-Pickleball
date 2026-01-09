import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Admin } from './pages/Admin';
import { EventView } from './pages/EventView';
import { CartProvider } from './context/CartContext';
import { CartDrawer } from './components/CartDrawer';

const App: React.FC = () => {
  return (
    <CartProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
          <Navbar />
          <CartDrawer />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/login" element={<Admin />} />
              <Route path="/event/:id" element={<EventView />} />
            </Routes>
          </main>
          
          <footer className="bg-white border-t border-gray-200 mt-auto py-8">
              <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
                  <p>&copy; {new Date().getFullYear()} PickleballBH. Todos os direitos reservados.</p>
                  <p className="mt-1">Desenvolvido com tecnologia Gemini.</p>
              </div>
          </footer>
        </div>
      </Router>
    </CartProvider>
  );
};

export default App;