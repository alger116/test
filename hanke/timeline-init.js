document.addEventListener('DOMContentLoaded', function () {
  document.body.addEventListener('click', function (event) {});

  // Make sure PDF export is available globally
  if (typeof window.exportTimelineToPDF !== 'function') {
    window.exportTimelineToPDF = function () {
      // This function will be defined in timeline.html, but we provide a fallback here
      if (typeof jspdf === 'undefined') {
        console.error('jsPDF library not loaded');
        alert('PDF library not loaded. Please try again later.');

        // Try to load jsPDF
        const script = document.createElement('script');
        script.src = '../assets/js/jspdf.umd.min.js';
        script.async = true;
        document.head.appendChild(script);
        return;
      }

      console.log('Exporting PDF from timeline-init.js fallback');
      // Basic implementation if timeline.html's implementation is not available
      try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.text('Timeline Export', 10, 10);
        doc.save('timeline.pdf');
      } catch (e) {
        console.error('Error exporting PDF:', e);
        alert('Failed to export PDF. Error: ' + e.message);
      }
    };
  }

  initializeTimeline();

  const timelineContainer = document.getElementById('timeline-Container');
  const toggleTimelineButton = document.getElementById('toggleTimelineButton');

  if (timelineContainer) {
    timelineContainer.classList.add('hidden');
    timelineContainer.style.display = 'none';
  }

  if (toggleTimelineButton) {
    toggleTimelineButton.innerHTML = '<i class="fas fa-calendar-alt mr-2"></i> Näita ajakava';

    toggleTimelineButton.addEventListener('click', function () {
      if (timelineContainer.classList.contains('hidden')) {
        timelineContainer.classList.remove('hidden');
        timelineContainer.style.display = 'block';
        toggleTimelineButton.innerHTML = '<i class="fas fa-calendar-alt mr-2"></i> Peida ajakava';

        updateTimelineContent();
      } else {
        timelineContainer.classList.add('hidden');
        timelineContainer.style.display = 'none';
        toggleTimelineButton.innerHTML = '<i class="fas fa-calendar-alt mr-2"></i> Näita ajakava';
      }
    });
  }

  const navigationButtons = document.querySelectorAll(
    '#dropdownButton, #showForm, #showSavedSearches, #settingsButton, #adminTab'
  );

  navigationButtons.forEach(button => {
    button.addEventListener('click', function () {
      if (timelineContainer && !timelineContainer.classList.contains('hidden')) {
        timelineContainer.classList.add('hidden');
        timelineContainer.style.display = 'none';

        if (toggleTimelineButton) {
          toggleTimelineButton.innerHTML = '<i class="fas fa-calendar-alt mr-2"></i> Näita ajakava';
        }
      }
    });
  });

  const sidebarLinks = document.querySelectorAll('#sidebarContainer a, #sidebarContainer button');

  sidebarLinks.forEach(link => {
    link.addEventListener('click', function () {
      if (timelineContainer && !timelineContainer.classList.contains('hidden')) {
        timelineContainer.classList.add('hidden');
        timelineContainer.style.display = 'none';

        if (toggleTimelineButton) {
          toggleTimelineButton.innerHTML = '<i class="fas fa-calendar-alt mr-2"></i> Näita ajakava';
        }
      }
    });
  });

  window.hideTimeline = function () {
    if (timelineContainer && !timelineContainer.classList.contains('hidden')) {
      timelineContainer.classList.add('hidden');
      timelineContainer.style.display = 'none';

      if (toggleTimelineButton) {
        toggleTimelineButton.innerHTML = '<i class="fas fa-calendar-alt mr-2"></i> Näita ajakava';
      }
    }
  };

  const originalCloseAllTabs = window.closeAllTabs;
  if (typeof originalCloseAllTabs === 'function') {
    window.closeAllTabs = function () {
      originalCloseAllTabs();
      window.hideTimeline();
    };
  }

  function updateTimelineContent() {
    const name = document.getElementById('name').value || '';
    const cost = document.getElementById('cost').value || '';
    const contractDateInput = document.getElementById('contractSigningDate');
    const contractDate = contractDateInput ? contractDateInput.value.trim() : null;

    console.log('Contract Date Retrieved:', contractDate);

    if (!contractDate || isNaN(new Date(contractDate).getTime())) {
      console.warn('⚠ Contract signing date is missing or invalid.');
      return;
    }

    const formattedContractDate = formatDate(contractDate);
    if (formattedContractDate === 'Määramata') {
      console.error('❌ Invalid contract signing date after formatting.');
      return;
    }

    document.getElementById('timeline-procurement-name').textContent = name;
    document.getElementById('timeline-procurement-cost').textContent = cost;
    document.getElementById('timeline-contract-date').textContent = formattedContractDate;

    const procedureType = document.getElementById('procedureType').value;
    const procurement = new PublicProcurement(name, cost, procedureType, contractDate);
    const requestSubmissionDate = procurement.calculateRequestSubmissionDate();

    const today = new Date();
    const submissionDateObj = new Date(requestSubmissionDate);
    const daysToStart = Math.ceil((submissionDateObj - today) / (1000 * 60 * 60 * 24));

    const daysToStartElement = document.getElementById('day-to-start');
    if (daysToStartElement) {
      daysToStartElement.textContent = daysToStart;

      if (daysToStart < 0) {
        daysToStartElement.classList.add('text-red-600');
        daysToStartElement.parentElement.innerHTML = `<span class="text-lg">Alustamisega oled hiljaks jäänud <span id="day-to-start" 
                  class="font-bold text-xl text-red-600">${Math.abs(daysToStart)}</span> 
                  päeva</span>`;
      } else {
        daysToStartElement.classList.remove('text-red-600');
        daysToStartElement.parentElement.innerHTML = `<span class="text-lg">Alustamiseni on jäänud <span id="day-to-start" 
                  class="font-bold text-xl">${daysToStart}</span> 
                  päeva</span>`;
      }
    }

    if (contractDate && !isNaN(new Date(contractDate).getTime())) {
      updateTimelineSteps(requestSubmissionDate, contractDate);
    } else {
      console.error('❌ Contract signing date is invalid. Timeline update skipped.');
    }
  }

  function updateTimelineSteps(requestSubmissionDate, contractDate) {
    const startDate = new Date(requestSubmissionDate);
    const endDate = new Date(contractDate);

    const procedureType = document.getElementById('procedureType').value;
    const procedure = procedureData[procedureType] || {};

    const timelineSteps = document.getElementById('timeline-steps');
    if (!timelineSteps) return;

    timelineSteps.innerHTML = '';

    const today = new Date();

    const procurement = new PublicProcurement(
      document.getElementById('name').value,
      document.getElementById('cost').value,
      procedureType,
      contractDate
    );

    const procedureDetails = procurement.procedureDetails;

    let currentDate = new Date(startDate);

    procedureDetails.forEach((detail, index) => {
      const daysMatch = detail.days.match(/(\d+)/);
      const days = daysMatch ? parseInt(daysMatch[1]) : 0;

      const stepEndDate = new Date(currentDate);
      stepEndDate.setDate(stepEndDate.getDate() + days);

      let status = 'future';
      if (today > stepEndDate) {
        status = 'completed';
      } else if (today >= currentDate && today <= stepEndDate) {
        status = 'current';
      }

      const formattedStartDate = formatDate(currentDate);
      const formattedEndDate = formatDate(stepEndDate);
      const dateDisplay = `${formattedStartDate} - ${formattedEndDate}`;

      const stepElement = document.createElement('li');
      stepElement.className = `${status}`;

      let accentColor;
      switch (status) {
        case 'completed':
          accentColor = '#4CAD73';
          break;
        case 'current':
          accentColor = '#1B5F8C';
          break;
        case 'overdue':
          accentColor = '#E24A68';
          break;
        default:
          accentColor = '#41516C';
      }

      stepElement.innerHTML = `
        <div class="date">${dateDisplay}</div>
        <div class="title">${detail.step}</div>
        <div class="descr">${detail.days}</div>
      `;

      timelineSteps.appendChild(stepElement);

      currentDate = new Date(stepEndDate);
    });

    const contractStatus = today >= endDate ? 'completed' : 'future';
    const stepElement = document.createElement('li');
    stepElement.className = contractStatus;
    stepElement.innerHTML = `
      <div class="date">${formatDate(endDate)}</div>
      <div class="title">Eeldatav</div>
      <div class="descr">Hankelepingu allkirjastamine</div>
    `;

    timelineSteps.appendChild(stepElement);
  }

  const timelineSteps = document.querySelectorAll('.timeline-step');
  if (timelineSteps.length > 0) {
    gsap.to(timelineSteps, {
      opacity: 0,
      y: 50,
      duration: 0.8,
      stagger: 0.2,
      ease: 'power2.out',
    });
  } else
    function calculateProcedureDuration(procedureType) {
      return 60;
    }

  window.refreshSidebarTimelineCards = function () {
    const contractDate = document.getElementById('contractSigningDate')?.value;
    const procedureDetails = [];

    document.querySelectorAll('.result-card .step-row, .result-card li').forEach(row => {
      const stepName =
        row.querySelector('.step-name')?.textContent || row.textContent.split(':')[0].trim();

      const daysEl = row.querySelector('[id^="days-"]');
      if (daysEl) {
        procedureDetails.push({
          step: stepName,
          days: daysEl.textContent,
        });
      }
    });

    if (typeof calculateTimeline !== 'function') return;

    const timeline = calculateTimeline(procedureDetails, contractDate);
    const timelineStepsContainer = document.querySelector('#timeline-Container #timeline-steps');
    if (!timelineStepsContainer) return;

    timelineStepsContainer.innerHTML = '';

    timeline.steps.forEach((step, i) => {
      const stepElement = document.createElement('li');
      stepElement.className = `timeline-step ${step.status}`;

      stepElement.innerHTML = `
      <div class="date">${step.startDate} - ${step.endDate}</div>
      <div class="title">${step.step}</div>
      <div class="descr">${step.duration} päeva</div>
    `;
      timelineStepsContainer.appendChild(stepElement);
    });

    // Uuenda alustamispäevade kuvamist
    const daysElement = document.getElementById('days-to-start');
    if (daysElement) daysElement.textContent = timeline.daysToStart;
  };

  // Function to initialize and calculate the timeline
  function initializeTimeline() {
    const timelineStepsContainer = document.getElementById('timeline-steps');
    if (!timelineStepsContainer) return;

    // Clear existing timeline steps
    timelineStepsContainer.innerHTML = '';

    // Get all current procedure details
    const procedureDetails = [];
    document.querySelectorAll('.result-card .step-row, .result-card li').forEach(row => {
      const stepName = row.querySelector('.step-name')
        ? row.querySelector('.step-name').textContent
        : row.textContent.split(':')[0].trim();
      const daysEl = row.querySelector('[id^="days-"]');
      if (daysEl) {
        const days = daysEl.textContent;
        procedureDetails.push({ step: stepName, days: days });
      }
    });

    // Calculate the new timeline based on the updated procedureDetails
    const today = new Date();
    let currentDate = today; // Start from today or adjust based on your logic

    procedureDetails.forEach((detail, index) => {
      const days = parseInt(detail.days.match(/\d+/)[0]);
      const stepEndDate = new Date(currentDate);
      stepEndDate.setDate(stepEndDate.getDate() + days);

      const stepElement = document.createElement('li');
      stepElement.className = 'timeline-step';

      stepElement.innerHTML = `
            <div class="date">${currentDate.toLocaleDateString()} - ${stepEndDate.toLocaleDateString()}</div>
            <div class="title">${detail.step}</div>
            <div class="descr">${days} päeva</div>
        `;

      timelineStepsContainer.appendChild(stepElement);
      currentDate = stepEndDate; // Move to the next step's start date
    });
  }

  // Function to toggle the timeline visibility and initialize it
  function toggleTimeline() {
    const timelineContainer = document.getElementById('timeline-Container');
    const toggleTimelineButton = document.getElementById('toggleTimelineButton');

    if (timelineContainer.classList.contains('hidden')) {
      timelineContainer.classList.remove('hidden');
      timelineContainer.style.display = 'block';
      toggleTimelineButton.innerHTML = '<i class="fas fa-calendar-alt mr-2"></i> Peida ajakava';

      // Initialize the timeline when the button is pressed
      initializeTimeline();
    } else {
      timelineContainer.classList.add('hidden');
      timelineContainer.style.display = 'none';
      toggleTimelineButton.innerHTML = '<i class="fas fa-calendar-alt mr-2"></i> Näita ajakava';
    }
  }

  // Setup event listener for the toggle button
  document.addEventListener('DOMContentLoaded', function () {
    const toggleTimelineButton = document.getElementById('toggleTimelineButton');
    if (toggleTimelineButton) {
      toggleTimelineButton.addEventListener('click', toggleTimeline);
    }
  });

  function generateTimelineSteps(container, contractDate, today) {
    container.innerHTML = '';

    const steps = [];

    const prepStartDate = new Date(contractDate);
    prepStartDate.setDate(prepStartDate.getDate() - 90);
    const prepEndDate = new Date(prepStartDate);
    prepEndDate.setDate(prepEndDate.getDate() + 30);

    steps.push({
      title: 'Hanke ettevalmistamine',
      description: 'Hankedokumentide koostamine ja avaldamine',
      startDate: prepStartDate,
      endDate: prepEndDate,
    });

    const submissionStartDate = new Date(contractDate);
    submissionStartDate.setDate(submissionStartDate.getDate() - 60);
    const submissionEndDate = new Date(submissionStartDate);
    submissionEndDate.setDate(submissionEndDate.getDate() + 30);

    steps.push({
      title: 'Pakkumuste esitamine',
      description: 'Pakkujad esitavad oma pakkumused',
      startDate: submissionStartDate,
      endDate: submissionEndDate,
    });

    const evalStartDate = new Date(contractDate);
    evalStartDate.setDate(evalStartDate.getDate() - 30);
    const evalEndDate = new Date(evalStartDate);
    evalEndDate.setDate(evalEndDate.getDate() + 15);

    steps.push({
      title: 'Pakkumuste hindamine',
      description: 'Pakkumuste läbivaatamine ja hindamine',
      startDate: evalStartDate,
      endDate: evalEndDate,
    });

    steps.push({
      title: 'Lepingu sõlmimine',
      description: 'Hankelepingu allkirjastamine',
      startDate: contractDate,
      endDate: contractDate,
    });

    const executionStartDate = new Date(contractDate);
    executionStartDate.setDate(executionStartDate.getDate() + 1);
    const executionEndDate = new Date(executionStartDate);
    executionEndDate.setDate(executionEndDate.getDate() + 180);

    steps.push({
      title: 'Lepingu täitmine',
      description: 'Hankelepingu täitmine',
      startDate: executionStartDate,
      endDate: executionEndDate,
    });

    steps.forEach(step => {
      let status = 'future';
      if (today > step.endDate) {
        status = 'completed';
      } else if (today >= step.startDate && today <= step.endDate) {
        status = 'current';
      } else if (step.startDate < today) {
        status = 'overdue';
      }

      const startDateStr = step.startDate.toLocaleDateString('et-EE');
      const endDateStr = step.endDate.toLocaleDateString('et-EE');
      const dateDisplay =
        startDateStr === endDateStr ? startDateStr : `${startDateStr} - ${endDateStr}`;

      const stepElement = document.createElement('li');
      stepElement.className = `${status}`;

      let accentColor;
      switch (status) {
        case 'completed':
          accentColor = '#4CAD73';
          break;
        case 'current':
          accentColor = '#1B5F8C';
          break;
        case 'overdue':
          accentColor = '#E24A68';
          break;
        default:
          accentColor = '#41516C';
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
    if (!dateStr || typeof dateStr !== 'string') {
      console.warn('Invalid date input:', dateStr);
      return null;
    }

    const statusIndicators = ['Lõpetatud', 'Käimas', 'Hilinenud', 'Tulevikus'];
    if (statusIndicators.includes(dateStr.trim())) {
      console.log('Skipping status indicator:', dateStr);
      return null;
    }

    const parts = dateStr.trim().split('.');
    if (parts.length < 3) {
      console.warn('Invalid date format:', dateStr);
      return null;
    }

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    let year = parseInt(parts[2], 10);

    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      console.warn('Invalid date components:', dateStr);
      return null;
    }

    if (year < 100) {
      year = 2000 + year;
    }

    if (day < 1 || day > 31 || month < 1 || month > 12 || year < 2000 || year > 2100) {
      console.warn('Date components out of range:', dateStr);
      return null;
    }

    const formattedMonth = month.toString().padStart(2, '0');
    const formattedDay = day.toString().padStart(2, '0');

    const date = new Date(`${year}-${formattedMonth}-${formattedDay}`);
    if (isNaN(date.getTime())) {
      console.warn('Invalid date result:', dateStr);
      return null;
    }

    return date;
  }

  function adjustDays(index, adjustment) {
    const daysElement = document.getElementById(`days-${index}`);
    if (!daysElement) {
      console.error(`❌ Element with id days-${index} not found`);
      return;
    }

    // Update the days based on the adjustment
    let days = parseInt(daysElement.innerText.match(/\d+/)?.[0] || '0', 10);
    days = Math.max(0, days + adjustment);
    daysElement.innerText = `${days} päeva`;

    // Update total duration
    const totalDurationElement = document.getElementById('totalDuration');
    if (totalDurationElement) {
      let totalDuration = Array.from(document.querySelectorAll('[id^="days-"]')).reduce(
        (sum, el) => {
          const days = parseInt(el.innerText.match(/\d+/)?.[0] || '0', 10);
          return sum + days;
        },
        0
      );
      totalDurationElement.innerText = totalDuration;
    }

    // Recalculate and update the timeline
    updateTimeline();
  }

  function updateTimeline() {
    const timelineStepsContainer = document.getElementById('timeline-steps');
    if (!timelineStepsContainer) return;

    // Clear existing timeline steps
    timelineStepsContainer.innerHTML = '';

    // Get all current procedure details
    const procedureDetails = [];
    document.querySelectorAll('.result-card .step-row, .result-card li').forEach(row => {
      const stepName = row.querySelector('.step-name')
        ? row.querySelector('.step-name').textContent
        : row.textContent.split(':')[0].trim();
      const daysEl = row.querySelector('[id^="days-"]');
      if (daysEl) {
        const days = daysEl.textContent;
        procedureDetails.push({ step: stepName, days: days });
      }
    });

    // Calculate the new timeline based on the updated procedureDetails
    const today = new Date();
    let currentDate = today; // Start from today or adjust based on your logic

    procedureDetails.forEach((detail, index) => {
      const days = parseInt(detail.days.match(/\d+/)[0]);
      const stepEndDate = new Date(currentDate);
      stepEndDate.setDate(stepEndDate.getDate() + days);

      const stepElement = document.createElement('li');
      stepElement.className = 'timeline-step';

      stepElement.innerHTML = `
            <div class="date">${currentDate.toLocaleDateString()} - ${stepEndDate.toLocaleDateString()}</div>
            <div class="title">${detail.step}</div>
            <div class="descr">${days} päeva</div>
        `;

      timelineStepsContainer.appendChild(stepElement);
      currentDate = stepEndDate; // Move to the next step's start date
    });
  }

  // Setup listeners for adjustDays buttons
  function setupAdjustDaysListeners() {
    document.querySelectorAll('.adjustDays').forEach(button => {
      button.addEventListener('click', function () {
        const index = this.dataset.index; // Assuming buttons have data-index attribute
        const adjustment = parseInt(this.dataset.adjustment); // Assuming buttons have data-adjustment attribute
        adjustDays(index, adjustment);
      });
    });
  }

  // Call this function after the DOM is fully loaded
  document.addEventListener('DOMContentLoaded', function () {
    setupAdjustDaysListeners();
  });
});

// In timeline.html or where the timeline initialization happens
document.addEventListener('DOMContentLoaded', function () {
  // Set up observers for day adjustments
  const resultCard = document.querySelector('.result-card');
  if (resultCard) {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (
          mutation.target.id?.startsWith('days-') ||
          mutation.target.parentElement?.id?.startsWith('days-')
        ) {
          // Days were adjusted, recalculate timeline
          const index = mutation.target.id.split('-')[1]; // Get index from id
          const adjustment = parseInt(mutation.target.dataset.adjustment); // Get adjustment value
          adjustDays(index, adjustment);
        }
      });
    });

    observer.observe(resultCard, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }
});

