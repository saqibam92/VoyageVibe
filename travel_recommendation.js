document.addEventListener('DOMContentLoaded', () => {
    let travelData = {};

    // Fetch travel data from the JSON file
    fetch('travel_recommendation_api.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            travelData = data;
        })
        .catch(error => {
            console.error('Failed to load travel data:', error);
            const errorMessage = document.getElementById('errorMessage');
            errorMessage.textContent = 'Could not load travel recommendations. Please try again later.';
            errorMessage.style.display = 'block';
            document.getElementById('resultsSection').style.display = 'block';
        });

    // --- Element Selectors ---
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const clearBtn = document.getElementById('clearBtn');
    const resultsSection = document.getElementById('resultsSection');
    const resultsGrid = document.getElementById('resultsGrid');
    const errorMessage = document.getElementById('errorMessage');
    const searchContainer = document.getElementById('searchContainer');

    // --- Functions ---

    // Function to switch between pages (Home, About Us, Contact Us)
    const showPage = (pageName) => {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById(pageName).classList.add('active');
        
        // Show search bar only on the home page
        if (pageName === 'home') {
            searchContainer.style.display = 'flex';
        } else {
            searchContainer.style.display = 'none';
            clearResults(); // Clear search results when leaving home page
        }
    };

    // Main search function
    const searchDestinations = () => {
        const query = searchInput.value.trim().toLowerCase();
        
        resultsGrid.innerHTML = '';
        errorMessage.style.display = 'none';
        
        if (!query) {
            errorMessage.textContent = 'Please enter a destination or keyword.';
            errorMessage.style.display = 'block';
            resultsSection.style.display = 'block';
            return;
        }

        // Check if data is loaded
        if (Object.keys(travelData).length === 0) {
             errorMessage.textContent = 'Data is loading. Please wait a moment and try again.';
             errorMessage.style.display = 'block';
             resultsSection.style.display = 'block';
             return;
        }
        
        let results = [];
        const keyword = query.toLowerCase();

        // Check for keywords like 'beach', 'temple', 'country'
        if (keyword === 'beach' || keyword === 'beaches') {
            results = travelData.beaches;
        } else if (keyword === 'temple' || keyword === 'temples') {
            results = travelData.temples;
        } else if (keyword === 'country' || keyword === 'countries') {
            results = travelData.countries.flatMap(country => country.cities);
        } else {
            // Otherwise, search all destination names
            const allDestinations = [
                ...travelData.countries.flatMap(country => country.cities),
                ...travelData.temples,
                ...travelData.beaches
            ];
            results = allDestinations.filter(destination => 
                destination.name.toLowerCase().includes(keyword)
            );
        }

        if (results.length === 0) {
            errorMessage.textContent = 'No destinations found.';
            errorMessage.style.display = 'block';
        } else {
            displayResults(results);
        }
        // Show the results section
        resultsSection.style.display = 'block';
    };

    // Function to display results on the page
    const displayResults = (results) => {
        resultsGrid.innerHTML = ''; 
        results.forEach(dest => {
            const card = document.createElement('div');
            card.className = 'result-card';
            
            const timeInfo = dest.timeZone ? `<div class="time-display" id="time-${dest.id}">Loading local time...</div>` : '';
            
            card.innerHTML = `
                <img src="${dest.imageUrl}" alt="${dest.name}" onerror="this.src='https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'">
                <div class="result-card-content">
                    <h3>${dest.name}</h3>
                    <p>${dest.description}</p>
                    <button class="visit-btn">Visit</button>
                    ${timeInfo}
                </div>
            `;
            resultsGrid.appendChild(card);
            
            if (dest.timeZone) {
                displayLocalTime(dest.id, dest.timeZone);
            }
        });
    };

    // Function to display local time for a destination
    const displayLocalTime = (id, timeZone) => {
        const timeElement = document.getElementById(`time-${id}`);
        try {
            const options = { timeZone, hour12: true, weekday: 'short', hour: 'numeric', minute: 'numeric' };
            const timeString = new Date().toLocaleString('en-US', options);
            timeElement.textContent = `Local Time: ${timeString}`;
        } catch (e) {
            console.error('Invalid time zone:', timeZone);
            timeElement.textContent = 'Timezone not available.';
        }
    };

    // Function to clear search input and results
    const clearResults = () => {
        searchInput.value = '';
        resultsGrid.innerHTML = '';
        errorMessage.style.display = 'none';
        resultsSection.style.display = 'none';
    };
    
    // --- Event Listeners ---
    searchBtn.addEventListener('click', searchDestinations);
    clearBtn.addEventListener('click', clearResults);
    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            searchDestinations();
        }
    });

    // Navigation links
    document.getElementById('navHome').addEventListener('click', (e) => { e.preventDefault(); showPage('home'); });
    document.getElementById('navAbout').addEventListener('click', (e) => { e.preventDefault(); showPage('about'); });
    document.getElementById('navContact').addEventListener('click', (e) => { e.preventDefault(); showPage('contact'); });

    // Contact form submission
    document.getElementById('contactForm').addEventListener('submit', (event) => {
        event.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;
        
        if (name && email && message) {
            alert('Thank you for your message! We will get back to you soon.');
            event.target.reset();
        } else {
            alert('Please fill in all fields.');
        }
    });

    // Initialize the page view
    showPage('home');
});