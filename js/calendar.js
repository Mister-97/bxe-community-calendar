// Calendar state and navigation
let currentDate = new Date();
let today = new Date();

// Setup real-time date tracking for Central Time
function setupRealTimeDate() {
    updateCurrentTime();
    setInterval(updateCurrentTime, 60000);
    
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            updateCurrentTime();
        }
    });
}

function updateCurrentTime() {
    const now = new Date();
    const centralTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Chicago"}));
    
    const previousDay = today.getDate();
    today = centralTime;
    
    if (today.getDate() !== previousDay && 
        currentDate.getMonth() === today.getMonth() && 
        currentDate.getFullYear() === today.getFullYear()) {
        renderCalendar();
    }
    
    if (!currentDate || Math.abs(currentDate - now) > 24 * 60 * 60 * 1000) {
        currentDate = new Date(today);
    }
}

// Render calendar grid
function renderCalendar() {
    const grid = document.getElementById('calendarGrid');
    const monthYear = document.getElementById('monthYear');
    
    monthYear.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    grid.innerHTML = '';

    // Add day headers
    dayNames.forEach(day => {
        const header = document.createElement('div');
        header.className = 'day-header';
        header.textContent = day;
        grid.appendChild(header);
    });

    // Calculate first day of month and starting date
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    // Generate calendar cells (6 weeks * 7 days = 42 cells)
    for (let i = 0; i < 42; i++) {
        const cellDate = new Date(startDate);
        cellDate.setDate(startDate.getDate() + i);
        
        const dayCell = document.createElement('div');
        dayCell.className = 'calendar-day';
        
        // Mark days outside current month
        if (cellDate.getMonth() !== currentDate.getMonth()) {
            dayCell.classList.add('other-month');
        }
        
        // Mark today
        if (isSameDay(cellDate, today)) {
            dayCell.classList.add('today');
        }

        dayCell.innerHTML = `
            <div class="day-number">${cellDate.getDate()}</div>
            <div class="events"></div>
        `;

        // Add click handler for authenticated users to create events
        if (cellDate.getMonth() === currentDate.getMonth() && currentUser && userProfile) {
            dayCell.addEventListener('click', function(e) {
                if (e.target === dayCell || e.target.classList.contains('day-number')) {
                    openEventModal(cellDate);
                }
            });
        }

        // Add events for this day
        const dayEvents = getEventsForDay(cellDate);
        const eventsContainer = dayCell.querySelector('.events');
        
        dayEvents.forEach(event => {
            const eventElement = createEventElement(event);
            eventsContainer.appendChild(eventElement);
        });

        grid.appendChild(dayCell);
    }
}

// Create event element with admin controls
function createEventElement(event) {
    const eventElement = document.createElement('div');
    eventElement.className = 'event';
    eventElement.style.position = 'relative';
    eventElement.textContent = event.title;
    
    // Add admin controls if user is admin
    if (isAdmin) {
        const adminControls = document.createElement('div');
        adminControls.className = 'admin-controls';
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'admin-delete-btn';
        deleteBtn.textContent = '×';
        deleteBtn.title = 'Delete event (Admin)';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            adminDeleteEvent(event.id, event.title);
        };
        
        adminControls.appendChild(deleteBtn);
        eventElement.appendChild(adminControls);
        
        eventElement.addEventListener('mouseenter', () => {
            adminControls.classList.add('show');
        });
        eventElement.addEventListener('mouseleave', () => {
            adminControls.classList.remove('show');
        });
    }
    
    // Add click handler to show event details
    eventElement.addEventListener('click', function(e) {
        e.stopPropagation();
        showEventDetails(event);
    });

    return eventElement;
}

// Get events for a specific day
function getEventsForDay(date) {
    return events.filter(event => {
        const eventDate = new Date(event.start);
        return isSameDay(eventDate, date);
    });
}

// Check if two dates are the same day
function isSameDay(date1, date2) {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
}

// Navigation functions
function previousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
}