function displayTimeline(timeline) {
  const timelineStepsContainer = document.getElementById('timeline-steps');
  timelineStepsContainer.innerHTML = ''; // Clear existing steps

  timeline.steps.forEach((step, index) => {
    const stepElement = document.createElement('li');
    stepElement.className = `timeline-step ${step.status}`;
    stepElement.innerHTML = `
            <div class="date">${step.startDate} - ${step.endDate}</div>
            <div class="title">${step.step}</div>
            <div class="descr">${step.duration} päeva</div>
            <div class="flex items-center mt-2">
                <input type="date" class="start-date-input" value="${step.startDate}" />
                <input type="date" class="end-date-input" value="${step.endDate}" />
                <button class="modify-button bg-blue-500 text-white px-2 py-1 rounded">Modify</button>
            </div>
        `;

    // Add event listener for the modify button
    const modifyButton = stepElement.querySelector('.modify-button');
    modifyButton.addEventListener('click', function () {
      const startDateInput = stepElement.querySelector('.start-date-input').value;
      const endDateInput = stepElement.querySelector('.end-date-input').value;

      // Update the timeline with new dates
      if (startDateInput && endDateInput) {
        step.startDate = startDateInput;
        step.endDate = endDateInput;

        // Recalculate the timeline
        const updatedTimeline = calculateTimeline(
          timeline.steps,
          document.getElementById('contractSigningDate').value
        );
        displayTimeline(updatedTimeline);
      } else {
        alert('Please enter valid dates.');
      }
    });

    timelineStepsContainer.appendChild(stepElement);
  });
}
