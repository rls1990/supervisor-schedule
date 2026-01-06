import React from "react";
import type { ScheduleConfig } from "../types";

interface InputFormProps {
  config: ScheduleConfig;
  onConfigChange: (config: ScheduleConfig) => void;
  onCalculate: () => void;
  onTestCase: (caseNumber: number) => void;
}

const InputForm: React.FC<InputFormProps> = ({
  config,
  onConfigChange,
  onCalculate,
  onTestCase,
}) => {
  const handleInputChange = (field: keyof ScheduleConfig, value: number) => {
    onConfigChange({ ...config, [field]: value });
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">
        Configuración del Cronograma
      </h2>

      <div className="space-y-6">
        {/* Régimen de trabajo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Régimen de Trabajo (N×M)
          </label>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Días de trabajo (N)
              </label>
              <input
                type="number"
                min="7"
                max="30"
                value={config.workDays}
                onChange={(e) =>
                  handleInputChange("workDays", parseInt(e.target.value) || 14)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
              <p className="text-xs text-gray-500 mt-1">Ej: 14, 21, 10, 7</p>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Días de descanso total (M)
              </label>
              <input
                type="number"
                min="5"
                max="14"
                value={config.restDays}
                onChange={(e) =>
                  handleInputChange("restDays", parseInt(e.target.value) || 7)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
              <p className="text-xs text-gray-500 mt-1">Ej: 7, 5, 6</p>
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            <p>Días de descanso real: {config.restDays - 2} (M - 2)</p>
          </div>
        </div>

        {/* Días de inducción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Días de Inducción
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => handleInputChange("inductionDays", days)}
                className={`flex-1 py-2 text-center rounded-lg border transition ${
                  config.inductionDays === days
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                }`}
              >
                {days} día{days > 1 ? "s" : ""}
              </button>
            ))}
          </div>
        </div>

        {/* Días totales de perforación */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Días Totales de Perforación
          </label>
          <div className="flex space-x-2">
            {[30, 45, 90].map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => handleInputChange("totalDrillingDays", days)}
                className={`flex-1 py-2 text-center rounded-lg border transition ${
                  config.totalDrillingDays === days
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                }`}
              >
                {days} días
              </button>
            ))}
          </div>
          <div className="mt-2">
            <input
              type="number"
              min="30"
              max="365"
              value={config.totalDrillingDays}
              onChange={(e) =>
                handleInputChange(
                  "totalDrillingDays",
                  parseInt(e.target.value) || 30
                )
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>
        </div>

        {/* Casos de prueba */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Casos de Prueba Obligatorios
          </label>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { id: 1, label: "14×7, 5 días inducción, 90 días" },
              { id: 2, label: "21×7, 3 días inducción, 90 días" },
              { id: 3, label: "10×5, 2 días inducción, 90 días" },
              { id: 4, label: "14×6, 4 días inducción, 950 días" },
            ].map((testCase) => (
              <button
                key={testCase.id}
                type="button"
                onClick={() => onTestCase(testCase.id)}
                className="px-4 py-3 bg-linear-to-r from-gray-50 to-gray-100 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:from-gray-100 hover:to-gray-200 transition-all hover:shadow"
              >
                {testCase.label}
              </button>
            ))}
          </div>
        </div>

        {/* Botón calcular */}
        <div className="pt-4">
          <button
            onClick={onCalculate}
            className="w-full py-3 bg-linear-to-r from-blue-500 to-blue-600 text-white font-bold rounded-lg shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            Calcular Cronograma
          </button>
          <p className="text-xs text-gray-500 text-center mt-2">
            El algoritmo generará automáticamente el cronograma cumpliendo todas
            las reglas
          </p>
        </div>
      </div>
    </div>
  );
};

export default InputForm;
