let metricCount = 0;

document.addEventListener('DOMContentLoaded', () => {
    const chartContainer = document.getElementById('bars');
    const colors = ['primary', 'success', 'danger', 'purple'];

    // Event Listeners
    document.getElementById('randomizeBtn').addEventListener('click', randomizeAll);
    document.getElementById('addBarBtn').addEventListener('click', addNewBar);
    
    document.querySelectorAll('.theme-dot').forEach(theme => {
        theme.addEventListener('click', setTheme);
    });

    function createBar(chartContainer, config) {
        const template = getBarTemplate();
        const barWrapper = setupBarWrapper(template);
        const bar = setupBar(template, config);
        
        metricCount++;
        barWrapper.id = `metric-${metricCount}`;
        template.querySelector('.metric-name').textContent = config.name;
        
        chartContainer.appendChild(template);
    }

    function getBarTemplate() {
        return document.getElementById('barTemplate').content.cloneNode(true);
    }

    function setupBarWrapper(template) {
        return template.querySelector('.bar-wrapper');
    }

    function setupBar(template, config) {
        const bar = template.querySelector('.bar');
        bar.classList.add(config.color);
        bar.style.width = `${config.percentage}%`;
        bar.setAttribute('aria-valuenow', config.percentage);
        bar.dataset.percentage = config.percentage;
    }

    function randomizeAll() {
        document.querySelectorAll('.bar').forEach(bar => {
            const newValue = Math.floor(Math.random() * 80 + 20);
            animateValue(bar, parseInt(bar.dataset.percentage), newValue);
            bar.dataset.percentage = newValue;
            bar.setAttribute('aria-valuenow', newValue);
        });
    }

    function animateValue(element, start, end) {
        const duration = 1000;
        const startTime = Date.now();

        function update() {
            if (!document.body.contains(element)) {
                return;
            }
            const progress = Math.min((Date.now() - startTime) / duration, 1);
            const current = Math.floor(progress * (end - start) + start);
            element.style.width = `${current}%`;

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        
        requestAnimationFrame(update);
    }

    function addNewBar() {
        createBar(chartContainer, {
            name: `New Metric ${metricCount + 1}`,
            percentage: Math.floor(Math.random() * 80 + 20),
            color: colors[metricCount % colors.length]
        });
    }

    function setTheme(e) {
        document.body.classList.forEach(cls => {
            if (cls.startsWith('theme-')) {
                document.body.classList.remove(cls);
            }
        });
        const theme = e.target.dataset.theme;
        document.body.classList.add(`theme-${theme}`);
    }

    // Ensure you're receiving the data from the correct source.
    window.addEventListener("message", (event) => {
        if (event.data.type === "updateDataBar") {
            const data = event.data.data;
            const barsContainer = document.getElementById("bars");
            barsContainer.innerHTML = "";

            const maxDays = Math.max(...Object.values(data)); // Calculate max dynamically

            Object.entries(data).forEach(([key, days]) => {
                let percentage = maxDays > 0 ? Math.round((days / maxDays) * 100) : 0;
                let bar = document.createElement("div");
                bar.className = "bar";
                bar.style.width = percentage + "%";
                bar.textContent = key.replace(/Days$/, '') + " (" + days + " päeva)";
                barsContainer.appendChild(bar);
            });
        }
    });
});