function goToToday() {
    currentDate = new Date(today);
    renderCalendar();
}

// Update upcoming events sidebar
function updateUpcomingEvents() {
    const container = document.getElementById('upcomingEvents');
    if (!container) {
        console.error('upcomingEvents container not found');
        return;
    }
    
    const centralTimeNow = new Date(new Date().toLocaleString("en-US", {timeZone: "America/Chicago"}));
    
    let upcomingEvents = events
        .filter(event => new Date(event.start) > centralTimeNow)
        .sort((a, b) => new Date(a.start) - new Date(b.start));

    // Apply text search filter if active
    if (currentSearchQuery) {
        const searchLower = currentSearchQuery.toLowerCase();
        upcomingEvents = upcomingEvents.filter(event => {
            const title = (event.title || '').toLowerCase();
            const description = (event.description || '').toLowerCase();
            const location = (event.location || '').toLowerCase();
            const category = (event.category || '').toLowerCase();
            
            return title.includes(searchLower) ||
                   description.includes(searchLower) ||
                   location.includes(searchLower) ||
                   category.includes(searchLower);
        });
    }

    // Apply category filter if active
    if (currentCategoryFilter) {
        upcomingEvents = upcomingEvents.filter(event => {
            return event.category === currentCategoryFilter;
        });
    }
        
    // Handle no results from filtering
    if (upcomingEvents.length === 0 && (currentSearchQuery || currentCategoryFilter)) {
        let filterMessage = '';
        if (currentSearchQuery && currentCategoryFilter) {
            filterMessage = `search "${currentSearchQuery}" in ${currentCategoryFilter}`;
        } else if (currentCategoryFilter) {
            filterMessage = `"${currentCategoryFilter}" category`;
        } else {
            filterMessage = 'search terms';
        }
        
        container.innerHTML = `
            <div class="no-events">
                <p>🔍 No events found</p>
                <p style="font-size: 12px;">No events match your ${filterMessage}</p>
            </div>
        `;
        return;
    }

    // Limit to 8 events if no filters applied
    if (!currentSearchQuery && !currentCategoryFilter) {
        upcomingEvents = upcomingEvents.slice(0, 8);
    }

    if (upcomingEvents.length === 0) {
        container.innerHTML = `
            <div class="no-events">
                <p>📅 No upcoming events</p>
                <p style="font-size: 12px;">Be the first to create an event!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = upcomingEvents.map(event => {
        const adminDeleteBtn = isAdmin ? 
            `<button class="admin-delete-btn" onclick="event.stopPropagation(); adminDeleteEvent('${event.id}', '${event.title.replace(/'/g, "\\'")}');" title="Delete event (Admin)" style="position: absolute; top: 8px; right: 8px; z-index: 10;">×</button>` : '';
        
        // Create image element or placeholder
        const imageElement = event.image_url ? 
            `<img src="${event.image_url}" class="upcoming-event-image" alt="${event.title}">` :
            `<div class="upcoming-event-placeholder">📅</div>`;
        
        // Display category if available
        const categoryDisplay = event.category ? 
            `<div class="upcoming-event-category">${event.category}</div>` : '';
        
        return `
            <div class="upcoming-event" onclick="showEventDetails(${JSON.stringify(event).replace(/"/g, '&quot;')})" style="position: relative;">
                ${adminDeleteBtn}
                <div class="upcoming-event-content">
                    <div class="upcoming-event-title" title="${event.title}">${event.title}</div>
                    ${categoryDisplay}
                    <div class="upcoming-event-date">${formatEventDate(event.start)}</div>
                    <div class="upcoming-event-creator">by ${event.created_by_name}</div>
                </div>
                ${imageElement}
            </div>
        `;
    }).join('');
}

// Category filtering functionality
let currentCategoryFilter = '';

function setupCategoryFilter() {
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function(e) {
            currentCategoryFilter = e.target.value;
            updateUpcomingEvents();
        });
    }
}