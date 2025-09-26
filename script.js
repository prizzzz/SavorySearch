// ================== API Configuration ==================
const API_KEY = "614a32ba7b2943dcb4731b27ee779f80"; 
const API_BASE_URL = "https://api.spoonacular.com/recipes/complexSearch";

// ================== DOM Elements ==================
const ingredientInput = document.getElementById("ingredientInput");
const searchBtn = document.getElementById("searchBtn");
const dietFilter = document.getElementById("dietFilter");
const cuisineFilter = document.getElementById("cuisineFilter");
const maxTimeFilter = document.getElementById("maxTimeFilter");
const recipeResults = document.getElementById("recipeResults");
const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toastMessage");

// ================== Event Listeners ==================
if (searchBtn) {
    searchBtn.addEventListener("click", searchRecipes);
}

if (ingredientInput) {
    ingredientInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") searchRecipes();
    });
}

[dietFilter, cuisineFilter, maxTimeFilter].forEach((select) => {
    if (select) {
        select.addEventListener("change", searchRecipes);
    }
});

// ================== Search Recipes Function ==================
async function searchRecipes() {
    const ingredients = ingredientInput.value.trim();

    if (!ingredients) {
        showToast("Please enter at least one ingredient");
        return;
    }

    recipeResults.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Searching for delicious recipes...</p>
        </div>
    `;

    try {
        // Build params only if values exist
        const params = new URLSearchParams({ apiKey: API_KEY, number: 10, addRecipeInformation: true });

        if (ingredients) {
            params.append("query", ingredients);
        }
        if (dietFilter && dietFilter.value) {
            params.append("diet", dietFilter.value);
        }
        if (cuisineFilter && cuisineFilter.value) {
            params.append("cuisine", cuisineFilter.value);
        }
        if (maxTimeFilter && maxTimeFilter.value) {
            params.append("maxReadyTime", maxTimeFilter.value);
        }

        const response = await fetch(`${API_BASE_URL}?${params}`);
        if (!response.ok) throw new Error("API request failed");

        const data = await response.json();
        displayRecipes(data.results);
    } catch (error) {
        console.error("Error fetching recipes:", error);
        showError("Failed to fetch recipes. Please try again.");
    }
}

// ================== Display Recipes Function ==================
function displayRecipes(recipes) {
    if (!recipes || recipes.length === 0) {
        recipeResults.innerHTML = `
            <div class="error">
                <i class="fas fa-exclamation-circle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                <h3>No recipes found</h3>
                <p>Try different ingredients or adjust your filters.</p>
            </div>
        `;
        return;
    }

    recipeResults.innerHTML = "";

    // Get current favorites
    const favorites = getFavorites();
    
    recipes.forEach((recipe, index) => {
        const isFavorite = favorites.some(fav => fav.id === recipe.id);
        
        const recipeCard = document.createElement("div");
        recipeCard.className = "recipe-card";
        recipeCard.style.animationDelay = `${index * 0.1}s`;

        // Escape special characters in title
        const escapedTitle = recipe.title.replace(/'/g, "&#39;").replace(/"/g, "&quot;");
        
        recipeCard.innerHTML = `
            <img src="${recipe.image}" alt="${recipe.title}" class="recipe-image">
            <div class="recipe-content">
                <h3 class="recipe-title">${recipe.title}</h3>
                <div class="recipe-meta">
                    <span class="meta-item"><i class="fas fa-clock"></i> ${recipe.readyInMinutes || "N/A"} min</span>
                    <span class="meta-item"><i class="fas fa-users"></i> ${recipe.servings || "N/A"} servings</span>
                    <span class="meta-item"><i class="fas fa-heart"></i> ${recipe.aggregateLikes || 0}</span>
                </div>
                <div class="recipe-actions">
                    <a href="${recipe.sourceUrl}" target="_blank" class="recipe-link">
                        <i class="fas fa-external-link-alt"></i> View Recipe
                    </a>
                    <button class="save-btn ${isFavorite ? 'saved' : ''}" onclick="toggleFavorite(${recipe.id}, '${escapedTitle}', '${recipe.image}', ${recipe.readyInMinutes || 0}, ${recipe.servings || 0}, ${recipe.aggregateLikes || 0}, '${recipe.sourceUrl}')">
                        <i class="fas fa-heart"></i> ${isFavorite ? 'Saved' : 'Save Recipe'}
                    </button>
                </div>
            </div>
        `;

        recipeResults.appendChild(recipeCard);
    });
}

// ================== Favorites Management ==================
function getFavorites() {
    try {
        return JSON.parse(localStorage.getItem('favoriteRecipes')) || [];
    } catch (error) {
        console.error('Error reading favorites from localStorage:', error);
        return [];
    }
}

function saveFavorites(favorites) {
    try {
        localStorage.setItem('favoriteRecipes', JSON.stringify(favorites));
    } catch (error) {
        console.error('Error saving favorites to localStorage:', error);
    }
}

function toggleFavorite(id, title, image, readyInMinutes, servings, aggregateLikes, sourceUrl) {
    console.log('Toggle favorite called for ID:', id);
    
    let favorites = getFavorites();
    const recipeIndex = favorites.findIndex(recipe => recipe.id === id);
    
    if (recipeIndex > -1) {
        // Remove from favorites
        favorites.splice(recipeIndex, 1);
        showToast('Recipe removed from favorites!');
    } else {
        // Add to favorites
        const recipe = {
            id: id,
            title: title,
            image: image,
            readyInMinutes: readyInMinutes,
            servings: servings,
            aggregateLikes: aggregateLikes,
            sourceUrl: sourceUrl
        };
        favorites.push(recipe);
        showToast('Recipe saved to favorites!');
    }
    
    saveFavorites(favorites);
    
    // Update the button text on the current page
    updateFavoriteButton(id, recipeIndex === -1);
    
    // Log current favorites for debugging
    console.log('Current favorites:', getFavorites());
}

function updateFavoriteButton(recipeId, isNowFavorite) {
    const buttons = document.querySelectorAll('.save-btn');
    buttons.forEach(button => {
        const onclickAttr = button.getAttribute('onclick');
        if (onclickAttr && onclickAttr.includes(`toggleFavorite(${recipeId}`)) {
            button.innerHTML = `<i class="fas fa-heart"></i> ${isNowFavorite ? 'Saved' : 'Save Recipe'}`;
            if (isNowFavorite) {
                button.classList.add('saved');
            } else {
                button.classList.remove('saved');
            }
        }
    });
}

// ================== Error Function ==================
function showError(message) {
    if (recipeResults) {
        recipeResults.innerHTML = `
            <div class="error">
                <i class="fas fa-exclamation-circle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                <h3>Oops! Something went wrong</h3>
                <p>${message}</p>
            </div>
        `;
    }
}

// ================== Toast Notification ==================
function showToast(message) {
    if (toast && toastMessage) {
        toastMessage.textContent = message;
        toast.classList.add("show");
        setTimeout(() => {
            toast.classList.remove("show");
        }, 3000);
    } else {
        // Fallback alert if toast not available
        alert(message);
    }
}

// ================== Load Default Recipes ==================
if (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('.html') === false) {
    window.addEventListener("DOMContentLoaded", () => {
        loadDefaultRecipes();
    });
}

async function loadDefaultRecipes() {
    if (!recipeResults) return;
    
    recipeResults.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Fetching some delicious recipes for you...</p>
        </div>
    `;

    try {
        const params = new URLSearchParams({
            apiKey: API_KEY,
            query: "dinner",
            number: 10,
            addRecipeInformation: true,
            sort: "popularity"
        });

        const response = await fetch(`${API_BASE_URL}?${params}`);
        if (!response.ok) throw new Error("API request failed");

        const data = await response.json();
        displayRecipes(data.results);
    } catch (error) {
        console.error("Error fetching default recipes:", error);
        showError("Failed to load default recipes. Please try again later.");
    }
}

// Make functions globally available
window.toggleFavorite = toggleFavorite;
window.getFavorites = getFavorites;

