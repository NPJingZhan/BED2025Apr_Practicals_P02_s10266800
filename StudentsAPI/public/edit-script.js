// Get references to the elements
const editStudentForm = document.getElementById("editStudentForm");
const loadingMessageDiv = document.getElementById("loadingMessage"); // Element to show loading state
const messageDiv = document.getElementById("message"); // Element to display messages (success/error)
const studentIdInput = document.getElementById("studentId"); // Hidden input to store the student ID
const editNameInput = document.getElementById("editName"); // Input for the student name
const editAddressInput = document.getElementById("editAddress"); // Input for the student address

// Base URL for the API.
const apiBaseUrl = "http://localhost:3000";

// Function to get student ID from URL query parameter (e.g., edit-student.html?id=1)
function getStudentIdFromUrl() {
  const params = new URLSearchParams(window.location.search); // Get URL query parameters
  return params.get("id"); // Return the value of the 'id' parameter
}

// Function to fetch existing student data from the API based on ID
async function fetchStudentData(studentId) {
  try {
    // Make a GET request to the API endpoint for a specific student
    const response = await fetch(`${apiBaseUrl}/students/${studentId}`);

    // Check if the HTTP response status is not OK (e.g., 404, 500)
    if (!response.ok) {
      const errorBody = response.headers
        .get("content-type")
        ?.includes("application/json")
        ? await response.json()
        : { message: response.statusText };
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorBody.message}`
      );
    }

    // Parse the JSON response body into a JavaScript object
    const student = await response.json();
    return student; // Return the fetched student object
  } catch (error) {
    console.error("Error fetching student data:", error);
    messageDiv.textContent = `Failed to load student data: ${error.message}`;
    messageDiv.style.color = "red";
    loadingMessageDiv.textContent = ""; // Hide loading message if it was shown
    return null;
  }
}

// Function to populate the form fields with the fetched student data
function populateForm(student) {
  studentIdInput.value = student.student_id; // Store the student ID in the hidden input
  editNameInput.value = student.name; // Set the name input value
  editAddressInput.value = student.address || ""; // Set the address input value
  loadingMessageDiv.style.display = "none"; // Hide the loading message
  editStudentForm.style.display = "block"; // Show the edit form
}

// --- Code to run when the page loads ---

// Get the student ID from the URL when the page loads
const studentIdToEdit = getStudentIdFromUrl();

if (studentIdToEdit) {
  fetchStudentData(studentIdToEdit).then((student) => {
    if (student) {
      populateForm(student);
    } else {
      loadingMessageDiv.textContent = "Student not found or failed to load.";
      messageDiv.textContent = "Could not find the student to edit.";
      messageDiv.style.color = "red";
    }
  });
} else {
  loadingMessageDiv.textContent = "No student ID specified for editing.";
  messageDiv.textContent =
    "Please provide a student ID in the URL (e.g., edit-student.html?id=1).";
  messageDiv.style.color = "orange";
}

// --- Form Submission / PUT Request ---

editStudentForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  // Collect updated data from form fields
  const updatedName = editNameInput.value.trim();
  const updatedAddress = editAddressInput.value.trim();
  const studentId = studentIdInput.value;

  // Basic client-side validation
  if (!updatedName) {
    messageDiv.textContent = "Name is required.";
    messageDiv.style.color = "red";
    return;
  }

  const updatedStudent = {
    name: updatedName,
    address: updatedAddress,
  };

  try {
    const response = await fetch(`${apiBaseUrl}/students/${studentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedStudent),
    });

    if (response.status === 404) {
      throw new Error("Student not found (404)");
    }
    if (response.status === 400) {
      const errorBody = await response.json();
      throw new Error(errorBody.error || "Validation error");
    }
    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(errorBody.error || "Failed to update student");
    }

    messageDiv.textContent = "Student updated successfully!";
    messageDiv.style.color = "green";

    setTimeout(() => {
      window.location.href = "students.html";
    }, 1000);

  } catch (error) {
    messageDiv.textContent = `Error updating student: ${error.message}`;
    messageDiv.style.color = "red";
  }
});