// Get references to the HTML elements you'll interact with:
const booksListDiv = document.getElementById("booksList");
const fetchBooksBtn = document.getElementById("fetchBooksBtn");
const messageDiv = document.getElementById("message"); // Get reference to the message div
const apiBaseUrl = "http://localhost:3000";

// Function to fetch books from the API and display them
async function fetchBooks() {
  try {
    booksListDiv.innerHTML = "Loading books..."; // Show loading state
    messageDiv.textContent = ""; // Clear any previous messages (assuming a message div exists or add one)

    // Make a GET request to your API endpoint
    const response = await fetch(`${apiBaseUrl}/books`);

    if (!response.ok) {
      // Handle HTTP errors (e.g., 404, 500)
      // Attempt to read error body if available, otherwise use status text
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
    const books = await response.json();

    // Clear previous content and display books
    booksListDiv.innerHTML = ""; // Clear loading message
    if (books.length === 0) {
      booksListDiv.innerHTML = "<p>No books found.</p>";
    } else {
      books.forEach((book) => {
        const bookElement = document.createElement("div");
        bookElement.classList.add("book-item");
        // Use data attributes or similar to store ID on the element if needed later
        bookElement.setAttribute("data-book-id", book.id);
        bookElement.innerHTML = `
                    <h3>${book.title}</h3>
                    <p>Author: ${book.author}</p>
                    <p>ID: ${book.id}</p>
                    <button onclick="viewBookDetails(${book.id})">View Details</button>
                    <button onclick="editBook(${book.id})">Edit</button>
                    <button class="delete-btn" data-id="${book.id}">Delete</button>
                `;
        booksListDiv.appendChild(bookElement);
      });
      // Add event listeners for delete buttons after they are added to the DOM
      document.querySelectorAll(".delete-btn").forEach((button) => {
        button.addEventListener("click", handleDeleteClick);
      });
    }
  } catch (error) {
    console.error("Error fetching books:", error);
    booksListDiv.innerHTML = `<p style="color: red;">Failed to load books: ${error.message}</p>`;
  }
}

// Placeholder functions for other actions (to be implemented later or in other files)
function viewBookDetails(bookId) {
  console.log("View details for book ID:", bookId);
  // In a real app, redirect to view.html or show a modal
  // window.location.href = `view.html?id=${bookId}`; // Assuming you create view.html
  alert(`View details for book ID: ${bookId} (Not implemented yet)`);
}

function editBook(bookId) {
  console.log("Edit book with ID:", bookId);
  // In a real app, redirect to edit.html with the book ID
  window.location.href = `edit.html?id=${bookId}`; // Assuming you create edit.html
}

// Placeholder/Partial implementation for Delete (will be completed by learners)
function handleDeleteClick(event) {
  const bookId = event.target.getAttribute("data-id");
  console.log("Attempting to delete book with ID:", bookId);
  if (!confirm(`Are you sure you want to delete book with ID: ${bookId}?`)) {
    return;
  }

  fetch(`${apiBaseUrl}/books/${bookId}`, {
    method: "DELETE",
  })
    .then(async (response) => {
      if (response.status === 404) {
        throw new Error("Book not found (404)");
      }
      if (!response.ok) {
        const errorBody = response.headers
          .get("content-type")
          ?.includes("application/json")
          ? await response.json()
          : { message: response.statusText };
        throw new Error(errorBody.message || "Failed to delete book");
      }
      // Success (usually 200 or 204)
      // Remove the book element from the DOM
      const bookElement = event.target.closest(".book-item");
      if (bookElement) {
        bookElement.remove();
      }
      messageDiv.textContent = `Book with ID ${bookId} deleted successfully.`;
      messageDiv.style.color = "green";
    })
    .catch((error) => {
      console.error("Delete error:", error);
      messageDiv.textContent = `Error deleting book: ${error.message}`;
      messageDiv.style.color = "red";
    });
}

// Fetch books when the button is clicked
fetchBooksBtn.addEventListener("click", fetchBooks);

// Optionally, fetch books when the page loads
// window.addEventListener('load', fetchBooks); // Or call fetchBooks() directly