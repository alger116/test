document.addEventListener("DOMContentLoaded", () => {
  laeUlevaade();
});

const ostud = [
  { kirjeldus: "Ürituste korraldamine", maksumus: 1090, piirmaar: 299999.99 },
  { kirjeldus: "Maskottide hankimine", maksumus: 12500, piirmaar: 29999.99 },
];

function laeUlevaade() {
  const kokkuOste = ostud.length;
  const kogumaksumus = ostud.reduce((sum, ost) => sum + ost.maksumus, 0);
  const ulePiirmaara = ostud.filter(
    (ost) => ost.maksumus > ost.piirmaar,
  ).length;

  document.getElementById("kokkuOste").textContent = kokkuOste;
  document.getElementById("kogumaksumus").textContent = kogumaksumus;
  document.getElementById("ulePiirmaara").textContent = ulePiirmaara;

  const tbody = document.getElementById("ulevaade-body");
  tbody.innerHTML = "";

  ostud.forEach((ost) => {
    tbody.innerHTML += `
            <tr>
                <td class="p-4 border">${ost.kirjeldus}</td>
                <td class="p-4 border">${ost.maksumus}</td>
            </tr>
        `;
  });
}
