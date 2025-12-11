/**
 * Mockup UI components for the enterprise campaign workflow demo
 * This module is self-contained and automatically initializes on load
 */

/**
 * Creates the mockup UI structure
 * Moves button and result elements from body into the mockup layout
 */
function createMockupUI() {
    const mockupRoot = document.getElementById('mockup-root');
    const button = document.getElementById('experience-selector-button');
    const resultContainer = document.getElementById('experience-selector-result');
    const jsonPre = document.getElementById('experience-selector-result-json');

    // Create continue button (mockup only)
    const continueButton = document.createElement('button');
    continueButton.id = 'continue-button';
    continueButton.className = 'secondary-button';
    continueButton.disabled = true;
    continueButton.textContent = 'Continue to Schedule';

    mockupRoot.innerHTML = `
        <header class="app-header">
            <div class="app-logo">
                <div class="logo-icon">T</div>
                <span class="app-title">Enterprise Marketing Platform</span>
            </div>
            <div class="user-menu">
                <div class="user-avatar">JS</div>
            </div>
        </header>

        <main class="app-main">
            <aside class="sidebar">
                <div class="sidebar-title">Campaign Setup</div>
                <ul class="step-list">
                    <li class="step-item completed">
                        <div class="step-number">✓</div>
                        <div class="step-text">Basic Info</div>
                    </li>
                    <li class="step-item completed">
                        <div class="step-number">✓</div>
                        <div class="step-text">Target Audience</div>
                    </li>
                    <li class="step-item active">
                        <div class="step-number">3</div>
                        <div class="step-text">Content Selection</div>
                    </li>
                    <li class="step-item">
                        <div class="step-number">4</div>
                        <div class="step-text">Schedule</div>
                    </li>
                    <li class="step-item">
                        <div class="step-number">5</div>
                        <div class="step-text">Review & Launch</div>
                    </li>
                </ul>
            </aside>

            <div class="main-panel">
                <div class="campaign-header">
                    <div class="campaign-name">Summer Product Launch 2026</div>
                    <div class="campaign-meta">Created on Dec 9, 2025 • Last edited 5 minutes ago</div>
                </div>

                <div class="panel-card">
                    <div class="panel-header">
                        <div class="panel-title">Step 3: Content Selection</div>
                        <div class="panel-description">
                            Choose the GenStudio experience that will be used in this campaign.
                            Select from pre-approved, brand-compliant content from your library.
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Experience *</label>
                        <div class="experience-selector-section" id="selector-section">
                            <div class="selector-icon">📄</div>
                            <div class="selector-title">No experience selected</div>
                            <div class="selector-description">
                                Browse and select a GenStudio experience from your content library
                            </div>
                            <div id="button-container"></div>
                        </div>
                    </div>

                    <div id="result-container"></div>

                    <div class="action-bar" id="action-bar-container"></div>
                </div>
            </div>

            <aside class="info-panel">
                <div class="info-section">
                    <div class="info-title">Timeline</div>
                    <div class="info-content">
                        <div class="info-item">
                            <span class="info-label">Start Date</span>
                            <span class="info-value">Dec 15, 2026</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">End Date</span>
                            <span class="info-value">Jan 31, 2027</span>
                        </div>
                    </div>
                </div>

                <div class="info-section collapsible" id="json-response-section">
                    <div class="info-section-header">
                        <div class="info-title">API Response</div>
                        <span class="collapse-icon">▼</span>
                    </div>
                    <div class="info-content">
                        <div class="json-content" id="json-container"></div>
                    </div>
                </div>
            </aside>
        </main>
    `;

    // Move elements from body into mockup layout
    const buttonContainer = document.getElementById('button-container');
    const actionBarContainer = document.getElementById('action-bar-container');
    const resultContainerTarget = document.getElementById('result-container');
    const jsonContainer = document.getElementById('json-container');

    // Show and move the button
    button.style.display = '';
    buttonContainer.appendChild(button);

    // Add continue button to action bar
    actionBarContainer.appendChild(continueButton);

    // Move result containers
    resultContainerTarget.appendChild(resultContainer);
    jsonContainer.appendChild(jsonPre);
}

/**
 * Initializes the mockup UI and handles all UI state management
 */
function initializeMockup() {
    const jsonResponseSection = document.getElementById('json-response-section');
    const jsonSectionHeader = jsonResponseSection?.querySelector('.info-section-header');

    // Setup collapsible JSON section
    if (jsonSectionHeader) {
        jsonSectionHeader.addEventListener('click', () => {
            jsonResponseSection.classList.toggle('collapsed');
        });
    }
}

// Auto-initialize mockup when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    createMockupUI();
    initializeMockup();
});
