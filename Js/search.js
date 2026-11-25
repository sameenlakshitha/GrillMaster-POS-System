const searchModal = document.getElementById("searchModal");
const searchTrigger = document.getElementById("openSearch");
const modalSearch = document.getElementById("modalSearch");
const searchResults = document.getElementById("searchResults");
const closeSearch = document.getElementById("closeSearch");

let searchItems = [];
let selectedIndex = 0;

// Collect website navigation links
document.querySelectorAll('.navbar a[href^="#"]').forEach(link => {

    const target = document.getElementById(
        link.getAttribute("href").substring(1)
    );

    if (!target) return;

    searchItems.push({
        name: link.textContent.trim(),
        category: "Page",
        target: target
    });
});

// Collect all food items from your menu
document.querySelectorAll(".foodcard").forEach(card => {

    const name = card.querySelector(".card-content h3");
    const category = card.querySelector(".card-content .category");
    const image = card.querySelector(".card-img img");

    if (name) {
        searchItems.push({
            name: name.textContent.trim(),
            category: category ? category.textContent.trim() : "Food",
            image: image ? image.src : "",
            target: card
        });
    }
});

// Display matching results
function displayResults() {

    const query = modalSearch.value.toLowerCase().trim();

    const filteredItems = searchItems.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
    );

    searchResults.innerHTML = "";
    selectedIndex = 0;

    filteredItems.forEach((item, index) => {

        const button = document.createElement("button");

        button.type = "button";
        button.className = "search-result";

        if (index === 0) {
            button.classList.add("selected");
        }

        if (item.image) {
            const img = document.createElement("img");
            img.src = item.image;
            img.alt = "";
            button.appendChild(img);
        }

        const name = document.createElement("span");
        name.textContent = item.name;
        button.appendChild(name);

        const category = document.createElement("small");
        category.textContent = item.category;
        button.appendChild(category);

        button.addEventListener("click", () => {

            searchModal.close();

            item.target.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        });

        searchResults.appendChild(button);
    });

    if (filteredItems.length === 0) {
        searchResults.textContent = "No results found.";
    }
}

// Open search window
function openSearchWindow() {

    if (searchModal.open) return;

    modalSearch.value = "";
    displayResults();
    searchModal.showModal();
    modalSearch.focus();
}

searchTrigger.addEventListener("click", openSearchWindow);

// Live search
modalSearch.addEventListener("input", displayResults);

// Close search
closeSearch.addEventListener("click", () => {
    searchModal.close();
});

// Close when clicking outside
searchModal.addEventListener("click", event => {
    if (event.target === searchModal) {
        searchModal.close();
    }
});

// Command + K or Ctrl + K
document.addEventListener("keydown", event => {

    if ((event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "k") {

        event.preventDefault();
        openSearchWindow();
    }
});

// Keyboard navigation
searchModal.addEventListener("keydown", event => {

    const results = searchResults.querySelectorAll(".search-result");

    if (results.length === 0) return;

    if (event.key === "ArrowDown") {

        event.preventDefault();

        selectedIndex = (selectedIndex + 1) % results.length;

    } else if (event.key === "ArrowUp") {

        event.preventDefault();

        selectedIndex =
            (selectedIndex - 1 + results.length) % results.length;

    } else if (event.key === "Enter" &&
        document.activeElement === modalSearch) {

        event.preventDefault();
        results[selectedIndex].click();
        return;

    } else {
        return;
    }

    results.forEach((result, index) => {
        result.classList.toggle("selected", index === selectedIndex);
    });

    results[selectedIndex].scrollIntoView({
        block: "nearest"
    });
});