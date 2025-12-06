// client/src/pages/accounting/BankStatement.jsx
import React, { useEffect, useState } from "react";
import AxiosInstance from "../../components/AxiosInstance";

export default function BankStatement() {
  const [bankAccounts, setBankAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [filters, setFilters] = useState({
    bank_account: "",
    from_date: "",
    to_date: "",
  });
  const [loading, setLoading] = useState(false);

  const loadBankAccounts = async () => {
    const res = await AxiosInstance.get("bank-accounts/");
    setBankAccounts(res.data);
  };

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.bank_account) params.bank_account = filters.bank_account;
      if (filters.from_date) params.date__gte = filters.from_date;
      if (filters.to_date) params.date__lte = filters.to_date;

      const res = await AxiosInstance.get("bank-transactions/", { params });
      setTransactions(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBankAccounts();
    loadTransactions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilter = (e) => {
    e.preventDefault();
    loadTransactions();
  };

  return (
    <div className="page-content">
      <h2>Bank Statement</h2>

      <form className="filter-form" onSubmit={handleFilter}>
        <select
          name="bank_account"
          value={filters.bank_account}
          onChange={handleChange}
        >
          <option value="">All Bank Accounts</option>
          {bankAccounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.bankName_name} - {acc.accountName}
            </option>
          ))}
        </select>

        <input
          type="date"
          name="from_date"
          value={filters.from_date}
          onChange={handleChange}
        />
        <input
          type="date"
          name="to_date"
          value={filters.to_date}
          onChange={handleChange}
        />
        <button type="submit">Filter</button>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Date</th>
              <th>Bank Account</th>
              <th>Type</th>
              <th>Narration</th>
              <th>Ref No</th>
              <th>Amount</th>
              <th>Running Balance</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan="7">No transactions</td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.id}>
                  <td>{tx.date}</td>
                  <td>
                    {tx.bank_account_detail?.bankName_name} -{" "}
                    {tx.bank_account_detail?.accountName}
                  </td>
                  <td>{tx.transaction_type}</td>
                  <td>{tx.narration || ""}</td>
                  <td>{tx.reference_no || ""}</td>
                  <td>{Number(tx.amount).toFixed(2)}</td>
                  <td>{Number(tx.running_balance).toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
