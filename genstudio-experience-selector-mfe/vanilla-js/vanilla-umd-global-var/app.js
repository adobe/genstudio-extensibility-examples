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

const experienceSelectorProps = {
    locale: 'en-US',
    apiKey: 'exc_app',
    imsOrg: 'your-ims-org@AdobeOrg', // Replace with your IMS Organization ID (press Ctrl+i in GenStudio to open User Data Debugger, then copy Current Org ID)
    // customFilters: ['genstudio-channel:email'],
    env: 'prod',
    susiConfig: {
        clientId: 'genstudio-<CUSTOMER_NAME>-experienceselectormfe', // Provided by your Adobe support engineer during onboarding
        environment: "prod",
        scope:
            'additional_info.projectedProductContext,read_organizations,AdobeID,openid',
        locale: 'en_US',
        modalSettings: {
            width: 500,
            height: 700,
        },
    },
    isOpen: true,
    onDismiss: () => dialogRef?.close(),
    onSelectionConfirmed
};

function openDialog() {
    GenStudioExperienceSelector.renderExperienceSelectorWithSUSI(
        dialogRef,
        experienceSelectorProps
    );

    dialogRef?.showModal();
}
