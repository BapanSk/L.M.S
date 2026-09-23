// ------- Mock Data (চাইলে পরে API/DB দিয়ে দিতে পারো) -------
const BOOKS = [
    { id: "B001", title: "Introduction to Algorithms", author: "Cormen", dept: "CSE", available: true },
    { id: "B002", title: "Database System Concepts", author: "Silberschatz", dept: "CSE", available: false },
    { id: "B003", title: "Digital Electronics", author: "M. Morris Mano", dept: "ECE", available: true },
    { id: "B004", title: "Signals and Systems", author: "Oppenheim", dept: "ECE", available: false },
    { id: "B005", title: "Thermodynamics", author: "Yunus A. Çengel", dept: "ME", available: true },
    { id: "B006", title: "Operating System Concepts", author: "Silberschatz", dept: "CSE", available: true },
    { id: "B007", title: "Computer Networks", author: "Tanenbaum", dept: "CSE", available: false },
    { id: "B008", title: "Engineering Mathematics", author: "B.S. Grewal", dept: "Common", available: true },
  ];
  
  const OVERDUES_PREV_SEM = [
    { studentName: "Ananya Das", studentId: "S21021", dept: "CSE", sem: "4th", bookId: "B007", title: "Computer Networks", due: "2025-06-10", daysOver: 70 },
    { studentName: "Ravi Kumar", studentId: "S20987", dept: "ECE", sem: "4th", bookId: "B004", title: "Signals and Systems", due: "2025-06-05", daysOver: 75 },
    { studentName: "Priya Sen", studentId: "S21005", dept: "ME",  sem: "2nd", bookId: "B005", title: "Thermodynamics",      due: "2025-05-30", daysOver: 81 },
  ];
  
  // ------- DOM Elements -------
  const booksTbody = document.querySelector("#booksTable tbody");
  const overdueTbody = document.querySelector("#overdueTable tbody");
  const searchInput = document.getElementById("searchInput");
  const availabilityFilter = document.getElementById("availabilityFilter");
  const resetBtn = document.getElementById("resetBtn");
  
  // ------- Render Functions -------
  function renderBooks(list) {
    booksTbody.innerHTML = "";
    list.forEach((b, idx) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>${b.id}</td>
        <td>${b.title}</td>
        <td>${b.author}</td>
        <td>${b.dept}</td>
        <td>
          <span class="badge ${b.available ? "available" : "notavailable"}">
            ${b.available ? "Available" : "Not Available"}
          </span>
        </td>
      `;
      booksTbody.appendChild(tr);
    });
  }
  
  function renderOverdues(list) {
    overdueTbody.innerHTML = "";
    list.forEach((o, idx) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>${o.studentName}</td>
        <td>${o.studentId}</td>
        <td>${o.dept}</td>
        <td>${o.sem}</td>
        <td>${o.bookId}</td>
        <td>${o.title}</td>
        <td>${o.due}</td>
        <td>${o.daysOver}</td>
      `;
      overdueTbody.appendChild(tr);
    });
  }
  
  // ------- Filters / Search -------
  function applyFilters() {
    const q = (searchInput.value || "").toLowerCase().trim();
    const avail = availabilityFilter.value; // all | available | notavailable
  
    const filtered = BOOKS.filter(b => {
      const matchText =
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q);
      const matchAvail =
        avail === "all" ||
        (avail === "available" && b.available) ||
        (avail === "notavailable" && !b.available);
      return matchText && matchAvail;
    });
  
    renderBooks(filtered);
  }
  
  function resetFilters() {
    searchInput.value = "";
    availabilityFilter.value = "all";
    renderBooks(BOOKS);
  }
  
  // ------- Event Listeners -------
  searchInput.addEventListener("input", applyFilters);
  availabilityFilter.addEventListener("change", applyFilters);
  resetBtn.addEventListener("click", resetFilters);
  
  // ------- Init -------
  renderBooks(BOOKS);
  renderOverdues(OVERDUES_PREV_SEM);
  