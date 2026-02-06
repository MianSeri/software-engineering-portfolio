const BASE_URL = "http://localhost:3000"; // adjust if your server uses a different port

const booksList = document.querySelector("#books");
const loadBtn = document.querySelector("#load");
const addForm = document.querySelector("#add-form");
const patchForm = document.querySelector("#patch-form");

function renderBooks(books) {
    booksList.innerHTML = "";
  
    for (let b of books) {
      const li = document.createElement("li");
  
      const meta = document.createElement("div");
      meta.className = "book-meta";
  
      const title = document.createElement("div");
      title.className = "book-title";
      title.innerText = b.title;
  
      const sub = document.createElement("div");
      sub.className = "book-sub";
      sub.innerText = `${b.author} • ${b.pages} pages • ISBN ${b.isbn}`;
  
      meta.appendChild(title);
      meta.appendChild(sub);
  
      const delBtn = document.createElement("button");
      delBtn.innerText = "Delete";
      delBtn.addEventListener("click", async () => {
        await axios.delete(`${BASE_URL}/books/${b.isbn}`);
        await loadBooks();
      });
  
      li.appendChild(meta);
      li.appendChild(delBtn);
      booksList.appendChild(li);
    }
  }

  const statusEl = document.querySelector("#status");

  function setStatus(msg) {
    statusEl.innerText = msg;
    statusEl.classList.add("show");
  }
  
  function clearStatus() {
    statusEl.classList.remove("show");
    statusEl.innerText = "";
  }


async function loadBooks() {
  try {
    setStatus("Loading books...");
    const resp = await axios.get(`${BASE_URL}/books`);
    renderBooks(resp.data.books);
    setStatus(`Loaded ${resp.data.books.length} book(s).`);
  } catch (err) {
    setStatus(`Error: ${err.response?.data?.error?.message || err.message}`);
  }
}

loadBtn.addEventListener("click", loadBooks);

addForm.addEventListener("submit", async (evt) => {
  evt.preventDefault();
  const formData = new FormData(addForm);

  const payload = {
    isbn: formData.get("isbn"),
    amazon_url: formData.get("amazon_url"),
    author: formData.get("author"),
    language: formData.get("language"),
    pages: Number(formData.get("pages")),
    publisher: formData.get("publisher"),
    title: formData.get("title"),
    year: Number(formData.get("year")),
  };

  await axios.post(`${BASE_URL}/books`, payload);
  addForm.reset();
  await loadBooks();
});

patchForm.addEventListener("submit", async (evt) => {
  evt.preventDefault();
  const formData = new FormData(patchForm);

  const isbn = formData.get("isbn");
  const pages = Number(formData.get("pages"));

  await axios.patch(`${BASE_URL}/books/${isbn}`, { pages });
  patchForm.reset();
  await loadBooks();
});