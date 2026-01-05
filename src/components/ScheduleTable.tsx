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

  const isOnFirstPage = page === 0;

  // === Inferir inductionDays desde S1 (solo del inicio) ===
  let inductionDays = 0;
  if (schedule.length > 1) {
    for (let i = 1; i < schedule.length; i++) {
      if (schedule[i].s1 === "I") {
        inductionDays = i;
      } else {
        break;
      }
    }
  }

  // === Etiquetas y estilos ===
  const getColumnLabel = (day: number): string => {
    if (day === 0) return "S";
    if (day <= inductionDays) return `I${day}`;
    return `D${day - inductionDays}`;
  };

  const getColumnSubLabel = (day: number): string => {
    if (day === 0) return "Subido";
    if (day <= inductionDays) return "Ind";
    return `${day - inductionDays}`;
  };

  const getColumnHeaderClass = (day: number): string => {
    if (day === 0) return "bg-orange-200 text-orange-800";
    if (day <= inductionDays) return "bg-green-700 text-white";
    return "bg-blue-700 text-white";
  };

  const getCellClass = (day: number): string => {
    if (day === 0) return "bg-orange-100";
    if (day <= inductionDays) return "bg-green-100";
    return "bg-blue-100";
  };

  // === Colores de estado (sin cambios) ===
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

  // const getCountColor = (count: number) => {
  //   if (count === 2) return "bg-green-100 text-green-800 border-green-300";
  //   if (count === 3) return "bg-red-100 text-red-800 border-red-300";
  //   return "bg-yellow-100 text-yellow-800 border-yellow-300";
  // };

  return (
    <div>
      {/* Controles de paginación */}
      <div className="flex justify-between items-center mb-4 sm:flex-row flex-col">
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

      {/* Tabla transpuesta */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full">
          <thead>
            {/* Fila superior: S, I1, I2, D1, D2... (para todos los días) */}
            <tr className="bg-gray-100">
              <th className="px-3 py-2 border-r text-center font-medium text-gray-700 w-28"></th>
              {currentSchedule.map((s) => (
                <th
                  key={`top-${s.day}`}
                  className={`px-3 py-2 border-r text-center font-bold ${getColumnHeaderClass(
                    s.day
                  )}`}
                >
                  {getColumnLabel(s.day)}
                </th>
              ))}
            </tr>

            {/* Fila inferior: solo en primera página */}
            {/* {isOnFirstPage && (
              
            )} */}
            <tr className="bg-gray-50">
              <th className="px-3 py-1.5 border-r text-center text-sm font-medium text-gray-600 w-28"></th>
              {currentSchedule.map((s) => (
                <th
                  key={`bottom-${s.day}`}
                  className={`px-3 py-1.5 border-r text-center text-xs font-medium ${
                    s.day === 0
                      ? "bg-orange-200 text-orange-800"
                      : s.day <= inductionDays
                      ? "bg-green-700 text-white"
                      : "bg-blue-700 text-white"
                  }`}
                >
                  {getColumnSubLabel(s.day)}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {/* S1 */}
            <tr>
              <td className="px-3 py-2 font-medium text-center bg-gray-100 border-r">
                S1
              </td>
              {currentSchedule.map((s) => (
                <td
                  key={`s1-${s.day}`}
                  className={`px-2 py-2 text-center ${getCellClass(s.day)}`}
                >
                  <span
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold ${getStateColor(
                      s.s1
                    )}`}
                  >
                    {s.s1}
                  </span>
                </td>
              ))}
            </tr>

            {/* S2 */}
            <tr className="hover:bg-gray-50">
              <td className="px-3 py-2 font-medium text-center bg-gray-100 border-r">
                S2
              </td>
              {currentSchedule.map((s) => (
                <td
                  key={`s2-${s.day}`}
                  className={`px-2 py-2 text-center ${getCellClass(s.day)}`}
                >
                  <span
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold ${getStateColor(
                      s.s2
                    )}`}
                  >
                    {s.s2}
                  </span>
                </td>
              ))}
            </tr>

            {/* S3 */}
            <tr className="hover:bg-gray-50">
              <td className="px-3 py-2 font-medium text-center bg-gray-100 border-r">
                S3
              </td>
              {currentSchedule.map((s) => (
                <td
                  key={`s3-${s.day}`}
                  className={`px-2 py-2 text-center ${getCellClass(s.day)}`}
                >
                  <span
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold ${getStateColor(
                      s.s3
                    )}`}
                  >
                    {s.s3}
                  </span>
                </td>
              ))}
            </tr>

            {/* # Perforando */}
            {/* <tr className="hover:bg-gray-50">
              <td className="px-3 py-2 font-medium text-center bg-gray-100 border-r">
                # Perforando
              </td>
              {currentSchedule.map((s) => (
                <td
                  key={`count-${s.day}`}
                  className={`px-2 py-2 text-center ${getCellClass(s.day)}`}
                >
                  <span
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold border ${getCountColor(
                      s.drillingCount
                    )}`}
                  >
                    {s.drillingCount}
                  </span>
                </td>
              ))}
            </tr> */}
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
