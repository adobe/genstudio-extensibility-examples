/**
 * Mockup UI components for the enterprise campaign workflow demo
 */

/**
 * Initializes the mockup UI and handles all UI state management
 */
export function initializeMockup() {
    const selectorSection = document.getElementById('selector-section');
    const jsonResponseSection = document.getElementById('json-response-section');
    const jsonSectionHeader = jsonResponseSection?.querySelector('.info-section-header');

    // Setup collapsible JSON section
    if (jsonSectionHeader) {
        jsonSectionHeader.addEventListener('click', () => {
            jsonResponseSection.classList.toggle('collapsed');
        });
    }

    return {
        selectorSection,
        jsonResponseSection
    };
}

/**
 * Updates the UI when experiences are selected or cleared
 * @param {Object} elements - UI element references
 * @param {ExperienceSelection[]} experiences - Selected experiences
 * @param {HTMLElement} resultContainer - Container for displaying results
 * @param {HTMLElement} jsonContainer - Container for JSON display
 */
export function updateMockupUI(elements, experiences, resultContainer, jsonContainer) {
    const { selectorSection } = elements;

    // Clear previous results
    resultContainer.textContent = '';

    if (experiences.length > 0) {
        // Hide the empty selector section
        if (selectorSection) {
            selectorSection.style.display = 'none';
        }

        // Update JSON response section
        jsonContainer.textContent = JSON.stringify(experiences, null, 2);
    } else {
        // Show empty selector section
        if (selectorSection) {
            selectorSection.style.display = 'block';
        }
    }
}
