
    const form = document.getElementById('audioForm');
    form.onsubmit = async (e) => {
        e.preventDefault();
        console.log('Form submitted');
        const formData = new FormData(form);
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

        try {
            const response = await fetch('/process-audio/', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': csrfToken,
                },
            });
            if (response.ok) {
                const result = await response.json();
                document.getElementById('transcriptionResult').textContent = result.transcription;
            } else {
                console.error('Server error:', response.status);
                document.getElementById('transcriptionResult').textContent = 'Error occurred during transcription.';
            }
        } catch (error) {
            console.error('Error:', error);
            document.getElementById('transcriptionResult').textContent = 'Failed to process audio.';
        }
    };
