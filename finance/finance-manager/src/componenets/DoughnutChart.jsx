import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const DoughnutChart = ({ transactions }) => {
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const data = {
    labels: ["Income", "Expenses"],
    datasets: [
      {
        data: [income, expenses],
        backgroundColor: ["#4CAF50", "#FF5252"], // Soft green & red
        hoverBackgroundColor: ["#388E3C", "#D32F2F"], // Darker on hover
        borderWidth: 2,
        borderColor: "#ffffff",
        hoverOffset: 8,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          font: { size: 14 },
          color: "#333",
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: "rgba(0,0,0,0.7)",
        bodyColor: "#fff",
        titleFont: { size: 14 },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div style={{ width: "100%", height: "300px", display: "flex", justifyContent: "center" }}>
      <Doughnut data={data} options={options} />
    </div>
  );
};

export default DoughnutChart;
