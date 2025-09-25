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
    imsToken: '',
    imsOrg: '36031A56669DEACD0A49402F@AdobeOrg',
    // customFilters: ['genstudio-channel:email'],
    env: 'stage',
    susiConfig: {
        clientId: 'genstudio',
        environment: "stg1",
        scope:
            'additional_info.projectedProductContext,additional_info.ownerOrg,AdobeID,openid,session,read_organizations,ab.manage',
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
