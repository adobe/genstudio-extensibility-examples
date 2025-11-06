<script setup>
import {ref} from 'vue'

import {
  renderExperienceSelectorWithSUSI
} from 'https://experience.adobe.com/solutions/GenStudio-experience-selector-mfe/static-assets/resources/@genstudio/experience-selector/esm/standalone.js';


const dialogRef = ref();
const resultRef = ref();


function onSelectionConfirmed(experience) {
    dialogRef.value?.close();
    resultRef.value.textContent = JSON.stringify(experience, null, 2);
}

function openDialog() {
    renderExperienceSelectorWithSUSI(dialogRef.value, {
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
        // 'genstudio-channel:email AND genstudio-externalTemplateId:two-pods',
      ],
      isOpen: true,
      onDismiss: () => dialogRef.value?.close(),
      onSelectionConfirmed
    });

    dialogRef.value?.showModal()
}

</script>


<template>
    <h1>Hello, this is Vue with GenStudio Experience Selector!</h1>
    <p style="text-align: center">
        <button id="experience-selector-button" @click="openDialog">Select a GenStudio Experience</button>
    </p>
    <dialog id="experience-selector-root" ref="dialogRef"></dialog>
    <pre id="experience-selector-result" ref="resultRef"></pre>

</template>

<style scoped>
h1 {
    color: #42b883; /* Vue's brand green */
    font-family: sans-serif;
    text-align: center;
}

button {
    background-color: #1473e6;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
}
button:hover {
    background-color: #0d66d0;
}

#experience-selector-root {
    width: 80%;
    height: 80%;
    margin: auto;
    border-radius: 12px;
    border: none;
}

#experience-selector-result {
    font-family: monospace;
}
</style>