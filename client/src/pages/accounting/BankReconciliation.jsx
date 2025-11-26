import { useMemo, useState } from "react";

const STATUS_STYLES = {
  Balanced: "bg-emerald-100 text-emerald-700",
  "More in Books": "bg-amber-100 text-amber-700",
  "More in Bank": "bg-sky-100 text-sky-700",
};

const BANK_ACCOUNTS = [
  { id: 1, name: "Main Bank Account - 001" },
  { id: 2, name: "Payroll Account - 002" },
  { id: 3, name: "Collection Account - 003" },
];

// Example – in real app, load from backend
const SAMPLE_BOOK_ENTRIES = [
  {
    id: 1,
    date: "2025-11-20",
    refNo: "PV-0012",
    description: "Cheque issued to Supplier A",
    debit: 0,
    credit: 15000,
    reconciled: true,
  },
  {
    id: 2,
    date: "2025-11-22",
    refNo: "RV-0045",
    description: "Customer receipt – Invoice #INV-1001",
    debit: 20000,
    credit: 0,
    reconciled: false,
  },
  {
    id: 3,
    date: "2025-11-24",
    refNo: "PV-0013",
    description: "Office rent payment",
    debit: 0,
    credit: 12000,
    reconciled: false,
  },
];

export default function BankReconciliation() {
  const [summaryForm, setSummaryForm] = useState({
    bankAccountId: 1,
    periodFrom: "",
    periodTo: "",
    asOfDate: "",
    bookClosing: "",
    statementClosing: "",
    preparedBy: "",
    remarks: "",
  });

  const [bookEntries, setBookEntries] = useState(SAMPLE_BOOK_ENTRIES);

  // Bank statement entries (right table)
  const [bankEntries, setBankEntries] = useState([]);

  // Manual statement line form
  const [bankForm, setBankForm] = useState({
    date: "",
    refNo: "",
    description: "",
    debit: "",
    credit: "",
  });

  // Raw written statement text (optional big textarea)
  const [rawStatementText, setRawStatementText] = useState("");

  // Uploaded statement file (PDF / CSV / OFX / QIF)
  const [uploadedStatement, setUploadedStatement] = useState(null);

  // Saved reconciliation history
  const [history, setHistory] = useState([]);

  // ===== Derived values =====

  const bookClosing = Number(summaryForm.bookClosing) || 0;
  const statementClosing = Number(summaryForm.statementClosing) || 0;

  const difference = useMemo(
    () => bookClosing - statementClosing,
    [bookClosing, statementClosing]
  );

  let status = "Balanced";
  if (difference > 0) status = "More in Books";
  if (difference < 0) status = "More in Bank";

  const bookUnreconciledTotal = useMemo(
    () =>
      bookEntries
        .filter((e) => !e.reconciled)
        .reduce((sum, e) => sum + (e.debit - e.credit), 0),
    [bookEntries]
  );

  const bankUnreconciledTotal = useMemo(
    () =>
      bankEntries
        .filter((e) => !e.reconciled)
        .reduce((sum, e) => sum + (e.debit - e.credit), 0),
    [bankEntries]
  );

  const netUnreconciledImpact = useMemo(
    () => bookUnreconciledTotal - bankUnreconciledTotal,
    [bookUnreconciledTotal, bankUnreconciledTotal]
  );

  // ===== Handlers =====

  const handleSummaryChange = (e) => {
    const { name, value } = e.target;
    setSummaryForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBankFormChange = (e) => {
    const { name, value } = e.target;
    setBankForm((prev) => ({ ...prev, [name]: value }));
  };

  const addBankEntry = (e) => {
    e.preventDefault();
    if (!bankForm.date || !bankForm.refNo) return;

    const debit = Number(bankForm.debit) || 0;
    const credit = Number(bankForm.credit) || 0;

    if (debit === 0 && credit === 0) return;

    setBankEntries((prev) => [
      ...prev,
      {
        id: Date.now(),
        date: bankForm.date,
        refNo: bankForm.refNo,
        description: bankForm.description,
        debit,
        credit,
        reconciled: false,
      },
    ]);

    setBankForm({
      date: "",
      refNo: "",
      description: "",
      debit: "",
      credit: "",
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedStatement({
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
    });

    // Here you will call backend API to parse PDF/CSV into bankEntries.
    // This component only handles UI & local state.
  };

  const toggleBookReconciled = (id) => {
    setBookEntries((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, reconciled: !e.reconciled } : e
      )
    );
  };

  const toggleBankReconciled = (id) => {
    setBankEntries((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, reconciled: !e.reconciled } : e
      )
    );
  };

  const clearForm = () => {
    setSummaryForm((prev) => ({
      ...prev,
      asOfDate: "",
      bookClosing: "",
      statementClosing: "",
      preparedBy: "",
      remarks: "",
    }));
  };

  const saveReconciliation = (e) => {
    e.preventDefault();
    if (!summaryForm.asOfDate || !summaryForm.preparedBy) return;

    const bankAccount = BANK_ACCOUNTS.find(
      (b) => b.id === Number(summaryForm.bankAccountId)
    );

    const newItem = {
      id: Date.now(),
      asOfDate: summaryForm.asOfDate,
      bankAccountName: bankAccount?.name || "",
      preparedBy: summaryForm.preparedBy,
      bookClosing,
      statementClosing,
      difference,
      status,
      remarks: summaryForm.remarks,
    };

    setHistory((prev) => [newItem, ...prev]);
    clearForm();
  };

  const selectedBank = BANK_ACCOUNTS.find(
    (b) => b.id === Number(summaryForm.bankAccountId)
  );

  // ===== UI =====

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-slate-50 px-4 py-4 sm:px-6 sm:py-5 shadow-sm border border-slate-800/60">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-700/80 text-xl">
              🏦
            </span>
            <div>
              <h1 className="text-lg sm:text-xl font-semibold tracking-tight">
                Bank Reconciliation
              </h1>
              <p className="text-xs sm:text-sm text-slate-300">
                Match bank balance in your books with the bank statement and
                track unreconciled items.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-700/70 px-3 py-1">
              Book Balance:
              <span className="font-semibold">
                ৳ {bookClosing.toLocaleString()}
              </span>
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-700/70 px-3 py-1">
              Statement Balance:
              <span className="font-semibold">
                ৳ {statementClosing.toLocaleString()}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Summary / filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3 text-sm">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
            <div>
              <label className="block text-xs text-slate-500 mb-1">
                Bank Account
              </label>
              <select
                name="bankAccountId"
                value={summaryForm.bankAccountId}
                onChange={handleSummaryChange}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
              >
                {BANK_ACCOUNTS.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1">
                Period From
              </label>
              <input
                type="date"
                name="periodFrom"
                value={summaryForm.periodFrom}
                onChange={handleSummaryChange}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1">
                Period To
              </label>
              <input
                type="date"
                name="periodTo"
                value={summaryForm.periodTo}
                onChange={handleSummaryChange}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
            <div>
              <label className="block text-xs text-slate-500 mb-1">
                As of Date *
              </label>
              <input
                type="date"
                name="asOfDate"
                value={summaryForm.asOfDate}
                onChange={handleSummaryChange}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
              />
            </div>

            <NumberField
              label="Book Closing Balance (per software)"
              name="bookClosing"
              value={summaryForm.bookClosing}
              onChange={handleSummaryChange}
            />

            <NumberField
              label="Bank Statement Closing Balance"
              name="statementClosing"
              value={summaryForm.statementClosing}
              onChange={handleSummaryChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Prepared By *
            </label>
            <input
              name="preparedBy"
              value={summaryForm.preparedBy}
              onChange={handleSummaryChange}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
              placeholder="Person preparing reconciliation"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs text-slate-500 mb-1">
              Remarks / Notes
            </label>
            <textarea
              name="remarks"
              value={summaryForm.remarks}
              onChange={handleSummaryChange}
              rows={2}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
              placeholder="Example: Monthly bank reconciliation, imported statement from bank, etc."
            />
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-3">
          <SummaryCard
            label="Book Closing Balance"
            value={`৳ ${bookClosing.toLocaleString()}`}
            subtitle="From your general ledger / cash book"
          />
          <SummaryCard
            label="Statement Closing Balance"
            value={`৳ ${statementClosing.toLocaleString()}`}
            subtitle="As per bank statement"
          />
          <SummaryCard
            label="Difference (Book – Bank)"
            value={`৳ ${difference.toLocaleString()}`}
            subtitle={
              difference === 0
                ? "No difference"
                : difference > 0
                ? "More balance in books"
                : "More balance in bank"
            }
          />
          <SummaryCard
            label="Status"
            value={status}
            subtitle="Overall reconciliation result"
            status={status}
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="text-[11px] text-slate-500">
            Bank:{" "}
            <span className="font-medium text-slate-700">
              {selectedBank?.name}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={clearForm}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              Clear form
            </button>
            <button
              type="button"
              onClick={saveReconciliation}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-900 text-white text-xs font-medium shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/40"
            >
              Save Reconciliation
            </button>
          </div>
        </div>
      </div>

      {/* Matching area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Book side */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 text-sm space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-semibold text-slate-800">
              Book Entries (Software)
            </h2>
            <span className="text-[11px] text-slate-500">
              Tick entries that appear in the bank statement
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-left text-slate-500">
                  <th className="py-2.5 px-3 w-10" />
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Ref</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3 text-right">Debit</th>
                  <th className="py-2.5 px-3 text-right">Credit</th>
                </tr>
              </thead>
              <tbody>
                {bookEntries.map((e) => (
                  <tr
                    key={e.id}
                    className={`border-t border-slate-100 hover:bg-slate-50/70 transition-colors ${
                      e.reconciled ? "bg-emerald-50/40" : ""
                    }`}
                  >
                    <td className="py-2.5 px-3 text-center align-middle">
                      <input
                        type="checkbox"
                        checked={e.reconciled}
                        onChange={() => toggleBookReconciled(e.id)}
                        className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900/50"
                      />
                    </td>
                    <td className="py-2.5 px-3">{e.date}</td>
                    <td className="py-2.5 px-3 text-xs font-mono">
                      {e.refNo}
                    </td>
                    <td
                      className="py-2.5 px-3 max-w-xs truncate text-xs"
                      title={e.description}
                    >
                      {e.description}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {e.debit ? `৳ ${e.debit.toLocaleString()}` : "-"}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {e.credit ? `৳ ${e.credit.toLocaleString()}` : "-"}
                    </td>
                  </tr>
                ))}
                {bookEntries.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-5 px-3 text-center text-sm text-slate-500"
                    >
                      No book entries loaded.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-slate-50 border-t border-slate-200">
                <tr>
                  <td
                    colSpan={6}
                    className="py-2.5 px-3 text-xs text-slate-500"
                  >
                    Unreconciled (book side) net impact:{" "}
                    <span className="font-semibold text-slate-800">
                      ৳ {bookUnreconciledTotal.toLocaleString()}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Bank side – manual lines + file upload + raw statement text */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 text-sm space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-semibold text-slate-800">
              Bank Statement Entries
            </h2>
            <span className="text-[11px] text-slate-500">
              Manual lines, plus upload PDF/CSV from bank
            </span>
          </div>

          {/* Top: manual statement line + upload box */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
            {/* Manual single line entry */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
              <div className="text-[11px] font-medium text-slate-600 mb-1">
                Add Statement Line (written statement)
              </div>
              <form
                onSubmit={addBankEntry}
                className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs sm:text-[11px]"
              >
                <input
                  type="date"
                  name="date"
                  value={bankForm.date}
                  onChange={handleBankFormChange}
                  className="sm:col-span-2 border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-900/20 focus:border-slate-400 bg-white"
                  required
                />
                <input
                  name="refNo"
                  value={bankForm.refNo}
                  onChange={handleBankFormChange}
                  className="border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-900/20 focus:border-slate-400 bg-white"
                  placeholder="Ref / Cheque"
                  required
                />
                <input
                  name="description"
                  value={bankForm.description}
                  onChange={handleBankFormChange}
                  className="sm:col-span-2 border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-900/20 focus:border-slate-400 bg-white"
                  placeholder="Narration / Description"
                />
                <input
                  type="number"
                  name="debit"
                  value={bankForm.debit}
                  onChange={handleBankFormChange}
                  className="border border-slate-200 rounded-lg px-2 py-1.5 text-right focus:outline-none focus:ring-1 focus:ring-slate-900/20 focus:border-slate-400 bg-white"
                  placeholder="Debit (-)"
                />
                <input
                  type="number"
                  name="credit"
                  value={bankForm.credit}
                  onChange={handleBankFormChange}
                  className="border border-slate-200 rounded-lg px-2 py-1.5 text-right focus:outline-none focus:ring-1 focus:ring-slate-900/20 focus:border-slate-400 bg-white"
                  placeholder="Credit (+)"
                />
                <div className="sm:col-span-5 flex justify-end mt-1">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 text-white text-[11px] font-medium shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/40"
                  >
                    Add Line
                  </button>
                </div>
              </form>
            </div>

            {/* Upload PDF / CSV */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
              <div className="text-[11px] font-medium text-slate-600 mb-1">
                Upload Statement File (PDF / CSV / OFX / QIF)
              </div>
              <div className="flex flex-col gap-2 text-xs">
                <label className="inline-flex items-center justify-between gap-2 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2 cursor-pointer hover:border-slate-400">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-medium text-slate-700">
                      Choose file
                    </span>
                    <span className="text-[10px] text-slate-500">
                      We’ll attach this to the reconciliation. Backend can parse
                      it into transactions.
                    </span>
                  </div>
                  <span className="px-2 py-1 rounded-full bg-slate-900 text-white text-[10px]">
                    Browse…
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.csv,.ofx,.qif,application/pdf"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
                {uploadedStatement ? (
                  <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 flex items-center justify-between">
                    <div className="text-[11px]">
                      <div className="font-medium text-slate-800 truncate max-w-[150px]">
                        {uploadedStatement.name}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {(uploadedStatement.size / 1024).toFixed(1)} KB •{" "}
                        {uploadedStatement.type || "file"}
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                      Uploaded
                    </span>
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-500">
                    No file uploaded yet.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Optional: big textarea for completely written statements */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <label className="block text-[11px] text-slate-600 mb-1">
              Raw Written Statement (optional)
            </label>
            <textarea
              rows={2}
              value={rawStatementText}
              onChange={(e) => setRawStatementText(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900/20 focus:border-slate-400 bg-white"
              placeholder="User can type or paste the bank statement text here for reference. Backend can later support parsing this if needed."
            />
          </div>

          {/* Table of parsed / manual bank entries */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-left text-slate-500">
                  <th className="py-2.5 px-3 w-10" />
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Ref</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3 text-right">Debit</th>
                  <th className="py-2.5 px-3 text-right">Credit</th>
                </tr>
              </thead>
              <tbody>
                {bankEntries.map((e) => (
                  <tr
                    key={e.id}
                    className={`border-t border-slate-100 hover:bg-slate-50/70 transition-colors ${
                      e.reconciled ? "bg-emerald-50/40" : ""
                    }`}
                  >
                    <td className="py-2.5 px-3 text-center align-middle">
                      <input
                        type="checkbox"
                        checked={e.reconciled}
                        onChange={() => toggleBankReconciled(e.id)}
                        className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900/50"
                      />
                    </td>
                    <td className="py-2.5 px-3">{e.date}</td>
                    <td className="py-2.5 px-3 text-xs font-mono">
                      {e.refNo}
                    </td>
                    <td
                      className="py-2.5 px-3 max-w-xs truncate text-xs"
                      title={e.description}
                    >
                      {e.description}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {e.debit ? `৳ ${e.debit.toLocaleString()}` : "-"}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {e.credit ? `৳ ${e.credit.toLocaleString()}` : "-"}
                    </td>
                  </tr>
                ))}
                {bankEntries.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-5 px-3 text-center text-sm text-slate-500"
                    >
                      No bank statement lines yet. Add them manually or upload a
                      statement file.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-slate-50 border-t border-slate-200">
                <tr>
                  <td
                    colSpan={6}
                    className="py-2.5 px-3 text-xs text-slate-500"
                  >
                    Unreconciled (bank side) net impact:{" "}
                    <span className="font-semibold text-slate-800">
                      ৳ {bankUnreconciledTotal.toLocaleString()}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">
                Net impact of unreconciled items (Book – Bank)
              </span>
              <span className="font-semibold text-slate-800">
                ৳ {netUnreconciledImpact.toLocaleString()}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              After importing or posting all entries, mark matching items as
              reconciled. Remaining unreconciled amounts explain why book and
              bank balances differ.
            </p>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 text-sm">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-slate-800">
            Bank Reconciliation History
          </h2>
          <span className="text-[11px] text-slate-500">
            Saved reconciliations for this company
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-left text-slate-500">
                <th className="py-2.5 px-3">As of Date</th>
                <th className="py-2.5 px-3">Bank Account</th>
                <th className="py-2.5 px-3">Prepared By</th>
                <th className="py-2.5 px-3 text-right">Book Balance</th>
                <th className="py-2.5 px-3 text-right">Statement Balance</th>
                <th className="py-2.5 px-3 text-right">Difference</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="py-5 px-3 text-center text-sm text-slate-500"
                  >
                    No bank reconciliations saved yet.
                  </td>
                </tr>
              )}
              {history.map((h) => (
                <tr
                  key={h.id}
                  className="border-t border-slate-100 hover:bg-slate-50/70 transition-colors"
                >
                  <td className="py-2.5 px-3">{h.asOfDate}</td>
                  <td className="py-2.5 px-3">{h.bankAccountName}</td>
                  <td className="py-2.5 px-3">{h.preparedBy}</td>
                  <td className="py-2.5 px-3 text-right">
                    ৳ {h.bookClosing.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    ৳ {h.statementClosing.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    ৳ {h.difference.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 text-[11px] rounded-full font-medium ${
                        STATUS_STYLES[h.status] ||
                        "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {h.status}
                    </span>
                  </td>
                  <td
                    className="py-2.5 px-3 max-w-xs truncate text-xs"
                    title={h.remarks}
                  >
                    {h.remarks}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ===== Reusable components ===== */

function SummaryCard({ label, value, subtitle, status }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
          {label}
        </div>
        {status && (
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full ${
              STATUS_STYLES[status] || "bg-slate-100 text-slate-700"
            }`}
          >
            {status}
          </span>
        )}
      </div>
      <div className="text-xl font-semibold tracking-tight">{value}</div>
      <div className="text-xs text-slate-500">{subtitle}</div>
    </div>
  );
}

function NumberField({ label, name, value, onChange }) {
  return (
    <div>
      <label className="block text-xs text-slate-500 mb-1">{label}</label>
      <div className="relative">
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">
          ৳
        </span>
        <input
          type="number"
          name={name}
          value={value}
          onChange={onChange}
          className="w-full border border-slate-200 rounded-xl pl-6 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
        />
      </div>
    </div>
  );
}
