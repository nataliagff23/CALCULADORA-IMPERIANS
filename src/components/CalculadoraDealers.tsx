import { useState } from 'react';

function CalculadoraDealers() {
  const [inputs, setInputs] = useState({
    inversionMensual: 1000,
    costoPorLead: 5,
    cpm: 5,
    tasaCierre: 15,
    ticketPromedio: 1900,
    tasaConversion: 5,
  });

  const [results, setResults] = useState({
    leadsGenerados: 0,
    costoAdquisicion: 0,
    citasAgendadas: 0,
    impresiones: 0,
    tasaNoShow: 0,
    shows: 0,
    ventasEstimadas: 0,
    ingresosEstimados: 0,
  });

  const handleInputChange = (field: string, value: string) => {
    setInputs({ ...inputs, [field]: parseFloat(value) || 0 });
  };

  const calcular = () => {
    const leadsGenerados = inputs.inversionMensual / inputs.costoPorLead;
    const impresiones = (leadsGenerados / inputs.tasaConversion) * 1000;
    const citasAgendadas = leadsGenerados * 0.1;
    const costoAdquisicion = inputs.inversionMensual / citasAgendadas;
    const tasaNoShow = 0.8;
    const shows = citasAgendadas * (1 - tasaNoShow / 100);
    const ventasEstimadas = shows * (inputs.tasaCierre / 100);
    const ingresosEstimados = ventasEstimadas * inputs.ticketPromedio;

    setResults({
      leadsGenerados: Math.round(leadsGenerados),
      costoAdquisicion: Math.round(costoAdquisicion),
      citasAgendadas: Math.round(citasAgendadas),
      impresiones: Math.round(impresiones),
      tasaNoShow,
      shows: Math.round(shows),
      ventasEstimadas: Math.round(ventasEstimadas),
      ingresosEstimados: Math.round(ingresosEstimados),
    });
  };

  const inputFields = [
    { key: 'inversionMensual', label: 'Inversi\u00f3n mensual ($)' },
    { key: 'costoPorLead', label: 'Costo por Lead ($)' },
    { key: 'cpm', label: 'CPM ($)' },
    { key: 'tasaCierre', label: 'Tasa de Cierre (%)' },
    { key: 'ticketPromedio', label: 'Ticket Promedio ($)' },
    { key: 'tasaConversion', label: 'Tasa de Conversi\u00f3n (%)' },
  ];

  const resultFields = [
    { key: 'leadsGenerados', label: 'Leads Generados' },
    { key: 'costoAdquisicion', label: 'Costo de Adquisici\u00f3n ($)' },
    { key: 'citasAgendadas', label: 'Citas Agendadas' },
    { key: 'impresiones', label: 'Impresiones' },
    { key: 'tasaNoShow', label: 'Tasa No-Show (%)' },
    { key: 'shows', label: 'Shows' },
    { key: 'ventasEstimadas', label: 'Ventas Estimadas' },
    { key: 'ingresosEstimados', label: 'Ingresos Estimados ($)' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-blue-900 mb-6">Calculadora de Rentabilidad para Dealers</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {inputFields.map((field) => (
          <div key={field.key} className="space-y-2">
            <label className="block bg-blue-200 text-gray-800 font-semibold py-3 px-4 rounded-lg text-center border-2 border-blue-300">
              {field.label}
            </label>
            <input
              type="number"
              value={inputs[field.key as keyof typeof inputs]}
              onChange={(e) => handleInputChange(field.key, e.target.value)}
              className="w-full border-2 border-gray-300 py-3 px-4 rounded-lg text-center text-xl font-semibold focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>
        ))}
      </div>

      <div className="flex justify-center mb-8">
        <button
          onClick={calcular}
          className="bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600 text-white font-bold py-4 px-16 rounded-full text-xl shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl"
        >
          CALCULAR
        </button>
      </div>

      <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white rounded-xl py-4 px-8 mb-8">
        <h3 className="text-xl font-bold text-center tracking-wide">RESULTADOS CLIENTES POTENCIALES</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {resultFields.map((field) => (
          <div key={field.key} className="space-y-2">
            <div className="bg-green-100 text-gray-800 font-semibold py-3 px-4 rounded-lg text-center border-2 border-green-300">
              {field.label}
            </div>
            <div className="bg-white border-2 border-gray-300 py-3 px-4 rounded-lg text-center text-xl font-bold text-blue-900">
              {results[field.key as keyof typeof results].toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CalculadoraDealers;
