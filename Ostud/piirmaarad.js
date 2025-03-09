document.addEventListener("DOMContentLoaded", () => {
  laePiirmaarad();
});

const piirmaarad = [
  {
    cpv: "79952000-2",
    kirjeldus: "Ürituste korraldamine",
    piirmaar: 299999.99,
    kasutatud: 1090,
  },
  {
    cpv: "ASJAD",
    kirjeldus: "Asjade hankimine",
    piirmaar: 29999.99,
    kasutatud: 12500,
  },
];

function laePiirmaarad() {
  const tbody = document.getElementById("piirmaarad-body");
  tbody.innerHTML = "";

  piirmaarad.forEach((p) => {
    const jaak = (p.piirmaar - p.kasutatud).toFixed(2);
    const staatus = jaak < p.piirmaar * 0.1 ? "text-red-500" : "text-green-500";

    tbody.innerHTML += `
            <tr>
                <td class="p-4 border">${p.cpv}</td>
                <td class="p-4 border">${p.kirjeldus}</td>
                <td class="p-4 border">${p.piirmaar.toFixed(2)} €</td>
                <td class="p-4 border">${p.kasutatud.toFixed(2)} €</td>
                <td class="p-4 border ${staatus}">${jaak} €</td>
                <td class="p-4 border ${staatus}">${jaak < p.piirmaar * 0.1 ? "Hoiatus" : "OK"}</td>
            </tr>
        `;
  });
}
