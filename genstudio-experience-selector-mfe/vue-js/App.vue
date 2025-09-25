<script setup>
import { ref } from 'vue'

import {renderExperienceSelectorWithSUSI} from 'https://experience-stage.adobe.com/solutions/GenStudio-experience-selector-mfe/static-assets/resources/@genstudio/experience-selector/esm/standalone.js?path=/story/api-package-experience-selector-dialog--experience-selector-dialog&GenStudio-experience-selector-mfe_version=PR-83-91d3d16382361be32ceaf2729b44434a67388828-5329';


const dialogRef = ref();
const resultRef = ref();


function onSelectionConfirmed(experience) {
    dialogRef.value?.close();
    resultRef.value.textContent = JSON.stringify(experience, null, 2);
}

const experienceSelectorProps = {
    locale: 'en-US',
    apiKey: 'exc_app',
    imsToken: '',
    imsOrg: '36031A56669DEACD0A49402F@AdobeOrg',
    // customFilters: ['genstudio-channel:email'],
    env: 'stage',
    isOpen: true,
    onDismiss: () => dialogRef.value?.close(),
    onSelectionConfirmed
};


function openDialog() {
    renderExperienceSelectorWithSUSI(dialogRef.value, experienceSelectorProps);

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