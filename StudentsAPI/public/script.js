// Get references to the HTML elements you'll interact with:
const studentsListDiv = document.getElementById("studentsList");
const fetchStudentsBtn = document.getElementById("fetchStudentsBtn");
const messageDiv = document.getElementById("message");
const apiBaseUrl = "http://localhost:3000";

// Function to fetch students from the API and display them
async function fetchStudents() {
  try {
    studentsListDiv.innerHTML = "Loading students...";
    messageDiv.textContent = "";

    // Make a GET request to your API endpoint
    const response = await fetch(`${apiBaseUrl}/students`);

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

    // Parse the JSON response
    const students = await response.json();

    // Clear previous content and display students
    studentsListDiv.innerHTML = "";
    if (students.length === 0) {
      studentsListDiv.innerHTML = "<p>No students found.</p>";
    } else {
      students.forEach((student) => {
        const studentElement = document.createElement("div");
        studentElement.classList.add("student-item");
        studentElement.setAttribute("data-student-id", student.student_id);
        studentElement.innerHTML = `
          <h3>${student.name}</h3>
          <p>Address: ${student.address || ""}</p>
          <p>ID: ${student.student_id}</p>
          <button onclick="editStudent(${student.student_id})">Edit</button>
          <button class="delete-btn" data-id="${student.student_id}">Delete</button>
        `;
        studentsListDiv.appendChild(studentElement);
      });
      // Add event listeners for delete buttons after they are added to the DOM
      document.querySelectorAll(".delete-btn").forEach((button) => {
        button.addEventListener("click", handleDeleteClick);
      });
    }
  } catch (error) {
    console.error("Error fetching students:", error);
    studentsListDiv.innerHTML = `<p style="color: red;">Failed to load students: ${error.message}</p>`;
  }
}

function editStudent(studentId) {
  window.location.href = `edit-student.html?id=${studentId}`;
}

// Delete student
function handleDeleteClick(event) {
  const studentId = event.target.getAttribute("data-id");
  if (!confirm(`Are you sure you want to delete student with ID: ${studentId}?`)) {
    return;
  }

  fetch(`${apiBaseUrl}/students/${studentId}`, {
    method: "DELETE",
  })
    .then(async (response) => {
      if (response.status === 404) {
        throw new Error("Student not found (404)");
      }
      if (!response.ok) {
        const errorBody = response.headers
          .get("content-type")
          ?.includes("application/json")
          ? await response.json()
          : { message: response.statusText };
        throw new Error(errorBody.message || "Failed to delete student");
      }
      // Success (usually 200 or 204)
      // Remove the student element from the DOM
      const studentElement = event.target.closest(".student-item");
      if (studentElement) {
        studentElement.remove();
      }
      messageDiv.textContent = `Student with ID ${studentId} deleted successfully.`;
      messageDiv.style.color = "green";
    })
    .catch((error) => {
      console.error("Delete error:", error);
      messageDiv.textContent = `Error deleting student: ${error.message}`;
      messageDiv.style.color = "red";
    });
}

// Fetch students when the button is clicked
fetchStudentsBtn.addEventListener("click", fetchStudents);

// Optionally, fetch students when the page loads
// window.addEventListener('load', fetchStudents); // Or call fetchStudents() directly