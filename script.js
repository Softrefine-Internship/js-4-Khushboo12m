let currentSort = { key: null, ascending: true };

const expenseForm = document.getElementById("expense-form");
const expenseList = document.getElementById("expense-list");
const totalAmount = document.getElementById("total-amount");
const filterCategory = document.getElementById("filter-category");
const filterName = document.getElementById("filter-name");
let currentFilteredExpenses = [];

let currentExpensePage = 1;
const itemsPerPage = 5;
let currentCategoryPage = 1;
const categoriesPerPage = 5;

// New date range filters:
const filterStartDate = document.getElementById("filter-start-date");
const filterEndDate = document.getElementById("filter-end-date");

const categorySelect = document.getElementById("expense-category");

const defaultCategories = ["Food", "Entertainment", "Transport", "Clothes", "Other"];

function showCategorySection() {
  document.getElementById('expense-section').style.display = 'none';
  document.getElementById('category-section').style.display = 'block';
}

function showExpenseSection() {
  document.getElementById('category-section').style.display = 'none';
  document.getElementById('expense-section').style.display = 'block';
}

function loadCategories() {
  let storedCategories = JSON.parse(localStorage.getItem("categories"));

  if (!storedCategories) {
    storedCategories = []; 
  }

  return storedCategories;
}


function populateCategoryDropdowns() {
  const categories = loadCategories();

  categorySelect.innerHTML = "";
  filterCategory.innerHTML = "";
  const editCategory = document.getElementById("edit-category");
  editCategory.innerHTML = "";


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

    const option3 = document.createElement("option");
    option3.value = cat;
    option3.text = cat;
    editCategory.appendChild(option3);
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
  filterAndSort();

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
    filterAndSort();  
    updateTotalAmount(); 
  }

if (e.target.classList.contains("edit-btn")) {
  const id = parseInt(e.target.dataset.id);
  const expense = expenseStore.find(exp => exp.id === id);

  populateCategoryDropdowns(); 
  document.getElementById("edit-id").value = expense.id;
  document.getElementById("edit-name").value = expense.name;
  document.getElementById("edit-amount").value = expense.amount;
  document.getElementById("edit-category").value = expense.category;

  const [d, m, y] = expense.date.split('/');
  document.getElementById("edit-date").value = `${y}-${m}-${d}`;

  document.getElementById("edit-expense-modal").style.display = "block";
}
});

document.getElementById("edit-expense-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const id = parseInt(document.getElementById("edit-id").value);
  const name = document.getElementById("edit-name").value;
  const amount = parseFloat(document.getElementById("edit-amount").value);
  const category = document.getElementById("edit-category").value;
  const dateInput = document.getElementById("edit-date").value;
  const formattedDate = formatDate(new Date(dateInput));

  const index = expenseStore.findIndex(exp => exp.id === id);
  if (index !== -1) {
    expenseStore[index] = { id, name, amount, category, date: formattedDate };
    localStorage.setItem("expenseStore", JSON.stringify(expenseStore));
    displayExpense(expenseStore);
    updateTotalAmount();
    closeEditModal();
  }
});
function closeEditModal() {
  document.getElementById("edit-expense-modal").style.display = "none";
}

// Filters
function applyAllFilters() {
  let filtered = [...expenseStore];

  const nameValue = filterName.value.toLowerCase();
  const categoryValue = filterCategory.value;

  // New date range values:
  const startDateValue = filterStartDate.value;
  const endDateValue = filterEndDate.value;

  if (nameValue) {
    filtered = filtered.filter(exp => exp.name.toLowerCase().includes(nameValue));
  }

  
  
  if (startDateValue && endDateValue) {
    const startDate = new Date(startDateValue);
    const endDate = new Date(endDateValue);

    if (startDate > endDate) {
      alert("End Date must be greater than Start Date");
      return filtered;

    }
  
    filtered = filtered.filter(exp => {
      const [d, m, y] = exp.date.split('/');
      const expDate = new Date(`${y}-${m}-${d}`);
      return expDate >= startDate && expDate <= endDate;
    });
  }
  
  
  

  if (categoryValue !== "All") {
    filtered = filtered.filter(exp => exp.category === categoryValue);
  }

  return filtered;
}

// Sorting
function filterAndSort() {
  currentExpensePage = 1; 

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

  currentFilteredExpenses = expenses;

  displayExpense(currentFilteredExpenses);
  updateTotalAmount(currentFilteredExpenses);
}
filterAndSort();

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
filterStartDate.addEventListener("change", filterAndSort);
filterEndDate.addEventListener("change", filterAndSort);


filterCategory.addEventListener("change", filterAndSort);

// Reset filters
document.getElementById("reset-filters").addEventListener("click", () => {
  filterName.value = "";
  filterStartDate.value = "";
  filterEndDate.value = "";
  filterCategory.value = "All";
  filterAndSort();
});

// // Display expenses in table
function paginateExpenses(data, page = 1) {
  const start = (page - 1) * itemsPerPage;
  const paginatedData = data.slice(start, start + itemsPerPage);
  return paginatedData;
}

function displayExpense(data) {
  const paginatedData = paginateExpenses(data, currentExpensePage);
  expenseList.innerHTML = "";

  if (paginatedData.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="5" style="text-align:center;">No data found</td>`;
    expenseList.appendChild(tr);
  } else {
    paginatedData.forEach(exp => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${exp.name}</td>
        <td>${exp.amount}</td>
        <td>${exp.category}</td>
        <td>${exp.date}</td>
        <td>
          <button class="edit-btn" data-id="${exp.id}">Edit</button>
          <button class="delete-btn" data-id="${exp.id}">Delete</button>
        </td>
      `;
      expenseList.appendChild(tr);
    });
  }

  updatePaginationControls(data.length);
}

