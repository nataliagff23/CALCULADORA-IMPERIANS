import { useState } from 'react';
import CalculadoraDealers from './components/CalculadoraDealers';
import CalculadoraCrecimiento from './components/CalculadoraCrecimiento';
import CalculadoraVentas from './components/CalculadoraVentas';

type TabType = 'dealers' | 'crecimiento' | 'ventas';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dealers');

  const tabs: { id: TabType; label: string }[] = [
    { id: 'dealers', label: 'Clientes Potenciales' },
    { id: 'crecimiento', label: 'Crecimiento' },
    { id: 'ventas', label: 'Ventas' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-t-2xl py-6 px-8 shadow-lg">
          <div className="flex items-center justify-center gap-4">
            <img src="/logo-imperians.png" alt="Imperians" className="h-12 w-12 rounded-lg object-contain" />
            <h1 className="text-3xl font-bold tracking-wide">CALCULADORAS DE RENTABILIDAD</h1>
          </div>
        </div>

        <div className="bg-white rounded-b-2xl shadow-xl overflow-hidden">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-4 px-6 font-semibold text-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-900 text-white border-b-4 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-8">
            {activeTab === 'dealers' && <CalculadoraDealers />}
            {activeTab === 'crecimiento' && <CalculadoraCrecimiento />}
            {activeTab === 'ventas' && <CalculadoraVentas />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
