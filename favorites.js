// Favorites page functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('Favorites page loaded');
    loadFavorites();
});

function loadFavorites() {
    const favoritesContainer = document.getElementById('favoritesContainer');
    if (!favoritesContainer) {
        console.log('Favorites container not found');
        return;
    }
    
    let favorites = [];
    try {
        favorites = JSON.parse(localStorage.getItem('favoriteRecipes')) || [];
    } catch (error) {
        console.error('Error reading favorites:', error);
    }
    
    console.log('Loaded favorites:', favorites);
    
    if (favorites.length === 0) {
        favoritesContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-heart" style="font-size: 4rem; color: #e0e0e0; margin-bottom: 1rem;"></i>
                <h3>No favorites yet</h3>
                <p>Start exploring recipes and save your favorites to see them here!</p>
                <a href="index.html" class="recipe-link" style="margin-top: 1rem;">
                    <i class="fas fa-search"></i> Find Recipes
                </a>
            </div>
        `;
        return;
    }
    
    favoritesContainer.innerHTML = '';
    
    favorites.forEach((recipe, index) => {
        const recipeCard = document.createElement("div");
        recipeCard.className = "recipe-card";
        recipeCard.style.animationDelay = `${index * 0.1}s`;
        
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
                    <button class="save-btn remove-favorite" onclick="removeFromFavorites(${recipe.id})">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            </div>
        `;
        
        favoritesContainer.appendChild(recipeCard);
    });
}

function removeFromFavorites(recipeId) {
    console.log('Removing recipe ID:', recipeId);
    
    let favorites = [];
    try {
        favorites = JSON.parse(localStorage.getItem('favoriteRecipes')) || [];
    } catch (error) {
        console.error('Error reading favorites:', error);
    }
    
    favorites = favorites.filter(recipe => recipe.id !== recipeId);
    
    try {
        localStorage.setItem('favoriteRecipes', JSON.stringify(favorites));
        showToast('Recipe removed from favorites!');
    } catch (error) {
        console.error('Error saving favorites:', error);
        showToast('Error removing recipe. Please try again.');
    }
    
    // Reload the favorites list
    loadFavorites();
}

function showToast(message) {
    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toastMessage");
    
    if (toast && toastMessage) {
        toastMessage.textContent = message;
        toast.classList.add("show");
        
        setTimeout(() => {
            toast.classList.remove("show");
        }, 3000);
    } else {
        alert(message);
    }
}

// Make functions globally available
window.removeFromFavorites = removeFromFavorites;
window.loadFavorites = loadFavorites;