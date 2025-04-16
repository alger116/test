document.addEventListener('DOMContentLoaded', event => {
  console.log('DOM fully loaded and parsed');
  const hankeplaanButton = document.getElementById('hankeplaan');
  if (hankeplaanButton) {
    console.log('Hankeplaan button found');
    hankeplaanButton.addEventListener('click', () => {
      console.log('Hankeplaan button clicked');
      alert('Hankeplaan button clicked!');
      // Comment out the generateExcelFile function for now to simplify
      // generateExcelFile();
    });
  } else {
    console.error('Hankeplaan button not found');
  }
});

// Comment out the generateExcelFile function for now to simplify
// const generateExcelFile = () => {
//     console.log('Generating Excel file');
//     const tableBody = document.getElementById('savedSearchesTableBody');
//     if (!tableBody) {
//         alert("No saved searches to export.");
//         return;
//     }

//     let csvContent = "data:text/csv;charset=utf-8,";
//     csvContent += "Nimi,Maksumus,Menetluse Tüüp,Lepingu Allkirjastamise Kuupäev,Menetlusele kuluv aeg\n";

//     const rows = tableBody.querySelectorAll('tr');
//     rows.forEach(row => {
//         const columns = row.querySelectorAll('td');
//         const rowData = Array.from(columns).map(column => column.innerText).join(",");
//         csvContent += rowData + "\n";
//     });

//     const encodedUri = encodeURI(csvContent);
//     const link = document.createElement("a");
//     link.setAttribute("href", encodedUri);
//     link.setAttribute("download", "hankeplaan.csv");
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
// };
