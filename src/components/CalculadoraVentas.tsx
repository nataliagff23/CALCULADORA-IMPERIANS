import { useState } from 'react';

function CalculadoraVentas() {
  const [inputs, setInputs] = useState({
    inversionMensual: 5000,
    costoPorCompra: 100,
    ticketPromedio: 1000,
  });

  const [results, setResults] = useState({
    ventasEstimadas: 0,
    ingresosEstimados: 0,
    ganancia: 0,
    margenGanancia: 0,
    roas: 0,
    roi: 0,
  });

  const handleInputChange = (field: string, value: string) => {
    setInputs({ ...inputs, [field]: parseFloat(value) || 0 });
  };

  const calcular = () => {
    const ventasEstimadas = inputs.inversionMensual / inputs.costoPorCompra;
    const ingresosEstimados = ventasEstimadas * inputs.ticketPromedio;
    const ganancia = ingresosEstimados - inputs.inversionMensual;
    const margenGanancia = (ganancia / ingresosEstimados) * 100;
    const roas = ingresosEstimados / inputs.inversionMensual;
    const roi = (ganancia / inputs.inversionMensual) * 100;

    setResults({
      ventasEstimadas: Math.round(ventasEstimadas),
      ingresosEstimados: Math.round(ingresosEstimados),
      ganancia: Math.round(ganancia),
      margenGanancia: Math.round(margenGanancia),
      roas: parseFloat(roas.toFixed(2)),
      roi: parseFloat(roi.toFixed(2)),
    });
  };

  const inputFields = [
    { key: 'inversionMensual', label: 'Inversi\u00f3n Mensual ($)' },
    { key: 'costoPorCompra', label: 'Costo por Compra ($)' },
    { key: 'ticketPromedio', label: 'Ticket Promedio ($)' },
  ];

  const resultFields = [
    { key: 'ventasEstimadas', label: 'Ventas Estimadas' },
    { key: 'ingresosEstimados', label: 'Ingresos Estimados ($)' },
    { key: 'ganancia', label: 'Ganancia ($)' },
    { key: 'margenGanancia', label: 'Margen de Ganancia (%)' },
    { key: 'roas', label: 'ROAS' },
    { key: 'roi', label: 'ROI (%)' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-blue-900 mb-6">Calculadora de Ventas</h2>

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
        <h3 className="text-xl font-bold text-center tracking-wide">RESULTADOS VENTAS</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

export default CalculadoraVentas;
