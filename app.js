const form = document.querySelector("#plannerForm");
const energyInput = document.querySelector("#energy");
const energyValue = document.querySelector("#energyValue");
const mealGrid = document.querySelector("#mealGrid");
const groceryList = document.querySelector("#groceryList");
const substitutionList = document.querySelector("#substitutionList");
const todoList = document.querySelector("#todoList");
const budgetCard = document.querySelector("#budgetCard");
const budgetStatus = document.querySelector("#budgetStatus");
const budgetDetails = document.querySelector("#budgetDetails");
const planTitle = document.querySelector("#planTitle");
const copyPlan = document.querySelector("#copyPlan");
const generateButton = document.querySelector("#generateButton");
const aiBadge = document.querySelector("#aiBadge");

const energyLabels = {
  1: "Minimal",
  2: "Low",
  3: "Steady",
  4: "Ready",
  5: "Ambitious"
};

const fallbackPlan = {
  title: "Flexible balanced-day meal plan",
  aiMode: "Local fallback",
  budget: {
    status: "Tight but workable",
    estimatedCost: 22,
    budget: 24,
    currency: "$",
    rationale: "This local fallback uses shared staples across meals. Start the server with an OpenAI API key for fully flexible AI planning."
  },
  meals: [
    {
      type: "Breakfast",
      name: "Oat bowl with fruit and seed crunch",
      timeMinutes: 10,
      why: "Fast, flexible, and low-prep.",
      ingredients: ["oats", "fruit", "chia seeds", "milk or plant milk"],
      tasks: ["Soak or cook oats", "Add fruit and seeds", "Pack extra fruit for a snack"]
    },
    {
      type: "Lunch",
      name: "Rice bowl with protein and greens",
      timeMinutes: 20,
      why: "Uses pantry grains and adapts to most diets.",
      ingredients: ["rice", "beans or tofu", "greens", "lemon", "yogurt or tahini"],
      tasks: ["Warm rice", "Prepare protein", "Top with greens and sauce"]
    },
    {
      type: "Dinner",
      name: "One-pan vegetable stew",
      timeMinutes: 30,
      why: "Budget-aware and easy to stretch for leftovers.",
      ingredients: ["lentils", "tomatoes", "carrot", "spinach", "bread or rice"],
      tasks: ["Simmer lentils and vegetables", "Wilt greens", "Serve with bread or rice"]
    }
  ],
  groceries: [
    { item: "Fruit", quantity: "2 servings", category: "Produce", estimatedCost: 3 },
    { item: "Greens", quantity: "1 bunch", category: "Produce", estimatedCost: 4 },
    { item: "Protein", quantity: "1 pack or can", category: "Protein", estimatedCost: 5 }
  ],
  substitutions: [
    { original: "Milk", substitute: "Plant milk, yogurt, or water", reason: "Diet and pantry flexibility" },
    { original: "Tofu", substitute: "Beans, eggs, paneer, or chicken", reason: "Any food type can be adapted" }
  ],
  todos: [
    "Check pantry quantities before shopping.",
    "Buy only missing produce and protein.",
    "Batch chop greens once for lunch and dinner.",
    "Cook extra grains for tomorrow."
  ]
};

function collectFormData() {
  const fields = form.elements;
  const selectedMeals = [...form.querySelectorAll("input[name='meals']:checked")].map((item) => item.value);

  return {
    dayType: fields.dayType.value,
    energy: Number(fields.energy.value),
    meals: selectedMeals,
    servings: Number(fields.servings.value),
    cookingTime: Number(fields.cookingTime.value),
    diet: fields.diet.value,
    cuisine: fields.cuisine.value.trim(),
    foodType: fields.foodType.value.trim(),
    healthGoal: fields.healthGoal.value,
    budget: Number(fields.budget.value || 0),
    currency: fields.currency.value,
    pantry: fields.pantry.value.trim(),
    avoid: fields.avoid.value.trim(),
    equipment: fields.equipment.value.trim(),
    notes: fields.notes.value.trim()
  };
}

async function generatePlan(event) {
  event.preventDefault();
  setLoading(true);

  try {
    const response = await fetch("/api/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(collectFormData())
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || "Unable to generate a plan.");
    }

    renderPlan(payload.plan);
  } catch (error) {
    const plan = structuredClone(fallbackPlan);
    plan.budget.rationale = `${plan.budget.rationale} ${error.message}`;
    renderPlan(plan);
  } finally {
    setLoading(false);
  }
}

