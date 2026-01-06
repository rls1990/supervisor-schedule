import { useState } from "react";
import InputForm from "./components/InputForm";
import ScheduleTable from "./components/ScheduleTable";
import ValidationErrors from "./components/ValidationErrors";
import SupervisorLegend from "./components/SupervisorLegend";
import {
  calculateSchedule,
  generateTestSchedule,
} from "./utils/scheduleCalculator";
import type { ScheduleConfig, ScheduleResult } from "./types";

function App() {
  const [config, setConfig] = useState<ScheduleConfig>({
    workDays: 14,
    restDays: 7,
    inductionDays: 5,
    totalDrillingDays: 30,
  });

  const [scheduleResult, setScheduleResult] = useState<ScheduleResult | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<"config" | "schedule">("config");

  const handleCalculate = () => {
    const result = calculateSchedule(config);
    setScheduleResult(result);
    setActiveTab("schedule");
  };

  const handleTestCase = (caseNumber: number) => {
    const testConfig = generateTestSchedule(caseNumber);
    setConfig(testConfig);
    const result = calculateSchedule(testConfig);
    setScheduleResult(result);
    setActiveTab("schedule");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 ">
          Cronograma de Supervisores Mineros
        </h1>
        <p className="text-gray-600">
          Sistema de planificación de turnos para 3 supervisores de perforación
        </p>
      </header>

      <div className="max-w-7xl mx-auto">
        {/* Pestañas */}
        <div className="flex border-b border-gray-300 mb-6">
          <button
            className={`px-6 py-3 font-medium ${
              activeTab === "config"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("config")}
          >
            Configuración
          </button>
          <button
            className={`px-6 py-3 font-medium ${
              activeTab === "schedule"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("schedule")}
            disabled={!scheduleResult}
          >
            Cronograma
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Panel de configuración */}
          <div
            className={`lg:col-span-1 ${
              activeTab !== "config" ? "hidden lg:block" : ""
            }`}
          >
            <div className="bg-white rounded-xl shadow-lg p-6">
              <InputForm
                config={config}
                onConfigChange={setConfig}
                onCalculate={handleCalculate}
                onTestCase={handleTestCase}
              />

              <div className="mt-8">
                <SupervisorLegend />
              </div>

              {scheduleResult && (
                <div className="mt-6">
                  <ValidationErrors
                    errors={scheduleResult.errors}
                    warnings={scheduleResult.warnings}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Panel de cronograma */}
          <div
            className={`lg:col-span-2 ${
              activeTab !== "schedule" ? "hidden lg:block" : ""
            }`}
          >
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
              {scheduleResult ? (
                <>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      Cronograma Generado
                    </h2>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                        <span>
                          Días con 2 perforando:{" "}
                          {
                            scheduleResult.schedule.filter(
                              (d) => d.drillingCount === 2
                            ).length
                          }
                        </span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                        <span>
                          Días con errores: {scheduleResult.errors.length}
                        </span>
                      </div>
                    </div>
                  </div>

                  <ScheduleTable schedule={scheduleResult.schedule} />
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg
                      className="w-16 h-16 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium text-gray-700 mb-2">
                    No hay cronograma generado
                  </h3>
                  <p className="text-gray-500">
                    Configura los parámetros y haz clic en "Calcular Cronograma"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-12 text-center text-gray-500 text-sm">
        <p>Prueba Técnica - Algoritmo de Cronograma de Supervisores</p>
      </footer>
    </div>
  );
}

export default App;
