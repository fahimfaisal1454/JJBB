// client/src/pages/expenses/PurchaseExpense.jsx

import React, { useEffect, useState, useMemo } from "react";
import AxiosInstance from "../../components/AxiosInstance";

const safeNumber = (value) => {
  const num = parseFloat(value || 0);
  return Number.isNaN(num) ? 0 : num;
};

export default function PurchaseExpense() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  // -------- load data --------
  const loadPurchases = async (searchValue = "") => {
    try {
      setLoading(true);
      setError("");

      const res = await AxiosInstance.get("/purchases/", {
        params: searchValue ? { search: searchValue } : {},
      });
      const raw = res.data;
      const list = Array.isArray(raw) ? raw : raw?.results || [];
      setPurchases(list);
    } catch (e) {
      console.error("Failed to load purchases for expense view", e);
      setError("Failed to load purchase expenses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPurchases();
  }, []);

  // -------- derived values --------
  const filtered = useMemo(() => {
    if (!search.trim()) return purchases;
    const s = search.toLowerCase();
    return purchases.filter((p) => {
      const vendorName =
        p.vendor?.vendor_name ||
        p.vendor?.shop_name ||
        "";
      return (
        vendorName.toLowerCase().includes(s) ||
        (p.invoice_no || "").toLowerCase().includes(s)
      );
    });
  }, [purchases, search]);

  const totalPurchaseExpense = useMemo(
    () =>
      filtered.reduce(
        (sum, p) => sum + safeNumber(p.total_payable_amount),
        0
      ),
    [filtered]
  );

  const formatCurrency = (value) =>
    `৳ ${safeNumber(value).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  // -------- UI --------
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">
            Purchase Expense
          </h2>
          <p className="text-xs text-slate-500">
            All purchase invoices treated as company expenses.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search by vendor or invoice no..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm w-60 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
          <button
            type="button"
            onClick={() => loadPurchases(search)}
            className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap gap-6 text-sm">
        <div>
          <div className="text-xs text-slate-500 uppercase">
            Total Purchase Expense
          </div>
          <div className="mt-1 text-lg font-semibold">
            {formatCurrency(totalPurchaseExpense)}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500 uppercase">
            Total Purchase Invoices
          </div>
          <div className="mt-1 text-lg font-semibold">
            {filtered.length}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-800">
            Purchase Expense Details
          </h3>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b bg-slate-50">
              <tr className="text-left text-slate-500">
                <th className="py-2 px-2">Date</th>
                <th className="py-2 px-2">Invoice No</th>
                <th className="py-2 px-2">Vendor</th>
                <th className="py-2 px-2 text-right">Total Payable</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="py-2 px-2">
                    {p.purchase_date || "--"}
                  </td>
                  <td className="py-2 px-2">
                    {p.invoice_no || `PU-${p.id}`}
                  </td>
                  <td className="py-2 px-2">
                    {p.vendor?.vendor_name ||
                      p.vendor?.shop_name ||
                      "N/A"}
                  </td>
                  <td className="py-2 px-2 text-right">
                    {formatCurrency(p.total_payable_amount)}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="py-4 px-2 text-center text-slate-400"
                  >
                    No purchase expenses found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
