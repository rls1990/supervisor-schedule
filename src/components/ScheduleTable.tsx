import React, { useState } from "react";
import type { DaySchedule } from "../types";

interface ScheduleTableProps {
  schedule: DaySchedule[];
}

const ScheduleTable: React.FC<ScheduleTableProps> = ({ schedule }) => {
  const [page, setPage] = useState(0);
  const itemsPerPage = 30;

  const totalPages = Math.ceil(schedule.length / itemsPerPage);
  const currentSchedule = schedule.slice(
    page * itemsPerPage,
    (page + 1) * itemsPerPage
  );

  // Función para obtener clase de color según estado
  const getStateColor = (state: string) => {
    switch (state) {
      case "S":
        return "bg-blue-500 text-white";
      case "I":
        return "bg-yellow-500 text-white";
      case "P":
        return "bg-green-500 text-white";
      case "B":
        return "bg-red-500 text-white";
      case "D":
        return "bg-gray-300 text-gray-800";
      case "-":
        return "bg-white text-gray-400 border";
      default:
        return "bg-white text-gray-800";
    }
  };

  // Función para obtener color del contador
  const getCountColor = (count: number) => {
    if (count === 2) return "bg-green-100 text-green-800 border-green-300";
    if (count === 3) return "bg-red-100 text-red-800 border-red-300";
    return "bg-yellow-100 text-yellow-800 border-yellow-300";
  };

  return (
    <div>
      {/* Controles de paginación */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-600">
          Mostrando días {page * itemsPerPage + 1} a{" "}
          {Math.min((page + 1) * itemsPerPage, schedule.length)} de{" "}
          {schedule.length}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition"
          >
            Anterior
          </button>
          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum = i;
              if (totalPages > 5) {
                if (page < 2) pageNum = i;
                else if (page > totalPages - 3) pageNum = totalPages - 5 + i;
                else pageNum = page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-8 h-8 rounded-lg ${
                    page === pageNum
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {pageNum + 1}
                </button>
              );
            })}
            {totalPages > 5 && <span className="px-2">...</span>}
          </div>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition"
          >
            Siguiente
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                Día
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                S1
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                S2
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                S3
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                # Perforando
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentSchedule.map((daySchedule) => (
              <tr
                key={daySchedule.day}
                className={`${
                  daySchedule.drillingCount !== 2
                    ? "bg-red-50"
                    : "hover:bg-gray-50"
                }`}
              >
                <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r">
                  {daySchedule.day}
                </td>
                <td className="px-4 py-3 border-r">
                  <div className="flex justify-center">
                    <span
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold ${getStateColor(
                        daySchedule.s1
                      )}`}
                    >
                      {daySchedule.s1}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 border-r">
                  <div className="flex justify-center">
                    <span
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold ${getStateColor(
                        daySchedule.s2
                      )}`}
                    >
                      {daySchedule.s2}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 border-r">
                  <div className="flex justify-center">
                    <span
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold ${getStateColor(
                        daySchedule.s3
                      )}`}
                    >
                      {daySchedule.s3}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-center">
                    <span
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold border ${getCountColor(
                        daySchedule.drillingCount
                      )}`}
                    >
                      {daySchedule.drillingCount}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Resumen */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="font-medium text-blue-800 mb-1">Regla 1</h3>
          <p className="text-sm text-blue-600">
            Siempre 2 perforando:{" "}
            {schedule.filter((d) => d.drillingCount === 2).length} días
          </p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <h3 className="font-medium text-red-800 mb-1">Regla 2</h3>
          <p className="text-sm text-red-600">
            Nunca 3 perforando:{" "}
            {schedule.filter((d) => d.drillingCount > 2).length} días con error
          </p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h3 className="font-medium text-yellow-800 mb-1">Regla 3</h3>
          <p className="text-sm text-yellow-600">
            Nunca 1 perforando:{" "}
            {schedule.filter((d) => d.drillingCount < 2 && d.s3 !== "-").length}{" "}
            días con error
          </p>
        </div>
      </div>
    </div>
  );
};

export default ScheduleTable;
