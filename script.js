let currentSort = { key: null, ascending: true };

const expenseForm = document.getElementById("expense-form");
const expenseList = document.getElementById("expense-list");
const totalAmount = document.getElementById("total-amount");
const filterCategory = document.getElementById("filter-category");
const filterName = document.getElementById("filter-name");
const filterAmount = document.getElementById("filter-amount");
const filterDate = document.getElementById("filter-date");

const categorySelect = document.getElementById("expense-category");

const defaultCategories = ["Food", "Entertainment", "Transport", "Clothes", "Other"];

function loadCategories() {
  const storedCategories = JSON.parse(localStorage.getItem("categories"));
  return storedCategories && storedCategories.length ? storedCategories : defaultCategories;
}

function populateCategoryDropdowns() {
  const categories = loadCategories();

  categorySelect.innerHTML = "";
  filterCategory.innerHTML = "";

  const allOption = document.createElement("option");
  allOption.value = "All";
  allOption.text = "All";
  filterCategory.appendChild(allOption);

  categories.forEach(cat => {
    const option1 = document.createElement("option");
    option1.value = cat;
    option1.text = cat;
    categorySelect.appendChild(option1);

    const option2 = document.createElement("option");
    option2.value = cat;
    option2.text = cat;
    filterCategory.appendChild(option2);
  });
}

// Utility to format dates as dd/mm/yyyy
function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// Load stored expenses
let expenseStore = [];

const storedExpenses = localStorage.getItem("expenseStore");
if (storedExpenses) {
  expenseStore = JSON.parse(storedExpenses);
  displayExpense(expenseStore);
  updateTotalAmount();
}

populateCategoryDropdowns();

// Expense form submission
expenseForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("expense-name").value;
  const amount = parseFloat(document.getElementById("expense-amount").value);
  const category = document.getElementById("expense-category").value;
  const dateInput = document.getElementById("expense-date").value;
  const formattedDate = formatDate(new Date(dateInput));

  if (isNaN(amount) || amount <= 0) {
    alert("Please enter a valid positive amount.");
    return;
  }

  const expense = {
    id: Date.now(),
    name,
    amount,
    category,
    date: formattedDate
  };

  expenseStore.push(expense);
  localStorage.setItem("expenseStore", JSON.stringify(expenseStore));
  displayExpense(expenseStore);
  updateTotalAmount();
  expenseForm.reset();
});

// Handle delete and edit actions
expenseList.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-btn")) {
    const id = parseInt(e.target.dataset.id);
    expenseStore = expenseStore.filter(exp => exp.id !== id);
    localStorage.setItem("expenseStore", JSON.stringify(expenseStore));
    displayExpense(expenseStore);
    updateTotalAmount();
  }

  if (e.target.classList.contains("edit-btn")) {
    const id = parseInt(e.target.dataset.id);
    const expense = expenseStore.find(exp => exp.id === id);

    document.getElementById("expense-name").value = expense.name;
    document.getElementById("expense-amount").value = expense.amount;
    document.getElementById("expense-category").value = expense.category;
    document.getElementById("expense-date").value = expense.date.split("/").reverse().join("-");

    expenseStore = expenseStore.filter(exp => exp.id !== id);
    localStorage.setItem("expenseStore", JSON.stringify(expenseStore));
    displayExpense(expenseStore);
    updateTotalAmount();
  }
});

// Filters
function applyAllFilters() {
  let filtered = [...expenseStore];

  const nameValue = filterName.value.toLowerCase();
  const amountValue = parseFloat(filterAmount.value);
  const dateValue = filterDate.value;
  const categoryValue = filterCategory.value;

  if (nameValue) {
    filtered = filtered.filter(exp => exp.name.toLowerCase().includes(nameValue));
  }

  if (!isNaN(amountValue)) {
    filtered = filtered.filter(exp => exp.amount === amountValue);
  }

  if (dateValue) {
    const formattedDate = formatDate(new Date(dateValue));
    filtered = filtered.filter(exp => exp.date === formattedDate);
  }

  if (categoryValue !== "All") {
    filtered = filtered.filter(exp => exp.category === categoryValue);
  }

  return filtered;
}

// Sorting
function filterAndSort() {
  let expenses = applyAllFilters();

  const { key, ascending } = currentSort;
  if (key) {
    expenses.sort((a, b) => {
      let valA = a[key];
      let valB = b[key];

      if (key === 'amount') {
        valA = parseFloat(valA);
        valB = parseFloat(valB);
      } else if (key === 'date') {
        const [d1, m1, y1] = valA.split('/');
        const [d2, m2, y2] = valB.split('/');
        valA = new Date(`${y1}-${m1}-${d1}`);
        valB = new Date(`${y2}-${m2}-${d2}`);
      } else {
        valA = valA.toString().toLowerCase();
        valB = valB.toString().toLowerCase();
      }

      if (valA < valB) return ascending ? -1 : 1;
      if (valA > valB) return ascending ? 1 : -1;
      return 0;
    });
  }

  displayExpense(expenses);
  updateTotalAmount(expenses);
}

// Event listeners for sort buttons
document.querySelectorAll('.sort').forEach(button => {
  button.addEventListener('click', () => {
    const sortKey = button.dataset.sort;

    if (currentSort.key === sortKey) {
      currentSort.ascending = !currentSort.ascending;
    } else {
      currentSort.key = sortKey;
      currentSort.ascending = true;
    }

    document.querySelectorAll('.sort').forEach(btn => btn.classList.remove('asc', 'desc'));
    button.classList.add(currentSort.ascending ? 'asc' : 'desc');

    filterAndSort();
  });
});

// Filter events
filterName.addEventListener("input", filterAndSort);
filterAmount.addEventListener("input", filterAndSort);
filterDate.addEventListener("input", filterAndSort);
filterCategory.addEventListener("change", filterAndSort);

// Reset filters
document.getElementById("reset-filters").addEventListener("click", () => {
  filterName.value = "";
  filterAmount.value = "";
  filterDate.value = "";
  filterCategory.value = "All";
  filterAndSort();
});

// Display expenses in table
function displayExpense(showExpense) {
  expenseList.innerHTML = "";

  showExpense.forEach(element => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${element.name}</td>
      <td>${element.amount}</td>
      <td>${element.category}</td>
      <td>${element.date}</td>
      <td>
      <div class="action-buttons">
      <button class="edit-btn" data-id="${element.id}">Edit</button>
      <button class="delete-btn" data-id="${element.id}">Delete</button>
      </div>
      </td>`;
    expenseList.appendChild(row);
  });
}

// Total calculation
function updateTotalAmount(expenses = expenseStore) {
  const total = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  totalAmount.textContent = total.toFixed(2);
}
