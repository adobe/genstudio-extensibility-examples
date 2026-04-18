import {
    renderExperienceSelectorWithSUSI
} from "https://experience.adobe.com/solutions/GenStudio-experience-selector-mfe/static-assets/resources/@genstudio/experience-selector/esm/standalone.js"
import { createSelectionResultsComponent } from "./result-view.js";

// DOM element references
const dialogRef = document.getElementById('experience-selector-root');
const resultRef = document.getElementById('experience-selector-result');
const resultJsonRef = document.getElementById('experience-selector-result-json');


// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('experience-selector-button');
    button.addEventListener('click', openDialog);
});

/**
 * Handles the experience selection confirmation
 * @param {import('./types.js').ExperienceSelection[]} experiences - Array of selected experiences
 */
function onSelectionConfirmed(experiences) {
    dialogRef?.close();

    if (experiences.length > 0) {
        resultRef.replaceChildren(createSelectionResultsComponent(experiences));
        resultJsonRef.textContent = JSON.stringify(experiences, null, 2);
    } else {
        resultRef.replaceChildren();
    }

    // update selector placeholder
    if (document.getElementById('selector-section')) {
        document.getElementById('selector-section').style.display = experiences.length > 0 ? 'none' : 'block';
    }
}

function openDialog() {
    renderExperienceSelectorWithSUSI(
        dialogRef,
        {
            imsOrg: 'your-ims-org@AdobeOrg', // Replace with your IMS Organization ID (press Ctrl+i in GenStudio to open User Data Debugger, then copy Current Org ID)
            susiConfig: {
                clientId: 'genstudio-<CUSTOMER_NAME>-experienceselectormfe', // Provided by your Adobe support engineer during onboarding
            },
            customFilters: [
                // Channels OR'd, other filters OR'd; the two groups AND'd. See repo README.
                // Example — meta + product:
                // 'genstudio-channel:meta',
                // 'genstudio-product:Rc6903ef2eb2eda20a53d2b4be',
            ],
            isOpen: true,
            onDismiss: () => dialogRef?.close(),
            onSelectionConfirmed
        }
    );

    dialogRef?.showModal();
}
