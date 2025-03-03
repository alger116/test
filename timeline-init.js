// Initialize timeline when the DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  console.log("Timeline initialization script loaded");

  // Listen for form submission to update the timeline
  const procurementForm = document.getElementById("procurementForm");
  if (procurementForm) {
    console.log("Found procurement form, adding submit listener");
    procurementForm.addEventListener("submit", function (event) {
      // Don't add another event listener, just update the timeline after form submission
      setTimeout(initializeTimeline, 500); // Give time for the form handler to update the DOM
    });
  } else {
    console.warn("Procurement form not found");
  }

  // Initialize timeline with any existing data
  initializeTimeline();
});

// Main function to initialize the timeline
function initializeTimeline() {
  console.log("Initializing timeline");

  try {
    // Get data from the result container if it exists
    const resultContainer = document.getElementById("resultContainer");
    const isResultVisible =
      resultContainer && !resultContainer.classList.contains("hidden");

    console.log("Result container visible:", isResultVisible);

    // Get procurement data from the form or result
    let procurementData = {};

    if (isResultVisible) {
      // Get data from the result container
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

    // Update the timeline header
    const nameElement = document.getElementById("timeline-procurement-name");
    const dateElement = document.getElementById("timeline-contract-date");
    const daysElement = document.getElementById("days-to-start");

    if (!nameElement || !dateElement || !daysElement) {
      console.error("Timeline header elements not found");
      return;
    }

    // Use form data if available, otherwise use existing data
    if (procurementData.name) {
      nameElement.textContent = procurementData.name;
    }

    let contractDate;

    if (procurementData.contractDate) {
      // Parse the contract date from the form (YYYY-MM-DD) to display format (DD.MM.YYYY)
      contractDate = new Date(procurementData.contractDate);
      if (!isNaN(contractDate.getTime())) {
        dateElement.textContent = contractDate.toLocaleDateString("et-EE");
      }
    } else {
      // Parse the contract date from the displayed format (DD.MM.YYYY) to Date object
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

    // Calculate days to start
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    contractDate.setHours(0, 0, 0, 0);
    const daysToStart = Math.ceil(
      (contractDate - today) / (1000 * 60 * 60 * 24),
    );
    daysElement.textContent = daysToStart;

    // Get the timeline steps container
    const timelineStepsContainer = document.getElementById("timeline-steps");
    if (!timelineStepsContainer) {
      console.error("Timeline steps container not found");
      return;
    }

    // Generate new timeline steps based on the contract date
    generateTimelineSteps(timelineStepsContainer, contractDate, today);

    // Set up export buttons
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
        alert("PDF export functionality would go here");
      };
    }

    console.log("Timeline initialized successfully");
  } catch (error) {
    console.error("Error initializing timeline:", error);
  }
}

// Function to generate timeline steps
function generateTimelineSteps(container, contractDate, today) {
  // Clear existing steps
  container.innerHTML = "";

  // Define steps based on contract date
  const steps = [];

  // Step 1: Preparation (90 days before contract)
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

  // Step 2: Submission (60 days before contract)
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

  // Step 3: Evaluation (30 days before contract)
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

  // Step 4: Contract signing
  steps.push({
    title: "Lepingu sõlmimine",
    description: "Hankelepingu allkirjastamine",
    startDate: contractDate,
    endDate: contractDate,
  });

  // Step 5: Contract execution (starts day after signing, lasts 180 days)
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

  // Render steps
  steps.forEach((step) => {
    // Determine status based on current date
    let status = "future";
    if (today > step.endDate) {
      status = "completed";
    } else if (today >= step.startDate && today <= step.endDate) {
      status = "current";
    } else if (step.startDate < today) {
      status = "overdue";
    }

    // Format dates for display
    const startDateStr = step.startDate.toLocaleDateString("et-EE");
    const endDateStr = step.endDate.toLocaleDateString("et-EE");
    const dateDisplay =
      startDateStr === endDateStr
        ? startDateStr
        : `${startDateStr} - ${endDateStr}`;

    // Create step element
    const stepElement = document.createElement("li");
    stepElement.className = `timeline-step ${status} mb-10 ml-6`;
    stepElement.innerHTML = `
      <div class="absolute w-3 h-3 rounded-full mt-1.5 -left-1.5 border border-white bg-${status === "completed" ? "green" : status === "current" ? "blue" : status === "overdue" ? "red" : "gray"}-500"></div>
      <time class="mb-1 text-sm font-normal leading-none text-gray-500">
        ${dateDisplay}
      </time>
      <h3 class="text-lg font-semibold text-gray-900">${step.title}</h3>
      <p class="mb-4 text-base font-normal text-gray-600">${step.description}</p>
      <div class="text-sm text-gray-500">
        ${
          status === "completed"
            ? "Lõpetatud"
            : status === "current"
              ? "Käimas"
              : status === "overdue"
                ? "Hilinenud"
                : "Tulevikus"
        }
      </div>
    `;

    container.appendChild(stepElement);
  });
}

// Helper function to parse Estonian date format (DD.MM.YYYY)
function parseEstonianDate(dateStr) {
  if (!dateStr || typeof dateStr !== "string") {
    console.warn("Invalid date input:", dateStr);
    return null;
  }

  // Skip status indicators or non-date text
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

  // Validate day, month, year
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  let year = parseInt(parts[2], 10);

  if (isNaN(day) || isNaN(month) || isNaN(year)) {
    console.warn("Invalid date components:", dateStr);
    return null;
  }

  // Handle case where year might be abbreviated
  if (year < 100) {
    year = 2000 + year; // Assume 21st century for abbreviated years
  }

  // Validate ranges
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

  // Format month and day with leading zeros if needed
  const formattedMonth = month.toString().padStart(2, "0");
  const formattedDay = day.toString().padStart(2, "0");

  // Create date object and validate
  const date = new Date(`${year}-${formattedMonth}-${formattedDay}`);
  if (isNaN(date.getTime())) {
    console.warn("Invalid date result:", dateStr);
    return null;
  }

  return date;
}
