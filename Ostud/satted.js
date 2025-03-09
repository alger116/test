document.addEventListener("DOMContentLoaded", () => {
  laeIsikud();
});

let isikud = ["testuser1", "testuser2", "testuser3", "testuser4"];

function laeIsikud() {
  const tbody = document.getElementById("isikud-body");
  tbody.innerHTML = "";

  isikud.forEach((nimi, index) => {
    tbody.innerHTML += `
            <tr>
                <td class="p-4 border">${nimi}</td>
                <td class="p-4 border">
                    <button class="px-2 py-1 bg-red-500 text-white rounded" onclick="kustutaIsik(${index})">Kustuta</button>
                </td>
            </tr>
        `;
  });
}

function lisaIsik() {
  const nimi = prompt("Sisesta uue vastutava isiku nimi:");
  if (nimi) {
    isikud.push(nimi);
    laeIsikud();
  }
}

function kustutaIsik(index) {
  if (confirm("Kas oled kindel, et soovid selle isiku kustutada?")) {
    isikud.splice(index, 1);
    laeIsikud();
  }
}
