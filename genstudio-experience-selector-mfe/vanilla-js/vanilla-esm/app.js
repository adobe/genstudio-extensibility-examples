import {
    renderExperienceSelectorWithSUSI
} from "https://experience.adobe.com/solutions/GenStudio-experience-selector-mfe/static-assets/resources/@genstudio/experience-selector/esm/standalone.js"
import {createSelectionResultsComponent} from "./result-view.js";


// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('experience-selector-button');
    button.addEventListener('click', openDialog);

    // Setup collapsible JSON section
    const jsonSection = document.getElementById('json-response-section');
    const jsonSectionHeader = jsonSection?.querySelector('.info-section-header');

    if (jsonSectionHeader) {
        jsonSectionHeader.addEventListener('click', () => {
            jsonSection.classList.toggle('collapsed');
        });
    }
});

const dialogRef = document.getElementById('experience-selector-root');
const resultRef = document.getElementById('experience-selector-result');
const resultJsonRef = document.getElementById('experience-selector-result-json');
const jsonResponseSection = document.getElementById('json-response-section');
const selectorSection = document.getElementById('selector-section');
const continueButton = document.getElementById('continue-button');

function onSelectionConfirmed(experiences) {
    dialogRef?.close();

    // Clear previous results
    resultRef.textContent = '';

    if (experiences.length > 0) {
        // Hide the empty selector section
        if (selectorSection) {
            selectorSection.style.display = 'none';
        }

        // Show selected experiences
        resultRef.appendChild(createSelectionResultsComponent(experiences));

        // Enable continue button
        if (continueButton) {
            continueButton.disabled = false;
        }

        // Update JSON response section
        resultJsonRef.textContent = JSON.stringify(experiences, null, 2);
        if (jsonResponseSection) {
            jsonResponseSection.style.display = 'block';
        }
    } else {
        // Show empty selector section
        if (selectorSection) {
            selectorSection.style.display = 'block';
        }

        // Disable continue button
        if (continueButton) {
            continueButton.disabled = true;
        }

        // Hide JSON response section
        if (jsonResponseSection) {
            jsonResponseSection.style.display = 'none';
        }
    }
}

function openDialog() {
    renderExperienceSelectorWithSUSI(
        dialogRef,
        {
            apiKey: 'exc_app',
            imsOrg: '36031A56669DEACD0A49402F@AdobeOrg', // Replace with your IMS Organization ID (press Ctrl+i in GenStudio to open User Data Debugger, then copy Current Org ID)
            env: 'stage',
            susiConfig: {
                clientId: 'genstudio', // Provided by your Adobe support engineer during onboarding
                environment: 'stg1',
                scope: 'additional_info.projectedProductContext,read_organizations,AdobeID,openid',
            },
            customFilters: [
                // Multiple array elements are combined with OR logic. Example filters:
                // 'genstudio-channel:email',
                // 'genstudio-externalTemplateId:two-pods',
                // To combine with AND, use a single string:
                // 'genstudio-channel:email AND genstudio-externalTemplateId:two-pods',
            ],
            isOpen: true,
            onDismiss: () => dialogRef?.close(),
            onSelectionConfirmed
        }
    );

    dialogRef?.showModal();
}