function updatePaginationControls(totalItems) {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  document.getElementById("expense-page-info").textContent = `Page ${currentExpensePage} of ${totalPages}`;

  document.getElementById("expense-prev").disabled = currentExpensePage === 1;
  document.getElementById("expense-next").disabled = currentExpensePage === totalPages;
}

// Pagination button listeners
document.getElementById("expense-prev").addEventListener("click", () => {
  if (currentExpensePage > 1) {
    currentExpensePage--;
    displayExpense(currentFilteredExpenses);
    updatePaginationControls(currentFilteredExpenses.length); // ✅ FIXED
  }
});

document.getElementById("expense-next").addEventListener("click", () => {
  const totalPages = Math.ceil(currentFilteredExpenses.length / itemsPerPage); // ✅ FIXED
  if (currentExpensePage < totalPages) {
    currentExpensePage++;
    displayExpense(currentFilteredExpenses);
    updatePaginationControls(currentFilteredExpenses.length); // ✅ FIXED
  }
});


// Total calculation
function updateTotalAmount(expenses = expenseStore) {
  const total = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  totalAmount.textContent = total.toFixed(2);
}

// Category management

const categoryForm = document.getElementById('category-form');
const categoryList = document.getElementById('category-list');
const categoryInput = document.getElementById('category-name');

// Load or initialize categories
let categories = JSON.parse(localStorage.getItem("categories")) || [...defaultCategories];
saveCategories();


function paginateCategories(data, page = 1) {
  const start = (page - 1) * categoriesPerPage;
  return data.slice(start, start + categoriesPerPage);
}

function renderCategories() {
  categoryList.innerHTML = "";

  const paginatedCategories = paginateCategories(categories, currentCategoryPage);

  if (paginatedCategories.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td colspan="2" style="text-align: center;">No data available</td>
    `;
    categoryList.appendChild(row);
  } else {
    paginatedCategories.forEach((cat, index) => {
      const actualIndex = (currentCategoryPage - 1) * categoriesPerPage + index;
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${cat}</td>
        <td>
          <button class="edit-btn" type="button" onclick="editCategory(${actualIndex})">Edit</button>
          <button class="delete-btn" type="button" onclick="deleteCategory(${actualIndex})">Delete</button>
        </td>
      `;
      categoryList.appendChild(row);
    });
  }

  updateCategoryPaginationControls();
}

function updateCategoryPaginationControls() {
  const totalPages = Math.max(1, Math.ceil(categories.length / categoriesPerPage));
  document.getElementById("category-page-info").textContent = `Page ${currentCategoryPage} of ${totalPages}`;

  document.getElementById("category-prev").disabled = currentCategoryPage === 1;
  document.getElementById("category-next").disabled = currentCategoryPage === totalPages || totalPages === 0;
}



document.getElementById("category-prev").addEventListener("click", () => {
  if (currentCategoryPage > 1) {
    currentCategoryPage--;
    renderCategories();
  }
});

document.getElementById("category-next").addEventListener("click", () => {
  const totalPages = Math.ceil(categories.length / categoriesPerPage);
  if (currentCategoryPage < totalPages) {
    currentCategoryPage++;
    renderCategories();
  }
});


function saveCategories() {
  localStorage.setItem("categories", JSON.stringify(categories));
  populateCategoryDropdowns(); 
  currentCategoryPage = 1;
  renderCategories();
}



categoryForm.addEventListener('submit', function (e) {
  e.preventDefault();
  const name = categoryInput.value.trim();

  if (name === "") {
    alert("Category name cannot be empty.");
    return;
  }

  const lowerCaseName = name.toLowerCase();
  const existingLowerCaseCategories = categories.map(cat => cat.toLowerCase());

  if (existingLowerCaseCategories.includes(lowerCaseName)) {
    alert("Category already exists!");
    return;
  }

  categories.push(name);
  categoryInput
  categoryInput.value = "";
  saveCategories();
});

function deleteCategory(index) {
  const category = categories[index];
  if (confirm(`Delete category "${category}"?.`)) {
    // Remove the category
    categories.splice(index, 1);
    saveCategories();

    // Remove all expenses with this category
    expenseStore = expenseStore.filter(exp => exp.category !== category);
    localStorage.setItem("expenseStore", JSON.stringify(expenseStore));
    displayExpense(expenseStore);
    updateTotalAmount();
    
  }
}

function editCategory(index) {
  const newName = prompt("Edit category name:", categories[index]);
if (newName) {
const trimmedName = newName.trim();
if (trimmedName === "") {
alert("Category name cannot be empty.");
return;
}
// Check for duplicates ignoring case
const lowerTrimmed = trimmedName.toLowerCase();
const existingLowerCaseCategories = categories
.filter((_, i) => i !== index)
.map(cat => cat.toLowerCase());

if (existingLowerCaseCategories.includes(lowerTrimmed)) {
  alert("Category already exists!");
  return;
}

const oldName = categories[index];
categories[index] = trimmedName;
saveCategories();

// Update category name in expenses
expenseStore.forEach(exp => {
  if (exp.category === oldName) {
    exp.category = trimmedName;
  }
});
localStorage.setItem("expenseStore", JSON.stringify(expenseStore));
displayExpense(expenseStore);
updateTotalAmount();
}
}

renderCategories();