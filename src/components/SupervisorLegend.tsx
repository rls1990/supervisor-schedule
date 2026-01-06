import React from "react";

const SupervisorLegend: React.FC = () => {
  const legendItems = [
    { state: "S", label: "Subida", color: "bg-blue-500" },
    { state: "I", label: "Inducción", color: "bg-yellow-500" },
    { state: "P", label: "Perforación", color: "bg-green-500" },
    { state: "B", label: "Bajada", color: "bg-red-500" },
    { state: "D", label: "Descanso", color: "bg-gray-300" },
    { state: "-", label: "Vacío", color: "bg-white border border-gray-300" },
  ];

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <h3 className="font-medium text-gray-700 mb-3">Leyenda de Estados</h3>
      <div className="grid sm:grid-cols-3 lg:grid-cols-2 gap-3">
        {legendItems.map((item) => (
          <div key={item.state} className="flex items-center">
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center mr-2 ${
                item.color
              } ${item.state === "-" ? "border" : ""}`}
            >
              <span
                className={`text-xs font-bold ${
                  item.state === "-" ? "text-gray-400" : "text-white"
                }`}
              >
                {item.state}
              </span>
            </div>
            <span className="text-sm text-gray-600">{item.label}</span>
          </div>
        ))}
      </div>
      {/* <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-6 h-6 rounded-lg bg-green-100 border border-green-300 flex items-center justify-center mr-2">
              <span className="text-xs font-bold text-green-800">2</span>
            </div>
            <span className="text-sm text-gray-600">
              2 perforando (correcto)
            </span>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 rounded-lg bg-red-100 border border-red-300 flex items-center justify-center mr-2">
              <span className="text-xs font-bold text-red-800">1</span>
            </div>
            <span className="text-sm text-gray-600">1 perforando (error)</span>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 rounded-lg bg-red-100 border border-red-300 flex items-center justify-center mr-2">
              <span className="text-xs font-bold text-red-800">3</span>
            </div>
            <span className="text-sm text-gray-600">3 perforando (error)</span>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default SupervisorLegend;
