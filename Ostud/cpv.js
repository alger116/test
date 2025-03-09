document.addEventListener("DOMContentLoaded", () => {
  laeCPVKoodid();
});

const cpvKoodid = [
  {
    cpv: "79952000-2",
    kirjeldus: "Ürituste korraldamise teenused",
    piirmaar: 299999.99,
  },
  {
    cpv: "50100000-6",
    kirjeldus:
      "Sõidukite ja nendega seotud vahendite remondi- ja hooldusteenused",
    piirmaar: 29999.99,
  },
];

function laeCPVKoodid() {
  const tbody = document.getElementById("cpv-body");
  tbody.innerHTML = "";

  cpvKoodid.forEach((k) => {
    tbody.innerHTML += `
            <tr>
                <td class="p-4 border">${k.cpv}</td>
                <td class="p-4 border">${k.kirjeldus}</td>
                <td class="p-4 border">${k.piirmaar}</td>
            </tr>
        `;
  });
}
