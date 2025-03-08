document.addEventListener("DOMContentLoaded", function () {
  document.body.addEventListener("click", function (event) {});

  initializeTimeline();

  const timelineContainer = document.getElementById("timeline-Container");
  const toggleTimelineButton = document.getElementById("toggleTimelineButton");

  if (timelineContainer) {
    timelineContainer.classList.add("hidden");
    timelineContainer.style.display = "none";
  }

  if (toggleTimelineButton) {
    toggleTimelineButton.innerHTML =
      '<i class="fas fa-calendar-alt mr-2"></i> Näita ajakava';

    toggleTimelineButton.addEventListener("click", function () {
      if (timelineContainer.classList.contains("hidden")) {
        timelineContainer.classList.remove("hidden");
        timelineContainer.style.display = "block";
        toggleTimelineButton.innerHTML =
          '<i class="fas fa-calendar-alt mr-2"></i> Peida ajakava';

        updateTimelineContent();
      } else {
        timelineContainer.classList.add("hidden");
        timelineContainer.style.display = "none";
        toggleTimelineButton.innerHTML =
          '<i class="fas fa-calendar-alt mr-2"></i> Näita ajakava';
      }
    });
  }

  const navigationButtons = document.querySelectorAll(
    "#dropdownButton, #showForm, #showSavedSearches, #settingsButton, #adminTab",
  );

  navigationButtons.forEach((button) => {
    button.addEventListener("click", function () {
      if (
        timelineContainer &&
        !timelineContainer.classList.contains("hidden")
      ) {
        timelineContainer.classList.add("hidden");
        timelineContainer.style.display = "none";

        if (toggleTimelineButton) {
          toggleTimelineButton.innerHTML =
            '<i class="fas fa-calendar-alt mr-2"></i> Näita ajakava';
        }
      }
    });
  });

  const sidebarLinks = document.querySelectorAll(
    "#sidebarContainer a, #sidebarContainer button",
  );

  sidebarLinks.forEach((link) => {
    link.addEventListener("click", function () {
      if (
        timelineContainer &&
        !timelineContainer.classList.contains("hidden")
      ) {
        timelineContainer.classList.add("hidden");
        timelineContainer.style.display = "none";

        if (toggleTimelineButton) {
          toggleTimelineButton.innerHTML =
            '<i class="fas fa-calendar-alt mr-2"></i> Näita ajakava';
        }
      }
    });
  });

  window.hideTimeline = function () {
    if (timelineContainer && !timelineContainer.classList.contains("hidden")) {
      timelineContainer.classList.add("hidden");
      timelineContainer.style.display = "none";

      if (toggleTimelineButton) {
        toggleTimelineButton.innerHTML =
          '<i class="fas fa-calendar-alt mr-2"></i> Näita ajakava';
      }
    }
  };

  const originalCloseAllTabs = window.closeAllTabs;
  if (typeof originalCloseAllTabs === "function") {
    window.closeAllTabs = function () {
      originalCloseAllTabs();
      window.hideTimeline();
    };
  }

  function updateTimelineContent() {
    const name = document.getElementById("name").value || "";
    const cost = document.getElementById("cost").value || "";
    const contractDateInput = document.getElementById("contractSigningDate");
    const contractDate = contractDateInput
      ? contractDateInput.value.trim()
      : null;

    console.log("Contract Date Retrieved:", contractDate);

    if (!contractDate || isNaN(new Date(contractDate).getTime())) {
      console.warn("⚠ Contract signing date is missing or invalid.");
      return;
    }

    const formattedContractDate = formatDate(contractDate);
    if (formattedContractDate === "Määramata") {
      console.error("❌ Invalid contract signing date after formatting.");
      return;
    }

    document.getElementById("timeline-procurement-name").textContent = name;
    document.getElementById("timeline-procurement-cost").textContent = cost;
    document.getElementById("timeline-contract-date").textContent =
      formattedContractDate;

    const procedureType = document.getElementById("procedureType").value;
    const procurement = new PublicProcurement(
      name,
      cost,
      procedureType,
      contractDate,
    );
    const requestSubmissionDate = procurement.calculateRequestSubmissionDate();

    const today = new Date();
    const submissionDateObj = new Date(requestSubmissionDate);
    const daysToStart = Math.ceil(
      (submissionDateObj - today) / (1000 * 60 * 60 * 24),
    );

    const daysToStartElement = document.getElementById("day-to-start");
    if (daysToStartElement) {
      daysToStartElement.textContent = daysToStart;

      if (daysToStart < 0) {
        daysToStartElement.classList.add("text-red-600");
        daysToStartElement.parentElement.innerHTML = `<span class="text-lg">Alustamisega oled hiljaks jäänud <span id="day-to-start" 
                  class="font-bold text-xl text-red-600">${Math.abs(daysToStart)}</span> 
                  päeva</span>`;
      } else {
        daysToStartElement.classList.remove("text-red-600");
        daysToStartElement.parentElement.innerHTML = `<span class="text-lg">Alustamiseni on jäänud <span id="day-to-start" 
                  class="font-bold text-xl">${daysToStart}</span> 
                  päeva</span>`;
      }
    }

    if (contractDate && !isNaN(new Date(contractDate).getTime())) {
      updateTimelineSteps(requestSubmissionDate, contractDate);
    } else {
      console.error(
        "❌ Contract signing date is invalid. Timeline update skipped.",
      );
    }
  }

  function updateTimelineSteps(requestSubmissionDate, contractDate) {
    const startDate = new Date(requestSubmissionDate);
    const endDate = new Date(contractDate);

    const procedureType = document.getElementById("procedureType").value;
    const procedure = procedureData[procedureType] || {};

    const timelineSteps = document.getElementById("timeline-steps");
    if (!timelineSteps) return;

    timelineSteps.innerHTML = "";

    const today = new Date();

    const procurement = new PublicProcurement(
      document.getElementById("name").value,
      document.getElementById("cost").value,
      procedureType,
      contractDate,
    );

    const procedureDetails = procurement.procedureDetails;

    let currentDate = new Date(startDate);

    procedureDetails.forEach((detail, index) => {
      const daysMatch = detail.days.match(/(\d+)/);
      const days = daysMatch ? parseInt(daysMatch[1]) : 0;

      const stepEndDate = new Date(currentDate);
      stepEndDate.setDate(stepEndDate.getDate() + days);

      let status = "future";
      if (today > stepEndDate) {
        status = "completed";
      } else if (today >= currentDate && today <= stepEndDate) {
        status = "current";
      }

      const formattedStartDate = formatDate(currentDate);
      const formattedEndDate = formatDate(stepEndDate);
      const dateDisplay = `${formattedStartDate} - ${formattedEndDate}`;

      const stepElement = document.createElement("li");
      stepElement.className = `${status}`;

      let accentColor;
      switch (status) {
        case "completed":
          accentColor = "#4CAD73";
          break;
        case "current":
          accentColor = "#1B5F8C";
          break;
        case "overdue":
          accentColor = "#E24A68";
          break;
        default:
          accentColor = "#41516C";
      }

      stepElement.innerHTML = `
        <div class="date">${dateDisplay}</div>
        <div class="title">${detail.step}</div>
        <div class="descr">${detail.days}</div>
      `;

      timelineSteps.appendChild(stepElement);

      currentDate = new Date(stepEndDate);
    });

    const contractStatus = today >= endDate ? "completed" : "future";
    const stepElement = document.createElement("li");
    stepElement.className = contractStatus;
    stepElement.innerHTML = `
      <div class="date">${formatDate(endDate)}</div>
      <div class="title">Lepingu sõlmimine</div>
      <div class="descr">Hankelepingu allkirjastamine</div>
    `;

    timelineSteps.appendChild(stepElement);
  }

  gsap.from(".timeline-step", {
    opacity: 0,
    y: 50,
    duration: 0.8,
    stagger: 0.2,
    ease: "power2.out",
  });

  function calculateProcedureDuration(procedureType) {
    return 60;
  }

  function initializeTimeline() {
    console.log("Initializing timeline");

    const resultCards = document.querySelectorAll(".result-card");
    if (!resultCards.length) {
      console.warn("No result cards found, skipping timeline update");
      return;
    }

    let updatedSteps = [];
    resultCards.forEach((card, index) => {
      const stepName = card.querySelector(".step-name")?.textContent.trim();
      const daysElement = card.querySelector(`#days-${index}`);
      const days = parseInt(
        daysElement?.innerText.match(/\d+/)?.[0] || "0",
        10,
      );
      if (stepName && daysElement) {
        updatedSteps.push({ step: stepName, days: days });
      }
    });

    if (!updatedSteps.length) {
      console.warn("No steps extracted from result cards");
      return;
    }

    console.log("Updated Steps:", updatedSteps);
    updateTimelineSteps(updatedSteps);

    try {
      const resultContainer = document.getElementById("resultContainer");
      const isResultVisible =
        resultContainer && !resultContainer.classList.contains("hidden");

      console.log("Result container visible:", isResultVisible);

      let procurementData = {};

      if (isResultVisible) {
        const nameElement = document.getElementById("name");
        const costElement = document.getElementById("cost");
        const procedureTypeElement = document.getElementById("procedureType");
        const contractDateElement = document.getElementById(
          "contractSigningDate",
        );
        const requestSubmissionDateElement = document.getElementById(
          "requestSubmissionDate",
        );

        if (
          nameElement &&
          costElement &&
          procedureTypeElement &&
          contractDateElement
        ) {
          procurementData = {
            name: nameElement.value,
            cost: parseFloat(costElement.value),
            procedureType: procedureTypeElement.value,
            contractDate: contractDateElement.value,
            requestSubmissionDate: requestSubmissionDateElement
              ? requestSubmissionDateElement.innerText
              : null,
          };

          console.log("Using form data for timeline:", procurementData);
        } else {
          console.warn("Could not find all form elements");
        }
      }

      const nameElement = document.getElementById("timeline-procurement-name");
      const dateElement = document.getElementById("timeline-contract-date");
      const daysElement = document.getElementById("day-to-start");

      if (!nameElement || !dateElement || !daysElement) {
        console.error("Timeline header elements not found");
        return;
      }

      if (procurementData.name) {
        nameElement.textContent = procurementData.name;
      }

      let contractDate;

      if (procurementData.contractDate) {
        contractDate = new Date(procurementData.contractDate);
        if (!isNaN(contractDate.getTime())) {
          dateElement.textContent = contractDate.toLocaleDateString("et-EE");
        }
      } else {
        const displayedDate = dateElement.textContent;
        const dateParts = displayedDate.split(".");
        if (dateParts.length === 3) {
          const contractDateStr = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
          contractDate = new Date(contractDateStr);
        }
      }

      if (!contractDate || isNaN(contractDate.getTime())) {
        console.error("Invalid contract date");
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      contractDate.setHours(0, 0, 0, 0);
      const daysToStart = Math.ceil(
        (contractDate - today) / (1000 * 60 * 60 * 24),
      );
      daysElement.textContent = daysToStart;

      const timelineStepsContainer = document.getElementById("timeline-steps");
      if (!timelineStepsContainer) {
        console.error("Timeline steps container not found");
        return;
      }

      generateTimelineSteps(timelineStepsContainer, contractDate, today);

      const exportExcelBtn = document.getElementById("exportExcel");
      const exportPDFBtn = document.getElementById("exportPDF");

      if (exportExcelBtn) {
        exportExcelBtn.onclick = function () {
          console.log("Export to Excel clicked");
          alert("Excel export functionality would go here");
        };
      }

      if (exportPDFBtn) {
        exportPDFBtn.onclick = function () {
          console.log("Export to PDF clicked");
          const timelineContainer = document.querySelector(
            ".timeline-container",
          );
          if (!timelineContainer) {
            alert("Timeline container not found");
            return;
          }

          try {
            const { jsPDF } = window.jspdf;
            if (!jsPDF) {
              alert("PDF library not loaded. Please try again later.");
              return;
            }

            const doc = new jsPDF("p", "mm", "a4");

            const procurementName =
              document.getElementById("name")?.value ||
              document.getElementById("timeline-procurement-name")
                ?.textContent ||
              "Riigihanke";
            doc.setFontSize(20);
            doc.setTextColor(0, 0, 255);
            doc.text(`${procurementName} Ajakava`, 105, 20, {
              align: "center",
            });

            doc.setFontSize(12);
            doc.setTextColor(100, 100, 100);
            const today = new Date();
            doc.text(
              `Genereeritud: ${today.toLocaleDateString("et-EE")}`,
              105,
              30,
              { align: "center" },
            );

            const timelineSteps = document.getElementById("timeline-steps");
            let yPos = 50;

            if (timelineSteps && timelineSteps.children.length > 0) {
              Array.from(timelineSteps.children).forEach((step, index) => {
                const title =
                  step.querySelector(".title")?.textContent ||
                  step.querySelector("h3")?.textContent ||
                  `Samm ${index + 1}`;
                const date =
                  step.querySelector(".date")?.textContent ||
                  step.querySelector("time")?.textContent ||
                  "";
                const description =
                  step.querySelector(".descr")?.textContent ||
                  step.querySelector("p")?.textContent ||
                  "";

                doc.setFontSize(14);
                doc.setTextColor(0, 0, 150);
                doc.text(`${index + 1}. ${title}`, 20, yPos);
                yPos += 8;

                doc.setFontSize(11);
                doc.setTextColor(80, 80, 80);
                doc.text(`${date}`, 20, yPos);
                yPos += 6;

                doc.setFontSize(10);
                doc.text(`${description}`, 20, yPos);
                yPos += 10;

                doc.setDrawColor(200, 200, 200);
                doc.line(20, yPos, 190, yPos);
                yPos += 15;

                if (yPos > 270) {
                  doc.addPage();
                  yPos = 20;
                }
              });
            } else {
              doc.setFontSize(14);
              doc.setTextColor(100, 100, 100);
              doc.text("Ajakava andmed puuduvad", 105, yPos, {
                align: "center",
              });
            }

            doc.setFontSize(10);
            doc.setTextColor(150, 150, 150);
            doc.text(
              "© 2025 Riigihanke Andmed. Kõik õigused kaitstud.",
              105,
              280,
              { align: "center" },
            );

            doc.save(`${procurementName.replace(/\s+/g, "_")}_ajakava.pdf`);
          } catch (error) {
            console.error("Error generating PDF:", error);
            alert("PDF genereerimine ebaõnnestus. Proovige hiljem uuesti.");
          }
        };
      }

      console.log("Timeline initialized successfully");
    } catch (error) {
      console.error("Error initializing timeline:", error);
    }
  }

  function generateTimelineSteps(container, contractDate, today) {
    container.innerHTML = "";

    const steps = [];

    const prepStartDate = new Date(contractDate);
    prepStartDate.setDate(prepStartDate.getDate() - 90);
    const prepEndDate = new Date(prepStartDate);
    prepEndDate.setDate(prepEndDate.getDate() + 30);

    steps.push({
      title: "Hanke ettevalmistamine",
      description: "Hankedokumentide koostamine ja avaldamine",
      startDate: prepStartDate,
      endDate: prepEndDate,
    });

    const submissionStartDate = new Date(contractDate);
    submissionStartDate.setDate(submissionStartDate.getDate() - 60);
    const submissionEndDate = new Date(submissionStartDate);
    submissionEndDate.setDate(submissionEndDate.getDate() + 30);

    steps.push({
      title: "Pakkumuste esitamine",
      description: "Pakkujad esitavad oma pakkumused",
      startDate: submissionStartDate,
      endDate: submissionEndDate,
    });

    const evalStartDate = new Date(contractDate);
    evalStartDate.setDate(evalStartDate.getDate() - 30);
    const evalEndDate = new Date(evalStartDate);
    evalEndDate.setDate(evalEndDate.getDate() + 15);

    steps.push({
      title: "Pakkumuste hindamine",
      description: "Pakkumuste läbivaatamine ja hindamine",
      startDate: evalStartDate,
      endDate: evalEndDate,
    });

    steps.push({
      title: "Lepingu sõlmimine",
      description: "Hankelepingu allkirjastamine",
      startDate: contractDate,
      endDate: contractDate,
    });

    const executionStartDate = new Date(contractDate);
    executionStartDate.setDate(executionStartDate.getDate() + 1);
    const executionEndDate = new Date(executionStartDate);
    executionEndDate.setDate(executionEndDate.getDate() + 180);

    steps.push({
      title: "Lepingu täitmine",
      description: "Hankelepingu täitmine",
      startDate: executionStartDate,
      endDate: executionEndDate,
    });

    steps.forEach((step) => {
      let status = "future";
      if (today > step.endDate) {
        status = "completed";
      } else if (today >= step.startDate && today <= step.endDate) {
        status = "current";
      } else if (step.startDate < today) {
        status = "overdue";
      }

      const startDateStr = step.startDate.toLocaleDateString("et-EE");
      const endDateStr = step.endDate.toLocaleDateString("et-EE");
      const dateDisplay =
        startDateStr === endDateStr
          ? startDateStr
          : `${startDateStr} - ${endDateStr}`;

      const stepElement = document.createElement("li");
      stepElement.className = `${status}`;

      let accentColor;
      switch (status) {
        case "completed":
          accentColor = "#4CAD73";
          break;
        case "current":
          accentColor = "#1B5F8C";
          break;
        case "overdue":
          accentColor = "#E24A68";
          break;
        default:
          accentColor = "#41516C";
      }

      stepElement.innerHTML = `
      <div class="date">${dateDisplay}</div>
      <div class="title">${step.title}</div>
      <div class="descr">${step.description}</div>
    `;

      container.appendChild(stepElement);
    });
  }

  function parseEstonianDate(dateStr) {
    if (!dateStr || typeof dateStr !== "string") {
      console.warn("Invalid date input:", dateStr);
      return null;
    }

    const statusIndicators = ["Lõpetatud", "Käimas", "Hilinenud", "Tulevikus"];
    if (statusIndicators.includes(dateStr.trim())) {
      console.log("Skipping status indicator:", dateStr);
      return null;
    }

    const parts = dateStr.trim().split(".");
    if (parts.length < 3) {
      console.warn("Invalid date format:", dateStr);
      return null;
    }

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    let year = parseInt(parts[2], 10);

    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      console.warn("Invalid date components:", dateStr);
      return null;
    }

    if (year < 100) {
      year = 2000 + year;
    }

    if (
      day < 1 ||
      day > 31 ||
      month < 1 ||
      month > 12 ||
      year < 2000 ||
      year > 2100
    ) {
      console.warn("Date components out of range:", dateStr);
      return null;
    }

    const formattedMonth = month.toString().padStart(2, "0");
    const formattedDay = day.toString().padStart(2, "0");

    const date = new Date(`${year}-${formattedMonth}-${formattedDay}`);
    if (isNaN(date.getTime())) {
      console.warn("Invalid date result:", dateStr);
      return null;
    }

    return date;
  }
});
