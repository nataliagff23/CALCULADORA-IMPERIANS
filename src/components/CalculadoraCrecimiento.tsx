import { useState } from 'react';

function CalculadoraCrecimiento() {
  const [inputs, setInputs] = useState({
    pais: 'Venezuela',
    inversionMensual: 1000,
    costoPorVisita: 0.03,
    tasaSeguidor: 30,
    cpm: 5,
  });

  const [results, setResults] = useState({
    visitasAlPerfil: 0,
    seguidoresGanados: 0,
    alcance: 0,
    costoPorSeguidor: 0,
  });

  const handleInputChange = (field: string, value: string) => {
    if (field === 'pais') {
      setInputs({ ...inputs, [field]: value });
    } else {
      setInputs({ ...inputs, [field]: parseFloat(value) || 0 });
    }
  };

  const calcular = () => {
    const visitasAlPerfil = inputs.inversionMensual / inputs.costoPorVisita;
    const seguidoresGanados = (visitasAlPerfil * inputs.tasaSeguidor) / 100;
    const alcance = (inputs.inversionMensual / inputs.cpm) * 1000;
    const costoPorSeguidor = inputs.inversionMensual / seguidoresGanados;

    setResults({
      visitasAlPerfil: Math.round(visitasAlPerfil),
      seguidoresGanados: Math.round(seguidoresGanados),
      alcance: Math.round(alcance),
      costoPorSeguidor: parseFloat(costoPorSeguidor.toFixed(2)),
    });
  };

  const paises = [
    'Venezuela', 'Colombia', 'M\u00e9xico', 'Argentina', 'Chile',
    'Per\u00fa', 'Ecuador', 'Bolivia', 'Paraguay', 'Uruguay',
    'Espa\u00f1a', 'Estados Unidos',
  ];

  const numericInputFields = [
    { key: 'inversionMensual', label: 'Inversi\u00f3n mensual ($)', step: '100' },
    { key: 'costoPorVisita', label: 'Costo por Visita al Perfil ($)', step: '0.01' },
    { key: 'tasaSeguidor', label: 'Tasa de Seguimiento (%)', step: '1' },
    { key: 'cpm', label: 'CPM ($)', step: '0.5' },
  ];

  const resultFields = [
    { key: 'visitasAlPerfil', label: 'Visitas al Perfil' },
    { key: 'seguidoresGanados', label: 'Seguidores Ganados' },
    { key: 'alcance', label: 'Alcance' },
    { key: 'costoPorSeguidor', label: 'Costo por Seguidor ($)' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-blue-900 mb-6">Calculadora de Crecimiento</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="space-y-2">
          <label className="block bg-blue-200 text-gray-800 font-semibold py-3 px-4 rounded-lg text-center border-2 border-blue-300">
            Pa\u00eds
          </label>
          <select
            value={inputs.pais}
            onChange={(e) => handleInputChange('pais', e.target.value)}
            className="w-full border-2 border-gray-300 py-3 px-4 rounded-lg text-center text-xl font-semibold focus:border-blue-500 focus:outline-none transition-colors"
          >
            {paises.map((pais) => (
              <option key={pais} value={pais}>{pais}</option>
            ))}
          </select>
        </div>

        {numericInputFields.map((field) => (
          <div key={field.key} className="space-y-2">
            <label className="block bg-blue-200 text-gray-800 font-semibold py-3 px-4 rounded-lg text-center border-2 border-blue-300">
              {field.label}
            </label>
            <input
              type="number"
              step={field.step}
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
        <h3 className="text-xl font-bold text-center tracking-wide">RESULTADOS CRECIMIENTO</h3>
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

export default CalculadoraCrecimiento;
