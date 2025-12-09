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
        flexWrap: 'wrap',
        gap: '20px'
    });

    experiences.forEach((experience) => {
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
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
            width: '300px'
        });

        // Create card header with title and channel
        const cardHeader = document.createElement('div');
        Object.assign(cardHeader.style, {
            padding: '16px',
            borderBottom: '1px solid #e0e0e0'
        });

        // Add experience title (use ID as fallback)
        const cardTitle = document.createElement('div');
        Object.assign(cardTitle.style, {
            fontSize: '16px',
            fontWeight: 'bold',
            marginBottom: '8px',
            color: '#333'
        });
        cardTitle.textContent = experience.id || 'Untitled Experience';
        cardHeader.appendChild(cardTitle);

        // Add channel information
        if (experience.metadata?.channel) {
            const channelLabel = document.createElement('div');
            Object.assign(channelLabel.style, {
                fontSize: '12px',
                color: '#666',
                textTransform: 'capitalize'
            });
            channelLabel.textContent = `${experience.metadata.channel}`;
            cardHeader.appendChild(channelLabel);
        }

        experienceCard.appendChild(cardHeader);

        // Create card body for aspects
        const cardBody = document.createElement('div');
        Object.assign(cardBody.style, {
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
        });

        aspectsToRender.forEach((aspect) => {
            const aspectContainer = document.createElement('div');

            // Add aspect ratio label if available
            if (aspect.aspectMetadata?.aspectRatio) {
                const aspectLabel = document.createElement('div');
                Object.assign(aspectLabel.style, {
                    textAlign: 'center',
                    marginBottom: '8px',
                    fontSize: '12px',
                    color: '#666'
                });
                aspectLabel.textContent = `Aspect: ${aspect.aspectMetadata.aspectRatio || aspect.aspectKey}`;
                aspectContainer.appendChild(aspectLabel);
            }

            // Create content preview wrapper
            const previewWrapper = document.createElement('div');
            Object.assign(previewWrapper.style, {
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: '#fafafa'
            });

            // Create content preview
            const contentPreview = document.createElement('div');
            Object.assign(contentPreview.style, {
                zoom: '10%',
                transformOrigin: 'top left'
            });
            contentPreview.innerHTML = atob(aspect.content);

            previewWrapper.appendChild(contentPreview);
            aspectContainer.appendChild(previewWrapper);
            cardBody.appendChild(aspectContainer);
        });

        experienceCard.appendChild(cardBody);
        experiencesWrapper.appendChild(experienceCard);
    });

    container.appendChild(experiencesWrapper);
    return container;
}
