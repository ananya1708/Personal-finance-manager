import { Table } from "react-bootstrap";

const TransactionsTable = ({ transactions }) => {
  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);

  return (
    <div className="table-responsive">
      <Table striped bordered hover className="mt-2 text-center shadow-sm">
        <thead className="table-dark">
          <tr>
            <th>Date</th>
            <th>Category</th>
            <th>Amount</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length > 0 ? (
            transactions.map((t) => (
              <tr key={t._id}>
                <td>{new Date(t.date).toLocaleDateString()}</td>
                <td>{t.category}</td>
                <td>{formatCurrency(t.amount)}</td>
                <td className={t.type === "income" ? "text-success fw-bold" : "text-danger fw-bold"}>
                  {t.type.charAt(0).toUpperCase() + t.type.slice(1)}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-muted text-center">
                No transactions found.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default TransactionsTable;
