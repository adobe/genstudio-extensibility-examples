// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('experience-selector-button');
    button.addEventListener('click', openDialog);
});

const dialogRef = document.getElementById('experience-selector-root');
const resultRef = document.getElementById('experience-selector-result');

function onSelectionConfirmed(experience) {
    dialogRef?.close();
    resultRef.textContent = JSON.stringify(experience, null, 2);
}

function openDialog() {
    GenStudioExperienceSelector.renderExperienceSelectorWithSUSI(
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
                // 'genstudio-channel:email AND genstudio-externalTemplateId:no-pod-duplicate-fields',
            ],
            isOpen: true,
            onDismiss: () => dialogRef?.close(),
            onSelectionConfirmed
        }
    );

    dialogRef?.showModal();
}
