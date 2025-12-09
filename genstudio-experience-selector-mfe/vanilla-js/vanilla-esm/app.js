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
const jsonViewerRef = document.querySelector('.json-viewer');

function onSelectionConfirmed(experiences) {
    dialogRef?.close();

    resultRef.textContent = '';
    resultRef.appendChild(createSelectionResultsComponent(experiences));

    resultJsonRef.textContent = JSON.stringify(experiences, null, 2);

    // Show JSON viewer when experiences are selected
    if (jsonViewerRef) {
        jsonViewerRef.style.display = experiences.length > 0 ? 'block' : 'none';
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
