import {
    renderExperienceSelectorWithSUSI
} from "https://experience.adobe.com/solutions/GenStudio-experience-selector-mfe/static-assets/resources/@genstudio/experience-selector/esm/standalone.js"
import {createSelectionResultsComponent} from "./result-view.js";


// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('experience-selector-button');
    button.addEventListener('click', openDialog);
});

const dialogRef = document.getElementById('experience-selector-root');
const resultRef = document.getElementById('experience-selector-result');
const resultJsonRef = document.getElementById('experience-selector-result-json');

function onSelectionConfirmed(experiences) {
    dialogRef?.close();

    resultRef.textContent = '';
    resultRef.appendChild(createSelectionResultsComponent(experiences));

    resultJsonRef.textContent = JSON.stringify(experiences, null, 2);
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
