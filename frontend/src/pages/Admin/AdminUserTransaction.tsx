// AdminUserTransaction.tsx
import React, { useState, useEffect } from "react";
import AdminWrapper from "../../components/Admin/AdminWrapper";
import { ToastContainer } from "react-toastify";
import { getTransactions } from "../../services/adminAPI";

interface Transaction {
  id: number;
  user_id: number;
  amount: number;
  currency: string;
  account_name: string;
  account_number: string;
  crypto_address: string;
  transaction_type: string;
  transaction_completed: boolean;
  confirm_by: number | null;
  created_at: string;
  updated_at: string;
}

const AdminUserTransaction: React.FC = () => {
  // State for transactions and filters
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [dateFilter, setDateFilter] = useState({ start: "", end: "" });
  const [amountFilter, setAmountFilter] = useState({ min: "", max: "" });

  const [sortField, setSortField] = useState<keyof Transaction>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  // totalItems can be used later if needed from API response
  const [totalItems, setTotalItems] = useState(0);

  const [selectedTransactions, setSelectedTransactions] = useState<Set<number>>(
    new Set()
  );

  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch transactions from API on mount or when currentPage changes
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await getTransactions(currentPage);
        // The API returns an object: { page, pages, total, transactions }
        setTransactions(data.transactions || []); // Set only the transactions array
        setTotalItems(data.total || 0);
        // You can also update currentPage if needed: setCurrentPage(data.page);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };
    fetchTransactions();
  }, [currentPage]);

  // Client-side filtering on the fetched transactions
  const filteredTransactions = transactions.filter((txn) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      txn.id.toString().includes(query) ||
      txn.account_name.toLowerCase().includes(query) ||
      txn.user_id.toString().includes(query);

    const matchesStatus = statusFilter
      ? statusFilter === "Completed"
        ? txn.transaction_completed === true
        : txn.transaction_completed === false
      : true;
    const matchesType = typeFilter ? txn.transaction_type === typeFilter : true;

    const txnDate = new Date(txn.created_at);
    const startDate = dateFilter.start ? new Date(dateFilter.start) : null;
    const endDate = dateFilter.end ? new Date(dateFilter.end) : null;
    const matchesDate =
      (!startDate || txnDate >= startDate) && (!endDate || txnDate <= endDate);

    const minAmount = amountFilter.min ? parseFloat(amountFilter.min) : null;
    const maxAmount = amountFilter.max ? parseFloat(amountFilter.max) : null;
    const matchesAmount =
      (!minAmount || txn.amount >= minAmount) &&
      (!maxAmount || txn.amount <= maxAmount);

    return (
      matchesSearch &&
      matchesStatus &&
      matchesType &&
      matchesDate &&
      matchesAmount
    );
  });

  // Sorting the filtered transactions
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];

    if (sortField === "created_at") {
      return sortOrder === "asc"
        ? new Date(aVal as string).getTime() - new Date(bVal as string).getTime()
        : new Date(bVal as string).getTime() - new Date(aVal as string).getTime();
    }
    if (sortField === "amount") {
      return sortOrder === "asc"
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    }
    return sortOrder === "asc"
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });

  // Client-side pagination calculations
  const computedTotalPages = Math.ceil(sortedTransactions.length / itemsPerPage);
  const paginatedTransactions = sortedTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handler to change sort order when a column header is clicked
  const handleSort = (field: keyof Transaction) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Modal handlers for transaction detail view
  const openModal = (txn: Transaction) => {
    setSelectedTransaction(txn);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedTransaction(null);
    setIsModalOpen(false);
  };

  // Bulk selection handlers
  const toggleSelectTransaction = (id: number) => {
    const newSet = new Set(selectedTransactions);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedTransactions(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedTransactions.size === paginatedTransactions.length) {
      setSelectedTransactions(new Set());
    } else {
      const newSet = new Set<number>();
      paginatedTransactions.forEach((txn) => newSet.add(txn.id));
      setSelectedTransactions(newSet);
    }
  };

  // Bulk action: update status for selected transactions
  const handleBulkStatusUpdate = (newStatus: boolean) => {
    setTransactions((prev) =>
      prev.map((txn) =>
        selectedTransactions.has(txn.id)
          ? { ...txn, transaction_completed: newStatus }
          : txn
      )
    );
    setSelectedTransactions(new Set());
  };

  // Export CSV of sorted transactions
  const handleExportCSV = () => {
    const headers = [
      "Transaction ID",
      "User",
      "Type",
      "Amount",
      "Currency",
      "Status",
      "Date",
    ];
    const rows = sortedTransactions.map((txn) => [
      txn.id,
      `${txn.account_name} (ID: ${txn.user_id})`,
      txn.transaction_type,
      txn.amount,
      txn.currency,
      txn.transaction_completed ? "Completed" : "Pending",
      txn.created_at,
    ]);

    let csvContent =
      "data:text/csv;charset=utf-8," + headers.join(",") + "\n";
    rows.forEach((row) => {
      csvContent += row.join(",") + "\n";
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "transactions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Compute summary statistics
  const totalAmount = sortedTransactions.reduce(
    (sum, txn) => sum + txn.amount,
    0
  );
  const statusCounts = sortedTransactions.reduce((acc, txn) => {
    const status = txn.transaction_completed ? "Completed" : "Pending";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <AdminWrapper>
      <ToastContainer />
      <div className="container mx-auto p-4 text-gray-800 mt-16 mb-36">
        <h1 className="text-2xl font-bold mb-4">Transaction Management</h1>

        {/* Search and Filtering Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input
            type="text"
            placeholder="Search by Transaction ID, User"
            className="border p-2 rounded w-full bg-slate-300"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className="border p-2 rounded w-full bg-slate-300"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
          </select>
          <select
            className="border p-2 rounded w-full bg-slate-300"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="Deposit">Deposit</option>
            <option value="Withdrawal">Withdrawal</option>
            {/* Add more transaction types as needed */}
          </select>
          <input
            type="date"
            className="border p-2 rounded w-full bg-slate-300"
            value={dateFilter.start}
            onChange={(e) =>
              setDateFilter((prev) => ({ ...prev, start: e.target.value }))
            }
          />
          <input
            type="date"
            className="border p-2 rounded w-full bg-slate-300"
            value={dateFilter.end}
            onChange={(e) =>
              setDateFilter((prev) => ({ ...prev, end: e.target.value }))
            }
          />
          <input
            type="number"
            placeholder="Min Amount"
            className="border p-2 rounded w-full bg-slate-300"
            value={amountFilter.min}
            onChange={(e) =>
              setAmountFilter((prev) => ({ ...prev, min: e.target.value }))
            }
          />
          <input
            type="number"
            placeholder="Max Amount"
            className="border p-2 rounded w-full bg-slate-300"
            value={amountFilter.max}
            onChange={(e) =>
              setAmountFilter((prev) => ({ ...prev, max: e.target.value }))
            }
          />
        </div>

        {/* Summary Statistics */}
        <div className="mb-4">
          <p>Total Transactions: {sortedTransactions.length}</p>
          <p>Total Amount: {totalAmount} USD</p>
          <div className="flex space-x-4">
            {Object.entries(statusCounts).map(([status, count]) => (
              <p key={status}>
                {status}: {count}
              </p>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <button
            onClick={handleExportCSV}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Export CSV
          </button>
          {selectedTransactions.size > 0 && (
            <div className="flex items-center space-x-2">
              <span>Bulk Actions:</span>
              <button
                onClick={() => handleBulkStatusUpdate(true)}
                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
              >
                Confirm
              </button>
              <button
                onClick={() => handleBulkStatusUpdate(false)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Mark as Pending
              </button>
            </div>
          )}
        </div>

        {/* Transaction Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 border">
                  <input
                    className="bg-slate-300"
                    type="checkbox"
                    checked={
                      paginatedTransactions.length > 0 &&
                      selectedTransactions.size === paginatedTransactions.length
                    }
                    onChange={toggleSelectAll}
                  />
                </th>
                <th
                  className="p-2 border cursor-pointer"
                  onClick={() => handleSort("id")}
                >
                  Transaction ID{" "}
                  {sortField === "id" && (sortOrder === "asc" ? "▲" : "▼")}
                </th>
                <th
                  className="p-2 border cursor-pointer"
                  onClick={() => handleSort("account_name")}
                >
                  User{" "}
                  {sortField === "account_name" &&
                    (sortOrder === "asc" ? "▲" : "▼")}
                </th>
                <th
                  className="p-2 border cursor-pointer"
                  onClick={() => handleSort("transaction_type")}
                >
                  Type{" "}
                  {sortField === "transaction_type" &&
                    (sortOrder === "asc" ? "▲" : "▼")}
                </th>
                <th
                  className="p-2 border cursor-pointer"
                  onClick={() => handleSort("amount")}
                >
                  Amount{" "}
                  {sortField === "amount" && (sortOrder === "asc" ? "▲" : "▼")}
                </th>
                <th
                  className="p-2 border cursor-pointer"
                  onClick={() => handleSort("currency")}
                >
                  Currency{" "}
                  {sortField === "currency" &&
                    (sortOrder === "asc" ? "▲" : "▼")}
                </th>
                <th
                  className="p-2 border cursor-pointer"
                  onClick={() => handleSort("transaction_completed")}
                >
                  Status{" "}
                  {sortField === "transaction_completed" &&
                    (sortOrder === "asc" ? "▲" : "▼")}
                </th>
                <th
                  className="p-2 border cursor-pointer"
                  onClick={() => handleSort("created_at")}
                >
                  Date{" "}
                  {sortField === "created_at" &&
                    (sortOrder === "asc" ? "▲" : "▼")}
                </th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTransactions.map((txn) => (
                <tr key={txn.id} className="hover:bg-gray-100">
                  <td className="p-2 border text-center">
                    <input
                      className="bg-slate-300"
                      type="checkbox"
                      checked={selectedTransactions.has(txn.id)}
                      onChange={() => toggleSelectTransaction(txn.id)}
                    />
                  </td>
                  <td
                    className="p-2 border cursor-pointer"
                    onClick={() => openModal(txn)}
                  >
                    {txn.id}
                  </td>
                  <td
                    className="p-2 border cursor-pointer"
                    onClick={() => openModal(txn)}
                  >
                    {txn.account_name} (ID: {txn.user_id})
                  </td>
                  <td
                    className="p-2 border cursor-pointer"
                    onClick={() => openModal(txn)}
                  >
                    {txn.transaction_type}
                  </td>
                  <td
                    className="p-2 border cursor-pointer"
                    onClick={() => openModal(txn)}
                  >
                    {txn.amount}
                  </td>
                  <td
                    className="p-2 border cursor-pointer"
                    onClick={() => openModal(txn)}
                  >
                    {txn.currency}
                  </td>
                  <td
                    className="p-2 border cursor-pointer"
                    onClick={() => openModal(txn)}
                  >
                    {txn.transaction_completed ? "Completed" : "Pending"}
                  </td>
                  <td
                    className="p-2 border cursor-pointer"
                    onClick={() => openModal(txn)}
                  >
                    {new Date(txn.created_at).toLocaleString()}
                  </td>
                  <td className="p-2 border">
                    <button
                      onClick={() => openModal(txn)}
                      className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
              {paginatedTransactions.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-4 text-center">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-4">
          <div>
            <span>
              Page {currentPage} of {computedTotalPages}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="px-3 py-1 border rounded disabled:opacity-50"
              disabled={currentPage === 1}
            >
              Prev
            </button>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, computedTotalPages))
              }
              className="px-3 py-1 border rounded disabled:opacity-50"
              disabled={currentPage === computedTotalPages}
            >
              Next
            </button>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(parseInt(e.target.value));
                setCurrentPage(1);
              }}
              className="border p-2 rounded"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
            </select>
          </div>
        </div>

        {/* Transaction Detail Modal */}
        {isModalOpen && selectedTransaction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-2xl rounded shadow-lg overflow-y-auto max-h-full">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-semibold">Transaction Details</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-600 hover:text-gray-800"
                >
                  &times;
                </button>
              </div>
              <div className="p-4">
                <div className="mb-4">
                  <h3 className="font-semibold">Transaction Information</h3>
                  <p>
                    <strong>ID:</strong> {selectedTransaction.id}
                  </p>
                  <p>
                    <strong>User:</strong> {selectedTransaction.account_name} (ID:{" "}
                    {selectedTransaction.user_id})
                  </p>
                  <p>
                    <strong>Type:</strong>{" "}
                    {selectedTransaction.transaction_type}
                  </p>
                  <p>
                    <strong>Amount:</strong> {selectedTransaction.amount}{" "}
                    {selectedTransaction.currency}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    {selectedTransaction.transaction_completed
                      ? "Completed"
                      : "Pending"}
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(selectedTransaction.created_at).toLocaleString()}
                  </p>
                  <p>
                    <strong>Account Number:</strong>{" "}
                    {selectedTransaction.account_number}
                  </p>
                  <p>
                    <strong>Crypto Address:</strong>{" "}
                    {selectedTransaction.crypto_address}
                  </p>
                </div>
                <div className="mb-4">
                  <h3 className="font-semibold">Admin Actions</h3>
                  <div className="flex space-x-2">
                    <button
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                      onClick={() => {
                        setTransactions((prev) =>
                          prev.map((txn) =>
                            txn.id === selectedTransaction.id
                              ? { ...txn, transaction_completed: true }
                              : txn
                          )
                        );
                        closeModal();
                      }}
                    >
                      Confirm
                    </button>
                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      onClick={() => {
                        setTransactions((prev) =>
                          prev.map((txn) =>
                            txn.id === selectedTransaction.id
                              ? { ...txn, transaction_completed: false }
                              : txn
                          )
                        );
                        closeModal();
                      }}
                    >
                      Mark as Pending
                    </button>
                    <button
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                      onClick={() => {
                        const reason = prompt("Enter reason for manual override:");
                        if (reason) {
                          // Implement manual override logic and log audit info here.
                          alert("Manual override logged with reason: " + reason);
                        }
                      }}
                    >
                      Manual Override
                    </button>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold">Audit Trail</h3>
                  {/* Display audit logs here if available */}
                  <p>No audit logs available.</p>
                </div>
              </div>
              <div className="p-4 border-t text-right">
                <button
                  onClick={closeModal}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminWrapper>
  );
};

export default AdminUserTransaction;
