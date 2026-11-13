const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzTtbkyTbX6o327s8LQpJ_rdxRBzo-BfxytHi4EqVz-ASvohZ-9qQZ8THZlMS8idY3X7w/exec";

const form = document.getElementById("catalogueForm");
let submitting = false;

form.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (submitting) return;

    const submitButton = form.querySelector('button[type="submit"]');
    const fileInput = form.querySelector('input[name="catalogueFile"]');
    const file = fileInput.files[0];

    if (!file) {
        alert("Please upload your catalogue file.");
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        alert("Please upload a file smaller than 5 MB.");
        return;
    }

    submitting = true;
    submitButton.disabled = true;
    submitButton.textContent = "Submitting...";

    try {
        const formData = new FormData(form);

        // Convert file to Base64
        const fileData = await new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = function () {
                resolve(reader.result.split(",")[1]);
            };

            reader.onerror = function () {
                reject(new Error("Could not read the file."));
            };

            reader.readAsDataURL(file);
        });

        const data = {
            name: formData.get("name"),
            roll: formData.get("roll"),
            department: formData.get("department"),
            email: formData.get("email"),
            phone: formData.get("phone"),
            title: formData.get("title"),
            description: formData.get("description"),
            fileName: file.name,
            fileType: file.type || "application/octet-stream",
            fileData: fileData
        };

        // Send data in a format Google Apps Script can reliably receive
        const response = await fetch(SCRIPT_URL, {
            method: "POST",
            body: new URLSearchParams({
                payload: JSON.stringify(data)
            })
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.message || "Submission failed.");
        }

        form.reset();
        alert("Catalogue submitted successfully!");

    } catch (error) {
        console.error(error);
        alert("Submission failed. Please try again.");
    } finally {
        submitting = false;
        submitButton.disabled = false;
        submitButton.textContent = "Submit Catalogue";
    }
});