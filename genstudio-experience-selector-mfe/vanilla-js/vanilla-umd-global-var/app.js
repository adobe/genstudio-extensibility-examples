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
