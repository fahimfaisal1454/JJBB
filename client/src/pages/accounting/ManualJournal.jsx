import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // for navigation
import AxiosInstance from "../../components/AxiosInstance";

export default function ManualJournal() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [lines, setLines] = useState([
    { account_id: "", debit: "", credit: "", description: "" },
  ]);

  const [date, setDate] = useState("");
  const [reference, setReference] = useState("");
  const [description, setDescription] = useState("");

  // Fetch accounts
  useEffect(() => {
    AxiosInstance.get("accounts/").then((res) => setAccounts(res.data));
  }, []);

  const addLine = () => {
    setLines([...lines, { account_id: "", debit: "", credit: "", description: "" }]);
  };

  const removeLine = (index) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  const updateLine = (index, field, value) => {
    const updated = [...lines];
    updated[index][field] = value;
    setLines(updated);
  };

  const totalDebit = lines.reduce((sum, l) => sum + Number(l.debit || 0), 0);
  const totalCredit = lines.reduce((sum, l) => sum + Number(l.credit || 0), 0);
  const isBalanced = totalDebit === totalCredit && totalDebit > 0;

  const submitJournal = async () => {
    if (!isBalanced) {
      alert("Journal must be balanced (Debit = Credit)");
      return;
    }

    const cleanedLines = lines.map((l) => ({
      account_id: l.account_id,
      debit: l.debit ? Number(l.debit) : 0,
      credit: l.credit ? Number(l.credit) : 0,
      description: l.description || "",
    }));

    // Validate each line
    for (let i = 0; i < cleanedLines.length; i++) {
      const l = cleanedLines[i];

      if (!l.account_id) {
        alert(`Line ${i + 1}: Account is required`);
        return;
      }
      if (l.debit > 0 && l.credit > 0) {
        alert(`Line ${i + 1}: Cannot have both debit and credit`);
        return;
      }
      if (l.debit === 0 && l.credit === 0) {
        alert(`Line ${i + 1}: Either debit or credit is required`);
        return;
      }
    }

    // Submit to backend
    await AxiosInstance.post("journals/", {
      date,
      reference,
      description,
      lines: cleanedLines,
    });

    alert("Journal Posted Successfully");

    // Clear the form
    setDate("");
    setReference("");
    setDescription("");
    setLines([{ account_id: "", debit: "", credit: "", description: "" }]);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Manual Journal Entry</h2>
        <button
          onClick={() => navigate("/accounting/journal-list")}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded shadow"
        >
          View Journals
        </button>
      </div>

      {/* Journal Info */}
      <div className="bg-white shadow rounded-lg p-6 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Date</label>
          <input
            type="date"
            className="w-full border rounded px-3 py-2 focus:ring focus:ring-blue-200"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Reference</label>
          <input
            className="w-full border rounded px-3 py-2 focus:ring focus:ring-blue-200"
            placeholder="INV-001"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
          <input
            className="w-full border rounded px-3 py-2 focus:ring focus:ring-blue-200"
            placeholder="Narration"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>

      {/* Journal Lines */}
      <div className="bg-white shadow rounded-lg p-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b text-left text-sm text-gray-600">
              <th className="pb-2">Account</th>
              <th className="pb-2 text-right">Debit</th>
              <th className="pb-2 text-right">Credit</th>
              <th className="pb-2">Description</th>
              <th />
            </tr>
          </thead>

          <tbody>
            {lines.map((line, i) => (
              <tr key={i} className="border-b last:border-0">
                <td className="py-2">
                  <select
                    className="w-full border rounded px-2 py-1"
                    value={line.account_id}
                    onChange={(e) => updateLine(i, "account_id", e.target.value)}
                  >
                    <option value="">Select account</option>
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id} disabled={!a.is_active}>
                        {a.code} - {a.name} {!a.is_active && "(Inactive)"}
                      </option>
                    ))}
                  </select>
                </td>

                <td className="py-2">
                  <input
                    type="number"
                    className="w-full border rounded px-2 py-1 text-right"
                    placeholder="0.00"
                    value={line.debit}
                    onChange={(e) => updateLine(i, "debit", e.target.value)}
                  />
                </td>

                <td className="py-2">
                  <input
                    type="number"
                    className="w-full border rounded px-2 py-1 text-right"
                    placeholder="0.00"
                    value={line.credit}
                    onChange={(e) => updateLine(i, "credit", e.target.value)}
                  />
                </td>

                <td className="py-2">
                  <input
                    className="w-full border rounded px-2 py-1"
                    placeholder="Line description"
                    value={line.description}
                    onChange={(e) => updateLine(i, "description", e.target.value)}
                  />
                </td>

                <td className="py-2 text-right">
                  {lines.length > 1 && (
                    <button
                      onClick={() => removeLine(i)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      ✕
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button
          onClick={addLine}
          className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          + Add Line
        </button>

        {/* Totals */}
        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm">
            <p>
              <strong>Total Debit:</strong> {totalDebit.toFixed(2)}
            </p>
            <p>
              <strong>Total Credit:</strong> {totalCredit.toFixed(2)}
            </p>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              isBalanced ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {isBalanced ? "Balanced" : "Not Balanced"}
          </span>
        </div>
      </div>

      {/* Submit */}
      <div className="mt-6 text-right">
        <button
          onClick={submitJournal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded shadow disabled:opacity-50"
          disabled={!isBalanced}
        >
          Post Journal
        </button>
      </div>
    </div>
  );
}
