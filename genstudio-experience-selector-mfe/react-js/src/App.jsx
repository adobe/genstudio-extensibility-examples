import React, { useState, useRef } from 'react';
import { renderExperienceSelectorWithSUSI } from 'https://experience-stage.adobe.com/solutions/GenStudio-experience-selector-mfe/static-assets/resources/@genstudio/experience-selector/esm/standalone.js?path=/story/api-package-experience-selector-dialog--experience-selector-dialog&GenStudio-experience-selector-mfe_version=prod20250924024220';

function App() {
    const [result, setResult] = useState('');
    const dialogRef = useRef();

    function onSelectionConfirmed(experience) {
        dialogRef.current?.close();
        setResult(JSON.stringify(experience, null, 2));
    }

    const experienceSelectorProps = {
        locale: 'en-US',
        apiKey: 'exc_app',
        imsOrg: '36031A56669DEACD0A49402F@AdobeOrg',
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
        onDismiss: () => dialogRef.current?.close(),
        onSelectionConfirmed
    };

    function openDialog() {
        renderExperienceSelectorWithSUSI(dialogRef.current, experienceSelectorProps);
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