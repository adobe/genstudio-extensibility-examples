/**
 * Creates and renders a selection results component displaying selected experiences
 * @param {ExperienceSelection[]} experiences - Array of selected experiences to display
 * @returns {HTMLElement|null} The rendered component element or null if no experiences
 */
export function createSelectionResultsComponent(experiences) {
    if (experiences.length === 0) {
        return null;
    }

    // Create main container
    const container = document.createElement('div');
    Object.assign(container.style, {
        backgroundColor: '#f8f8f8',
        borderRadius: '16px',
        margin: '20px',
        padding: '20px'
    });

    // Create title
    const title = document.createElement('strong');
    title.textContent = 'Selection';
    container.appendChild(title);

    // Create experiences wrapper
    const experiencesWrapper = document.createElement('div');
    Object.assign(experiencesWrapper.style, {
        display: 'flex',
        flexWrap: 'wrap'
    });

    experiences.forEach((experience, experienceIndex) => {
        // Use aspect variants if available, otherwise fall back to base content
        const aspectsToRender =
            experience.aspectVariants && experience.aspectVariants.length > 0
                ? experience.aspectVariants
                : [{ aspectKey: 'default', aspectMetadata: {}, content: experience.content }];

        // Create experience card
        const experienceCard = document.createElement('div');
        Object.assign(experienceCard.style, {
            display: 'flex',
            flexDirection: 'column',
            gap: '60px',
            margin: '60px',
            padding: '40px',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        });

        aspectsToRender.forEach((aspect, aspectIndex) => {
            const aspectContainer = document.createElement('div');

            // Add aspect ratio label if available
            if (aspect.aspectMetadata?.aspectRatio) {
                const aspectLabel = document.createElement('div');
                Object.assign(aspectLabel.style, {
                    textAlign: 'center',
                    marginBottom: '10px',
                    fontSize: '12px'
                });
                aspectLabel.textContent = `Aspect: ${aspect.aspectMetadata.aspectRatio || aspect.aspectKey}`;
                aspectContainer.appendChild(aspectLabel);
            }

            // Create content preview
            const contentPreview = document.createElement('div');
            Object.assign(contentPreview.style, {
                zoom: '10%',
                border: '30px solid gray',
                borderRadius: '50px'
            });
            contentPreview.innerHTML = atob(aspect.content);

            aspectContainer.appendChild(contentPreview);
            experienceCard.appendChild(aspectContainer);
        });

        experiencesWrapper.appendChild(experienceCard);
    });

    container.appendChild(experiencesWrapper);
    return container;
}
