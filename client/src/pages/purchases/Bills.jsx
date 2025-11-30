// client/src/pages/purchases/Bills.jsx

import React, { useEffect, useMemo, useState } from "react";
import { FaSearch } from "react-icons/fa";
import AxiosInstance from "../../components/AxiosInstance";

export default function Bills() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const safeNumber = (value) => {
    const num = parseFloat(value || 0);
    return Number.isNaN(num) ? 0 : num;
  };

  const computeStatus = (totalPayable, totalPaid) => {
    if (totalPayable <= 0 && totalPaid <= 0) return "N/A";
    if (totalPaid <= 0 && totalPayable > 0) return "Unpaid";
    const due = Math.max(0, totalPayable - totalPaid);
    if (due <= 0) return "Paid";
    if (totalPaid > 0 && due > 0) return "Partially Paid";
    return "N/A";
  };

  const statusColor = (status) => {
    if (status === "Paid") return "bg-emerald-100 text-emerald-700";
    if (status === "Unpaid") return "bg-red-100 text-red-700";
    if (status === "Partially Paid")
      return "bg-amber-100 text-amber-700";
    return "bg-slate-100 text-slate-700";
  };

  const loadBills = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await AxiosInstance.get("/purchases/");
      const raw = res.data;
      const purchases = Array.isArray(raw) ? raw : raw.results || [];

      const mapped = purchases.map((p) => {
        const totalPayable = safeNumber(p.total_payable_amount);
        const totalAmount = safeNumber(p.total_amount);
        const payments = p.payments || [];

        const totalPaid = payments.reduce(
          (sum, pay) => sum + safeNumber(pay.paid_amount),
          0
        );

        const due = Math.max(0, totalPayable - totalPaid);
        const status = computeStatus(totalPayable, totalPaid);

        return {
          id: p.id,
          billDate: p.purchase_date || null,
          billNo: p.invoice_no || `PUR-${p.id}`,
          vendor:
            p.vendor?.vendor_name ||
            p.vendor?.shop_name ||
            "N/A",
          totalAmount,
          totalPayable,
          totalPaid,
          due,
          status,
        };
      });

      // latest bills first (by date)
      mapped.sort((a, b) => {
        const da = new Date(a.billDate || "1970-01-01");
        const db = new Date(b.billDate || "1970-01-01");
        return db - da;
      });

      setBills(mapped);
    } catch (err) {
      console.error(err);
      const detail =
        err.response?.data?.detail ||
        err.message ||
        "Failed to load bills";
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBills();
  }, []);

  const filteredBills = useMemo(() => {
    return bills.filter((b) => {
      const term = search.trim().toLowerCase();

      if (term) {
        const matchesSearch =
          (b.billNo || "").toLowerCase().includes(term) ||
          (b.vendor || "").toLowerCase().includes(term);
        if (!matchesSearch) return false;
      }

      if (statusFilter === "all") return true;
      return b.status === statusFilter;
    });
  }, [bills, search, statusFilter]);

  const totals = useMemo(() => {
    const totalPayable = filteredBills.reduce(
      (sum, b) => sum + b.totalPayable,
      0
    );
    const totalDue = filteredBills.reduce(
      (sum, b) => sum + b.due,
      0
    );
    return { totalPayable, totalDue };
  }, [filteredBills]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Bills</h1>
          <p className="text-sm text-slate-500">
            Track vendor bills and manage your payables.
          </p>
        </div>
        {/* You can later wire this to navigate to the purchase entry page */}
        {/* <button className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700">
          New Purchase
        </button> */}
      </div>

      {/* Filters + Summary */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex gap-2">
          <div className="relative">
            <FaSearch className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search bill # / vendor"
              className="text-sm border border-slate-200 rounded-full pl-9 pr-3 py-1.5 w-64 focus:outline-none focus:ring focus:ring-blue-500/30"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring focus:ring-blue-500/30"
          >
            <option value="all">Status: All</option>
            <option value="Paid">Paid</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Partially Paid">Partially Paid</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-3 text-xs md:text-sm">
          <div className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200">
            Bills:{" "}
            <span className="font-semibold">
              {filteredBills.length}
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200">
            Total Payable:{" "}
            <span className="font-semibold">
              ৳ {totals.totalPayable.toFixed(2)}
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200">
            Total Due:{" "}
            <span className="font-semibold text-red-600">
              ৳ {totals.totalDue.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs md:text-sm px-3 py-2 rounded-xl">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 overflow-x-auto">
        {loading ? (
          <p className="text-xs md:text-sm text-slate-500">
            Loading bills...
          </p>
        ) : filteredBills.length === 0 ? (
          <p className="text-xs md:text-sm text-slate-500">
            No bills found.
          </p>
        ) : (
          <table className="min-w-full text-xs md:text-sm">
            <thead className="border-b bg-slate-50">
              <tr className="text-left text-slate-500">
                <th className="py-2 px-2 text-center">Date</th>
                <th className="py-2 px-2">Bill No</th>
                <th className="py-2 px-2">Vendor</th>
                <th className="py-2 px-2 text-right">
                  Bill Amount
                </th>
                <th className="py-2 px-2 text-right">Paid</th>
                <th className="py-2 px-2 text-right">Due</th>
                <th className="py-2 px-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredBills.map((row) => (
                <tr key={row.id} className="border-b last:border-0">
                  <td className="py-2 px-2 text-center">
                    {row.billDate || "-"}
                  </td>
                  <td className="py-2 px-2 font-mono text-[11px]">
                    {row.billNo}
                  </td>
                  <td className="py-2 px-2">
                    <div className="font-medium text-slate-800 text-xs md:text-sm">
                      {row.vendor}
                    </div>
                  </td>
                  <td className="py-2 px-2 text-right">
                    {row.totalPayable.toFixed(2)}
                  </td>
                  <td className="py-2 px-2 text-right">
                    {row.totalPaid.toFixed(2)}
                  </td>
                  <td className="py-2 px-2 text-right">
                    {row.due.toFixed(2)}
                  </td>
                  <td className="py-2 px-2 text-center">
                    <span
                      className={`px-2 py-1 text-[11px] rounded-full inline-flex items-center justify-center ${statusColor(
                        row.status
                      )}`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
