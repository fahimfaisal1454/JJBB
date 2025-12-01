import React, { useEffect, useMemo, useState } from "react";
import AxiosInstance from "../../components/AxiosInstance";
import toast from "react-hot-toast";

export default function PurchasePayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const safeNumber = (value) => {
    const num = parseFloat(value || 0);
    return Number.isNaN(num) ? 0 : num;
  };

  // Format ISO string -> "YYYY-MM-DD"
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return dateString;

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const fetchPurchasePayments = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await AxiosInstance.get("/purchases/");
      const raw = res.data;
      const purchases = Array.isArray(raw) ? raw : raw.results || [];

      const allPayments = [];

      purchases.forEach((p) => {
        const totalPayable = safeNumber(p.total_payable_amount);
        const vendorName =
          p.vendor?.vendor_name || p.vendor?.shop_name || "N/A";

        const payments = Array.isArray(p.payments) ? p.payments : [];

        // sort payments by date (oldest first) to compute running due
        const sortedPays = [...payments].sort((a, b) => {
          const da = new Date(a.payment_date || a.created_at || "1970-01-01");
          const db = new Date(b.payment_date || b.created_at || "1970-01-01");
          if (da.getTime() === db.getTime()) {
            return (a.id || 0) - (b.id || 0);
          }
          return da - db;
        });

        let runningPaid = 0;

        sortedPays.forEach((pay) => {
          const paid = safeNumber(pay.paid_amount);
          runningPaid += paid;
          const dueAfter = Math.max(0, totalPayable - runningPaid);

          const rawPaymentDate = pay.payment_date || pay.created_at || "";

          allPayments.push({
            id: pay.id,
            invoiceNo: p.invoice_no || `PUR-${p.id}`,
            vendorName,
            purchaseDate: p.purchase_date || "",
            payMode: pay.payment_mode || "N/A",
            bank:
              typeof pay.bank_name === "object"
                ? pay.bank_name?.bank_name || "-"
                : pay.bank_name || "-",
            accountNo: pay.account_no || "-",
            chequeNo: pay.cheque_no || "-",
            paidAmount: paid,
            paymentDate: rawPaymentDate, // keep raw, format in UI
            dueAfterPayment: dueAfter,
          });
        });
      });

      // sort latest payment first
      allPayments.sort((a, b) => {
        const da = new Date(a.paymentDate || "1970-01-01");
        const db = new Date(b.paymentDate || "1970-01-01");
        return db - da;
      });

      setPayments(allPayments);
    } catch (err) {
      console.error(err);
      const detail =
        err.response?.data?.detail ||
        err.message ||
        "Failed to load purchase payments";
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchasePayments();
  }, []);

  const filteredPayments = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return payments;

    return payments.filter((p) => {
      return (
        p.invoiceNo.toLowerCase().includes(term) ||
        p.vendorName.toLowerCase().includes(term)
      );
    });
  }, [payments, search]);

  const totals = useMemo(() => {
    const totalReceived = filteredPayments.reduce(
      (sum, p) => sum + safeNumber(p.paidAmount),
      0
    );
    return { totalReceived };
  }, [filteredPayments]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Purchase Payments</h1>
          <p className="text-sm text-slate-500">
            All payments made against purchase invoices.
          </p>
        </div>
      </div>

      {/* Search + Summary */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by invoice or vendor..."
            className="text-sm border border-slate-200 rounded-full px-3 py-1.5 w-72 focus:outline-none focus:ring focus:ring-blue-500/30"
          />
        </div>

        <div className="flex flex-wrap gap-3 text-xs md:text-sm">
          <div className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200">
            Records:{" "}
            <span className="font-semibold">
              {filteredPayments.length}
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200">
            Total Paid:{" "}
            <span className="font-semibold text-emerald-700">
              ৳ {totals.totalReceived.toFixed(2)}
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
            Loading purchase payments...
          </p>
        ) : filteredPayments.length === 0 ? (
          <p className="text-xs md:text-sm text-slate-500">
            No purchase payments found.
          </p>
        ) : (
          <table className="min-w-full text-xs md:text-sm">
            <thead className="border-b bg-slate-50">
              <tr className="text-left text-slate-500">
                <th className="py-2 px-2">Invoice</th>
                <th className="py-2 px-2">Vendor</th>
                <th className="py-2 px-2 text-center">Purchase Date</th>
                <th className="py-2 px-2 text-center">Pay Mode</th>
                <th className="py-2 px-2 text-center">Bank</th>
                <th className="py-2 px-2 text-center">Account No</th>
                <th className="py-2 px-2 text-center">Cheque No</th>
                <th className="py-2 px-2 text-right">Paid Amount</th>
                <th className="py-2 px-2 text-center">Payment Date</th>
                <th className="py-2 px-2 text-right">
                  Due After Payment
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((p) => (
                <tr
                  key={
                    p.id ||
                    `${p.invoiceNo}-${p.paymentDate}-${p.paidAmount}`
                  }
                  className="border-b last:border-0"
                >
                  <td className="py-2 px-2 font-mono text-[11px]">
                    {p.invoiceNo}
                  </td>
                  <td className="py-2 px-2">
                    <span className="font-medium text-slate-800 text-xs md:text-sm">
                      {p.vendorName}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-center">
                    {p.purchaseDate || "-"}
                  </td>
                  <td className="py-2 px-2 text-center">
                    {p.payMode}
                  </td>
                  <td className="py-2 px-2 text-center">
                    {p.bank || "-"}
                  </td>
                  <td className="py-2 px-2 text-center">
                    {p.accountNo || "-"}
                  </td>
                  <td className="py-2 px-2 text-center">
                    {p.chequeNo || "-"}
                  </td>
                  <td className="py-2 px-2 text-right">
                    {p.paidAmount.toFixed(2)}
                  </td>
                  <td className="py-2 px-2 text-center">
                    {formatDate(p.paymentDate)}
                  </td>
                  <td className="py-2 px-2 text-right">
                    {p.dueAfterPayment.toFixed(2)}
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