function renderPlan(plan) {
  planTitle.textContent = plan.title || "Personal cooking plan";
  aiBadge.textContent = plan.aiMode || "AI generated";
  mealGrid.innerHTML = "";

  plan.meals.forEach((meal) => {
    const card = document.createElement("article");
    card.className = "meal-card";
    card.innerHTML = `
      <h3>${escapeHtml(meal.type)}<span>${Number(meal.timeMinutes || 0)} min</span></h3>
      <strong>${escapeHtml(meal.name)}</strong>
      <p>${escapeHtml(meal.why || "Fits the requirements you selected.")}</p>
      <ul>${(meal.tasks || []).map((task) => `<li>${escapeHtml(task)}</li>`).join("")}</ul>
    `;
    mealGrid.appendChild(card);
  });

  renderBudget(plan.budget);
  renderGroceries(plan.groceries || []);
  renderSubstitutions(plan.substitutions || []);
  renderTodos(plan.todos || []);
}

function renderBudget(budget) {
  budgetCard.classList.remove("tight", "over");
  const status = budget.status || "Feasible";
  const normalized = status.toLowerCase();

  if (normalized.includes("over")) {
    budgetCard.classList.add("over");
  } else if (normalized.includes("tight")) {
    budgetCard.classList.add("tight");
  }

  budgetStatus.textContent = status;
  budgetDetails.textContent = `${budget.currency || "$"}${Number(budget.estimatedCost || 0).toFixed(2)} estimated against ${budget.currency || "$"}${Number(budget.budget || 0).toFixed(2)}. ${budget.rationale || ""}`;
}

function renderGroceries(items) {
  groceryList.innerHTML = "";

  if (!items.length) {
    addListItem(groceryList, "No grocery run needed. Your pantry covers the plan.");
    return;
  }

  items.forEach((item) => {
    addListItem(
      groceryList,
      `${item.item}${item.quantity ? `, ${item.quantity}` : ""}${item.category ? ` (${item.category})` : ""}${item.estimatedCost ? ` - approx ${item.estimatedCost}` : ""}`
    );
  });
}

function renderSubstitutions(items) {
  substitutionList.innerHTML = "";

  if (!items.length) {
    addListItem(substitutionList, "No substitutions needed for the selected requirements.");
    return;
  }

  items.forEach((item) => {
    addListItem(substitutionList, `${item.original}: ${item.substitute}${item.reason ? ` - ${item.reason}` : ""}`);
  });
}

function renderTodos(items) {
  todoList.innerHTML = "";
  items.forEach((item) => addListItem(todoList, item));
}

function addListItem(list, text) {
  const item = document.createElement("li");
  item.textContent = text;
  list.appendChild(item);
}

function setLoading(isLoading) {
  generateButton.disabled = isLoading;
  generateButton.textContent = isLoading ? "Generating with AI..." : "Generate cooking to-do list";
}

function copyCurrentPlan() {
  const text = [
    planTitle.textContent,
    aiBadge.textContent,
    budgetStatus.textContent,
    budgetDetails.textContent,
    "",
    "Meals",
    ...[...mealGrid.querySelectorAll(".meal-card")].map((card) => card.innerText),
    "",
    "Groceries",
    ...[...groceryList.children].map((item) => `- ${item.textContent}`),
    "",
    "Substitutions",
    ...[...substitutionList.children].map((item) => `- ${item.textContent}`),
    "",
    "Cooking to-dos",
    ...[...todoList.children].map((item, index) => `${index + 1}. ${item.textContent}`)
  ].join("\n");

  if (!navigator.clipboard) {
    window.prompt("Copy your cooking plan", text);
    return;
  }

  navigator.clipboard.writeText(text).then(() => {
    copyPlan.textContent = "Copied";
    window.setTimeout(() => {
      copyPlan.textContent = "Copy list";
    }, 1400);
  }).catch(() => {
    window.prompt("Copy your cooking plan", text);
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

energyInput.addEventListener("input", () => {
  energyValue.textContent = energyLabels[energyInput.value];
});

form.addEventListener("submit", generatePlan);
copyPlan.addEventListener("click", copyCurrentPlan);
renderPlan(fallbackPlan);
