document.addEventListener("DOMContentLoaded", () => {
  laeOstud();
});

let ostud = [
  {
    kuupaev: "2025-03-23",
    eeldatav: 20000,
    reaalne: 12500,
    piirmaar: 29999.99,
    pakkuja: "Maskott",
    markused: "",
  },
  {
    kuupaev: "2025-08-22",
    eeldatav: 500,
    reaalne: 1090,
    piirmaar: 29999.99,
    pakkuja: "eakate ujumise oü",
    markused: "",
  },
];

function laeOstud() {
  const tbody = document.getElementById("ostud-body");
  tbody.innerHTML = "";

  ostud.forEach((ost, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td class="p-2 border">${ost.kuupaev}</td>
            <td class="p-2 border">${ost.eeldatav} €</td>
            <td class="p-2 border">${ost.reaalne} €</td>
            <td class="p-2 border ${ost.reaalne > ost.piirmaar ? "text-red-500" : "text-green-500"}">${(ost.piirmaar - ost.reaalne).toFixed(2)} €</td>
            <td class="p-2 border">${ost.pakkuja}</td>
            <td class="p-2 border">${ost.markused}</td>
            <td class="p-2 border">
                <button class="px-2 py-1 bg-red-500 text-white rounded" onclick="kustutaOst(${index})">Kustuta</button>
            </td>
        `;
    tbody.appendChild(row);
  });
}

function togglePurchaseModal(show) {
  const modal = document.getElementById("addPurchaseModal");
  modal.classList.toggle("hidden", !show);
}

function lisaOst() {
  const kuupaev = document.getElementById("purchaseDate").value.trim();
  const eeldatav = parseFloat(
    document.getElementById("expectedCost").value.trim(),
  );
  const reaalne = parseFloat(
    document.getElementById("actualCost").value.trim(),
  );
  const pakkuja = document.getElementById("supplier").value.trim();
  const markused = document.getElementById("notes").value.trim();

  if (!kuupaev || isNaN(eeldatav) || isNaN(reaalne) || !pakkuja) {
    alert("Palun täida kõik nõutud väljad!");
    return;
  }

  const uusOst = {
    kuupaev,
    eeldatav,
    reaalne,
    piirmaar: 29999.99,
    pakkuja,
    markused,
  };

  ostud.push(uusOst);
  laeOstud();
  togglePurchaseModal(false);
}

function kustutaOst(index) {
  if (confirm("Kas oled kindel, et soovid selle ostu kustutada?")) {
    ostud.splice(index, 1);
    laeOstud();
  }
}

function otsiOst() {
  const searchValue = document.getElementById("search").value.toLowerCase();
  ostud.forEach((ost, index) => {
    const row = document.getElementById("ostud-body").children[index];
    row.style.display = ost.pakkuja.toLowerCase().includes(searchValue)
      ? "table-row"
      : "none";
  });
}

function filtreeriOst() {
  const filterValue = document.getElementById("filter").value;
  ostud.forEach((ost, index) => {
    const row = document.getElementById("ostud-body").children[index];
    if (filterValue === "alla_piirmäära" && ost.reaalne > ost.piirmaar) {
      row.style.display = "none";
    } else if (filterValue === "ule_piirmaara" && ost.reaalne <= ost.piirmaar) {
      row.style.display = "none";
    } else {
      row.style.display = "table-row";
    }
  });
}
