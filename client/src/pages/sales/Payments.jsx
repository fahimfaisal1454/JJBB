// client/src/pages/sales/Payments.jsx

import React, { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import AxiosInstance from "../../components/AxiosInstance";

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // ---------- Helpers ----------

  const safeNumber = (value) => {
    const num = parseFloat(value || 0);
    return Number.isNaN(num) ? 0 : num;
  };

  // Load all sales and flatten nested payments into a single table
  const loadSalesWithPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await AxiosInstance.get("sales/");
      const raw = res.data;
      const sales = Array.isArray(raw) ? raw : raw.results || [];

      const flatPayments = [];

      sales.forEach((sale) => {
        const totalPayable = safeNumber(sale.total_payable_amount);
        const salePayments = sale.payments || [];

        // sort payments by payment_date (fallback to sale_date)
        const sorted = [...salePayments].sort((a, b) => {
          const da = new Date(a.payment_date || sale.sale_date || "1970-01-01");
          const db = new Date(b.payment_date || sale.sale_date || "1970-01-01");
          return da - db;
        });

        let cumulativePaid = 0;

        sorted.forEach((p) => {
          const paid = safeNumber(p.paid_amount);
          cumulativePaid += paid;
          const dueAfter = Math.max(0, totalPayable - cumulativePaid);

          flatPayments.push({
            id: p.id,
            invoice_no: sale.invoice_no,
            customer_name: sale.customer?.customer_name || "",
            sale_date: sale.sale_date,
            payment_mode: p.payment_mode || "",
            bank_name: p.bank_name?.bank_name || "",
            account_no: p.account_no || "",
            cheque_no: p.cheque_no || "",
            paid_amount: paid,
            payment_date: p.payment_date,
            due_after_payment: dueAfter,
          });
        });
      });

      // newest first (by payment_date)
      flatPayments.sort((a, b) => {
        const da = new Date(a.payment_date || a.sale_date || "1970-01-01");
        const db = new Date(b.payment_date || b.sale_date || "1970-01-01");
        return db - da;
      });

      setPayments(flatPayments);
    } catch (err) {
      console.error(err);
      const detail =
        err.response?.data?.detail ||
        err.message ||
        "Failed to load payments";
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSalesWithPayments();
  }, []);

  // ---------- Filtering ----------

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const filteredPayments = payments.filter((p) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      (p.invoice_no || "").toLowerCase().includes(term) ||
      (p.customer_name || "").toLowerCase().includes(term)
    );
  });

  const totalReceived = filteredPayments.reduce(
    (sum, p) => sum + safeNumber(p.paid_amount),
    0
  );

  // ---------- UI ----------

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Sales Payments</h1>
          <p className="text-sm text-slate-500">
            All payments received against sales invoices.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <FaSearch className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by invoice or customer..."
            className="w-full pl-9 pr-3 py-1.5 rounded-full border border-slate-200 text-xs md:text-sm focus:outline-none focus:ring focus:ring-blue-500/30"
          />
        </div>

        <div className="text-xs sm:text-sm text-slate-600">
          Records:{" "}
          <span className="font-semibold">{filteredPayments.length}</span>{" "}
          &middot; Total received:{" "}
          <span className="font-semibold">
            ৳ {totalReceived.toFixed(2)}
          </span>
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
            Loading payments...
          </p>
        ) : filteredPayments.length === 0 ? (
          <p className="text-xs md:text-sm text-slate-500">
            No payments found.
          </p>
        ) : (
          <table className="min-w-full text-xs md:text-sm">
            <thead className="border-b bg-slate-50">
              <tr className="text-left text-slate-500">
                <th className="px-2 py-2 text-center">Invoice</th>
                <th className="px-2 py-2">Customer</th>
                <th className="px-2 py-2 text-center">Sale Date</th>
                <th className="px-2 py-2 text-center">Pay Mode</th>
                <th className="px-2 py-2 text-center">Bank</th>
                <th className="px-2 py-2 text-center">Account No</th>
                <th className="px-2 py-2 text-center">Cheque No</th>
                <th className="px-2 py-2 text-right">Paid Amount</th>
                <th className="px-2 py-2 text-center">Payment Date</th>
                <th className="px-2 py-2 text-right">Due After Payment</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="px-2 py-1.5 text-center font-mono text-[11px]">
                    {p.invoice_no || "N/A"}
                  </td>
                  <td className="px-2 py-1.5">
                    <div className="font-medium text-slate-800 text-xs md:text-sm">
                      {p.customer_name || "N/A"}
                    </div>
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    {p.sale_date || "N/A"}
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    {p.payment_mode || "N/A"}
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    {p.bank_name || "-"}
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    {p.account_no || "-"}
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    {p.cheque_no || "-"}
                  </td>
                  <td className="px-2 py-1.5 text-right">
                    {p.paid_amount.toFixed(2)}
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    {p.payment_date ? p.payment_date.slice(0, 10) : "N/A"}
                  </td>
                  <td className="px-2 py-1.5 text-right">
                    {p.due_after_payment.toFixed(2)}
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
