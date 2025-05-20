import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    Filler
  } from "chart.js";
  import { Line } from "react-chartjs-2";
  
  ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);
  
  const LineChart = ({ transactions }) => {
    // Extract unique months from transactions
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyData = Array(12).fill(0); // Initialize with 0s
  
    transactions.forEach((t) => {
      const monthIndex = new Date(t.date).getMonth();
      monthlyData[monthIndex] += t.type === "income" ? t.amount : -t.amount;
    });
  
    const data = {
      labels: months,
      datasets: [
        {
          label: "Net Income",
          data: monthlyData,
          borderColor: "#007bff",
          backgroundColor: "rgba(0, 123, 255, 0.2)",
          pointBackgroundColor: "#007bff",
          pointBorderColor: "#fff",
          pointHoverRadius: 6,
          fill: true, // Smooth gradient under line
          tension: 0.3, // Smooth curves
        },
      ],
    };
  
    const options = {
      plugins: {
        legend: {
          display: true,
          position: "top",
          labels: {
            font: { size: 14 },
            color: "#333",
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
      scales: {
        x: {
          grid: { display: false },
        },
        y: {
          beginAtZero: true,
          grid: { color: "rgba(0, 0, 0, 0.1)" },
        },
      },
    };
  
    return (
      <div style={{ width: "100%", height: "350px" }}>
        <Line data={data} options={options} />
      </div>
    );
  };
  
  export default LineChart;
  