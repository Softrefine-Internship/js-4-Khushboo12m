const categoryForm = document.getElementById('category-form');
const categoryList = document.getElementById('category-list');
const categoryInput = document.getElementById('category-name');

// Default categories if no user-defined categories exist
const defaultCategories = ["Food", "Entertainment", "Transport", "Clothes", "Other"];

// Load or initialize categories
let categories = JSON.parse(localStorage.getItem("categories")) || [...defaultCategories];
saveCategories();

function renderCategories() {
  categoryList.innerHTML = "";
  categories.forEach((cat, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${cat}</td>
      <td>
        <button  class="edit-btn" onclick="editCategory(${index})">Edit</button>
        <button class="delete-btn" onclick="deleteCategory(${index})">Delete</button>
      </td>
    `;
    categoryList.appendChild(row);
  });
}

function saveCategories() {
  localStorage.setItem("categories", JSON.stringify(categories));
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
  categoryInput.value = "";
  saveCategories();
});

window.deleteCategory = function(index) {
  const category = categories[index];
  if (confirm(`Delete category "${category}"?`)) {
    categories.splice(index, 1);
    saveCategories();
  }
}

window.editCategory = function(index) {
  const currentName = categories[index];
  const newName = prompt("Edit category name:", currentName);

  if (!newName) return;

  const trimmed = newName.trim();
  const lowerTrimmed = trimmed.toLowerCase();
  const existingLowerCaseCategories = categories.map((cat, i) => i !== index ? cat.toLowerCase() : null);

  if (trimmed === "") {
    alert("Category name cannot be empty.");
    return;
  }

  if (existingLowerCaseCategories.includes(lowerTrimmed)) {
    alert("Category already exists.");
    return;
  }

  // Update category in categories list
  categories[index] = trimmed;
  saveCategories();

  // Also update category in expenseStore
  updateCategoryInExpenses(currentName, trimmed);
}

// Update category name in expenses
function updateCategoryInExpenses(oldName, newName) {
  let expenses = JSON.parse(localStorage.getItem("expenseStore")) || [];
  let updated = false;

  expenses = expenses.map(exp => {
    if (exp.category === oldName) {
      exp.category = newName;
      updated = true;
    }
    return exp;
  });

  if (updated) {
    localStorage.setItem("expenseStore", JSON.stringify(expenses));
  }
}

renderCategories();
