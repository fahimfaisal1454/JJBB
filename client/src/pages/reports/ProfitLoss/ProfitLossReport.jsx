import React, { useEffect, useState } from "react";
import AxiosInstance from "../../../components/AxiosInstance";

const ProfitLossReport = () => {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [report, setReport] = useState(null);

  useEffect(() => {
    fetchReport();
  }, [year]);

  const fetchReport = async () => {
    const res = await AxiosInstance.get(`profit-loss/?year=${year}`);
    setReport(res.data);
  };

  if (!report) return <p className="p-4 text-sm">Loading...</p>;

  return (
    <div className="p-6 space-y-4">
      {/* HEADER */}
      <div className="bg-white rounded-xl shadow border border-slate-200 p-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Profit & Loss Statement</h2>
          <p className="text-xs text-slate-500">
            Comparison for year {year} and {year - 1}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring focus:ring-blue-500/30"
          >
            {[currentYear, currentYear - 1, currentYear - 2].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <button
            onClick={() =>
              window.open(`/reports/profit-loss/pdf?year=${year}`, "_blank")
            }
            className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
          >
            View PDF
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
       <table className="w-full text-sm border-collapse">
        <thead className="bg-slate-100 border-b border-slate-300">
            {/* TOP HEADER */}
            <tr>
            <th
                rowSpan={2}
                className="text-left px-4 py-3 font-semibold border-r border-slate-300 w-[40%]"
            >
                Items
            </th>

            <th
                colSpan={2}
                className="text-center px-4 py-3 font-semibold border-r border-slate-300"
            >
                Amount
            </th>

            <th
                rowSpan={2}
                className="text-center px-4 py-3 font-semibold"
            >
                % Change Compared to Previous Year
            </th>
            </tr>

            {/* SUB HEADER */}
            <tr className="bg-slate-50 border-t border-slate-300">
            <th className="text-right px-4 py-2 text-xs font-semibold border-r border-slate-300">
                Previous Year
            </th>
            <th className="text-right px-4 py-2 text-xs font-semibold border-r border-slate-300">
                Current Year
            </th>
            </tr>
        </thead>

        <tbody>
            {/* INCOME */}
            <tr className="bg-gray-500">
            <td colSpan="4" className="px-4 py-2 font-semibold text-white">
                INCOME
            </td>
            </tr>

            {report.income.map((row, idx) => (
            <tr key={idx} className="border-t hover:bg-slate-50">
                <td className="px-4 py-2 border-r">{row.item}</td>
                <td className="px-4 py-2 text-right cursor-pointer text-blue-600 hover:underline border-r">
                {row.previous_year}
                </td>
                <td className="px-4 py-2 text-right cursor-pointer text-blue-600 hover:underline border-r">
                {row.current_year}
                </td>
                <td className="px-4 py-2 text-right">{row.percent_change}%</td>
            </tr>
            ))}

            <tr className="bg-blue-50 font-semibold border-t">
            <td className="px-4 py-2 border-r">Gross Profit</td>
            <td className="px-4 py-2 text-right border-r">{report.gross_profit.previous_year}</td>
            <td className="px-4 py-2 text-right border-r">{report.gross_profit.current_year}</td>
            <td className="px-4 py-2 text-right">{report.gross_profit.percent_change}%</td>
            </tr>

            {/* EXPENSES */}
            <tr className="bg-gray-500 border-t">
            <td colSpan="4" className="px-4 py-2 font-semibold text-white">
                EXPENSES
            </td>
            </tr>

            {report.expenses.map((row, idx) => (
            <tr key={idx} className="border-t hover:bg-slate-50">
                <td className="px-4 py-2 border-r">{row.item}</td>
                <td className="px-4 py-2 text-right cursor-pointer text-blue-600 hover:underline border-r">
                {row.previous_year}
                </td>
                <td className="px-4 py-2 text-right cursor-pointer text-blue-600 hover:underline border-r">
                {row.current_year}
                </td>
                <td className="px-4 py-2 text-right">{row.percent_change}%</td>
            </tr>
            ))}

            <tr className="bg-yellow-50 font-semibold border-t">
            <td className="px-4 py-2 border-r">Total Expenses</td>
            <td className="px-4 py-2 text-right border-r">{report.total_expenses.previous_year}</td>
            <td className="px-4 py-2 text-right border-r">{report.total_expenses.current_year}</td>
            <td className="px-4 py-2 text-right">{report.total_expenses.percent_change}%</td>
            </tr>

            <tr className="bg-green-50 font-bold border-t text-green-700">
            <td className="px-4 py-3 border-r">PROFIT / LOSS</td>
            <td className="px-4 py-3 text-right border-r">{report.net_profit.previous_year}</td>
            <td className="px-4 py-3 text-right border-r">{report.net_profit.current_year}</td>
            <td className="px-4 py-3 text-right">{report.net_profit.percent_change}%</td>
            </tr>
        </tbody>
        </table>
    </div>
    </div>
  );
};

export default ProfitLossReport;
