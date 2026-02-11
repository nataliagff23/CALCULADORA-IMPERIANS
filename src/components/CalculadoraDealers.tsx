import { useState } from 'react';

function CalculadoraDealers() {
  const [inputs, setInputs] = useState({
    inversionMensual: 1000,
    costoPorLead: 5,
    citasAgendadas: 20,
    shows: 15,
    cierres: 3,
    ticketPromedio: 1900,
  });

  const [errors, setErrors] = useState<string[]>([]);

  const [results, setResults] = useState({
    leadsGenerados: 0,
    tasaShow: 0,
    tasaNoShow: 0,
    tasaCierre: 0,
    tasaConversion: 0,
    leadACita: 0,
    citaAVenta: 0,
    ingresosEstimados: 0,
  });

  const handleInputChange = (field: string, value: string) => {
    setInputs({ ...inputs, [field]: parseFloat(value) || 0 });
  };

  const validar = (): string[] => {
    const errs: string[] = [];
    if (inputs.costoPorLead <= 0) errs.push('El Costo por Lead debe ser mayor a 0.');
    if (inputs.shows > inputs.citasAgendadas) errs.push('Shows no puede ser mayor que Citas Agendadas.');
    if (inputs.cierres > inputs.shows) errs.push('Cierres no puede ser mayor que Shows.');
    return errs;
  };

  const calcular = () => {
    const errs = validar();
    setErrors(errs);
    if (errs.length > 0) return;

    const leadsGenerados = inputs.inversionMensual / inputs.costoPorLead;
    const tasaShow = (inputs.shows / inputs.citasAgendadas) * 100;
    const tasaNoShow = 100 - tasaShow;
    const tasaCierre = (inputs.cierres / inputs.shows) * 100;
    const tasaConversion = (inputs.cierres / leadsGenerados) * 100;
    const leadACita = (inputs.citasAgendadas / leadsGenerados) * 100;
    const citaAVenta = (inputs.cierres / inputs.citasAgendadas) * 100;
    const ingresosEstimados = inputs.cierres * inputs.ticketPromedio;

    setResults({
      leadsGenerados: Math.round(leadsGenerados),
      tasaShow: parseFloat(tasaShow.toFixed(1)),
      tasaNoShow: parseFloat(tasaNoShow.toFixed(1)),
      tasaCierre: parseFloat(tasaCierre.toFixed(1)),
      tasaConversion: parseFloat(tasaConversion.toFixed(2)),
      leadACita: parseFloat(leadACita.toFixed(1)),
      citaAVenta: parseFloat(citaAVenta.toFixed(1)),
      ingresosEstimados: Math.round(ingresosEstimados),
    });
  };

  const inputFields = [
    { key: 'inversionMensual', label: 'Inversi\u00f3n mensual ($)' },
    { key: 'costoPorLead', label: 'Costo por Lead ($)' },
    { key: 'citasAgendadas', label: 'Citas Agendadas (#)' },
    { key: 'shows', label: 'Shows (#)' },
    { key: 'cierres', label: 'Cierres (#)' },
    { key: 'ticketPromedio', label: 'Ticket Promedio ($)' },
  ];

  const resultFields = [
    { key: 'leadsGenerados', label: 'Leads Generados', suffix: '' },
    { key: 'tasaShow', label: 'Tasa de Show', suffix: '%' },
    { key: 'tasaNoShow', label: 'Tasa de No-Show', suffix: '%' },
    { key: 'tasaCierre', label: 'Tasa de Cierre (Show \u2192 Venta)', suffix: '%' },
    { key: 'tasaConversion', label: 'Tasa de Conversi\u00f3n (Lead \u2192 Venta)', suffix: '%' },
    { key: 'leadACita', label: 'Lead \u2192 Cita', suffix: '%' },
    { key: 'citaAVenta', label: 'Cita \u2192 Venta', suffix: '%' },
    { key: 'ingresosEstimados', label: 'Ingresos Estimados ($)', suffix: '' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-blue-900 mb-6">Calculadora de Rentabilidad</h2>

      {errors.length > 0 && (
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 mb-6">
          {errors.map((err, i) => (
            <p key={i} className="text-red-700 font-semibold">{err}</p>
          ))}
        </div>
      )}

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
              {results[field.key as keyof typeof results].toLocaleString()}{field.suffix}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CalculadoraDealers;
