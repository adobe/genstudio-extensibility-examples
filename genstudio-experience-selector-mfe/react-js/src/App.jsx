import React, {useRef, useState} from 'react';
import {
    renderExperienceSelectorWithSUSI
} from 'https://experience.adobe.com/solutions/GenStudio-experience-selector-mfe/static-assets/resources/@genstudio/experience-selector/esm/standalone.js';

function App() {
    const [result, setResult] = useState('');
    const dialogRef = useRef();

    function onSelectionConfirmed(experience) {
        dialogRef.current?.close();
        setResult(JSON.stringify(experience, null, 2));
    }

    function openDialog() {
        renderExperienceSelectorWithSUSI(dialogRef.current, {
            apiKey: 'exc_app',
            imsOrg: 'your-ims-org@AdobeOrg', // Replace with your IMS Organization ID (press Ctrl+i in GenStudio to open User Data Debugger, then copy Current Org ID)
            env: 'prod',
            susiConfig: {
                clientId: 'genstudio-<CUSTOMER_NAME>-experienceselectormfe', // Provided by your Adobe support engineer during onboarding
                environment: 'prod',
                scope: 'additional_info.projectedProductContext,read_organizations,AdobeID,openid',
            },
            customFilters: [
                // Multiple array elements are combined with OR logic. Example filters:
                // 'genstudio-channel:email',
                // 'genstudio-externalTemplateId:two-pods',
                // To combine with AND, use a single string:
                // 'genstudio-channel:email AND genstudio-externalTemplateId:no-pod-duplicate-fields',
            ],
            isOpen: true,
            onDismiss: () => dialogRef.current?.close(),
            onSelectionConfirmed
        });
        dialogRef.current?.showModal();
    }

    return (
        <div>
            <h1 style={styles.title}>Hello, this is React with GenStudio Experience Selector!</h1>
            <p style={styles.center}>
                <button style={styles.button} onClick={openDialog}>
                    Select a GenStudio Experience
                </button>
            </p>
            <dialog ref={dialogRef} style={styles.dialog}></dialog>
            <pre style={styles.result}>{result}</pre>
        </div>
    );
}

const styles = {
    title: {
        color: '#61dafb',
        fontFamily: 'sans-serif',
        textAlign: 'center'
    },
    center: {
        textAlign: 'center'
    },
    button: {
        backgroundColor: '#1473e6',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px'
    },
    dialog: {
        width: '80%',
        height: '80%',
        margin: 'auto',
        borderRadius: '12px',
        border: 'none'
    },
    result: {
        fontFamily: 'monospace'
    }
};

export default App;