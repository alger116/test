// Set default colors for charts
Chart.defaults.color = "#6B7280"; // Default text color
Chart.defaults.borderColor = "#E5E7EB"; // Default border color

document.addEventListener("DOMContentLoaded", () => {
  looMaksumusChart();
  looPiirmaaraChart();
});

function looMaksumusChart() {
  const ctx = document.getElementById("maksumusChart").getContext("2d");
  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Alla piirmäära", "Üle piirmäära"],
      datasets: [
        {
          data: [70, 30], // Ajutised andmed
          backgroundColor: ["#10B981", "#EF4444"],
        },
      ],
    },
  });
}

function looPiirmaaraChart() {
  const ctx = document.getElementById("piirmaaraChart").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Ost 1", "Ost 2", "Ost 3"],
      datasets: [
        {
          label: "Maksumus (€)",
          data: [1090, 12500, 500], // Ajutised andmed
          backgroundColor: "#3B82F6",
        },
      ],
    },
  });
}
