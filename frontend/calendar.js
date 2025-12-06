// Calendar component for trade date selection

class TradeCalendar {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentYear = new Date().getFullYear();
    this.startYear = 2025;
    this.selectedDate = null;
    this.months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    this.dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    this.init();
  }

  init() {
    this.render();
    this.attachEvents();
    this.setupLazyLoading();
  }

  render() {
    this.container.innerHTML = '';
    const currentYear = new Date().getFullYear();
    
    // Render years from startYear to currentYear + 50 (effectively infinite)
    for (let year = this.startYear; year <= currentYear + 50; year++) {
      const yearDiv = document.createElement('div');
      yearDiv.className = 'calendar-year';
      yearDiv.dataset.year = year;

      const yearLabel = document.createElement('div');
      yearLabel.className = 'calendar-year-label';
      yearLabel.textContent = year;

      const monthsDiv = document.createElement('div');
      monthsDiv.className = 'calendar-months';

      // Create month buttons
      for (let month = 0; month < 12; month++) {
        const monthBtn = document.createElement('div');
        monthBtn.className = 'calendar-month';
        monthBtn.textContent = this.months[month].substring(0, 3);
        monthBtn.dataset.month = month;
        monthBtn.dataset.year = year;

        monthBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.selectMonth(year, month, monthBtn);
        });

        monthsDiv.appendChild(monthBtn);
      }

      yearDiv.appendChild(yearLabel);
      yearDiv.appendChild(monthsDiv);

      yearDiv.addEventListener('click', () => {
        this.toggleYear(yearDiv);
      });

      // Expand current year by default
      if (year === currentYear) {
        yearDiv.classList.add('expanded');
      }

      this.container.appendChild(yearDiv);
    }
  }

  toggleYear(yearDiv) {
    // Close other years
    document.querySelectorAll('.calendar-year').forEach((y) => {
      if (y !== yearDiv) y.classList.remove('expanded');
    });
    yearDiv.classList.toggle('expanded');
  }

  selectMonth(year, month, monthBtn) {
    // Remove previous selection from month buttons
    document.querySelectorAll('.calendar-month.selected').forEach((m) => {
      m.classList.remove('selected');
    });

    // Add selection to clicked month
    monthBtn.classList.add('selected');

    // Create date object (1st of selected month)
    this.selectedDate = new Date(year, month, 1);

    // Generate and display full month calendar grid
    this.displayMonthGrid(year, month);

    // Dispatch custom event with selected date
    const event = new CustomEvent('dateSelected', {
      detail: {
        date: this.selectedDate,
        year,
        month,
        monthName: this.months[month],
      },
    });
    document.dispatchEvent(event);
  }

  displayMonthGrid(year, month) {
    // Create or update the calendar grid container
    let gridContainer = document.getElementById('calendarGrid');
    if (!gridContainer) {
      gridContainer = document.createElement('div');
      gridContainer.id = 'calendarGrid';
      gridContainer.className = 'calendar-grid-container';
      // Append the grid inside the calendar card to keep it visually separated
      // from the trade form. Fall back to parentElement if .closest isn't available.
      const calendarCard = this.container.closest
        ? this.container.closest('.calendar-card') || this.container.parentElement
        : this.container.parentElement;
      calendarCard.appendChild(gridContainer);
    }

    gridContainer.innerHTML = '';

    // Month title
    const title = document.createElement('div');
    title.className = 'calendar-grid-title';
    title.textContent = `${this.months[month]} ${year}`;
    gridContainer.appendChild(title);

    // Day headers (Sun-Sat)
    const daysHeaderDiv = document.createElement('div');
    daysHeaderDiv.className = 'calendar-grid-days-header';
    this.dayNames.forEach((day) => {
      const dayHeader = document.createElement('div');
      dayHeader.className = 'calendar-grid-day-header';
      dayHeader.textContent = day;
      daysHeaderDiv.appendChild(dayHeader);
    });
    gridContainer.appendChild(daysHeaderDiv);

    // Calendar grid
    const gridDiv = document.createElement('div');
    gridDiv.className = 'calendar-grid';

    // Get first day of month (0 = Sunday, 1 = Monday, etc.)
    let firstDay = new Date(year, month, 1).getDay();
    // Convert Sunday (0) to 6 for Monday-Sunday layout
    firstDay = firstDay === 0 ? 6 : firstDay - 1;
    
    // Get number of days in month
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Add empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      const emptyCell = document.createElement('div');
      emptyCell.className = 'calendar-grid-empty';
      gridDiv.appendChild(emptyCell);
    }

    // Add day cells
    for (let day = 1; day <= daysInMonth; day++) {
      const dayCell = document.createElement('div');
      dayCell.className = 'calendar-grid-day';
      dayCell.textContent = day;
      dayCell.dataset.day = day;
      dayCell.dataset.date = new Date(year, month, day).toISOString().split('T')[0];

      // Highlight today
      const today = new Date();
      if (
        day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear()
      ) {
        dayCell.classList.add('today');
      }

      dayCell.addEventListener('click', () => {
        this.selectDay(year, month, day, dayCell);
      });

      gridDiv.appendChild(dayCell);
    }

    gridContainer.appendChild(gridDiv);
  }

  selectDay(year, month, day, dayCell) {
    // Remove previous day selection
    document.querySelectorAll('.calendar-grid-day.selected').forEach((d) => {
      d.classList.remove('selected');
    });

    // Add selection to clicked day
    dayCell.classList.add('selected');

    // Update selected date
    this.selectedDate = new Date(year, month, day);

    // Dispatch day selected event
    const event = new CustomEvent('daySelected', {
      detail: {
        date: this.selectedDate,
        year,
        month,
        day,
        dateString: dayCell.dataset.date,
        monthName: this.months[month],
      },
    });
    document.dispatchEvent(event);
  }

  getSelectedDate() {
    return this.selectedDate;
  }

  setupLazyLoading() {
    // Watch for when user scrolls near the end, add more years
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.addMoreYears();
        }
      });
    });

    // Observe the last year div
    const lastYear = this.container.lastChild;
    if (lastYear) {
      observer.observe(lastYear);
    }
  }

  addMoreYears() {
    const currentYear = new Date().getFullYear();
    const lastYearElement = this.container.lastChild;
    const lastYearNumber = parseInt(lastYearElement.dataset.year);

    // Add 10 more years when user reaches the end
    for (let year = lastYearNumber + 1; year <= lastYearNumber + 10; year++) {
      const yearDiv = document.createElement('div');
      yearDiv.className = 'calendar-year';
      yearDiv.dataset.year = year;

      const yearLabel = document.createElement('div');
      yearLabel.className = 'calendar-year-label';
      yearLabel.textContent = year;

      const monthsDiv = document.createElement('div');
      monthsDiv.className = 'calendar-months';

      // Create month buttons
      for (let month = 0; month < 12; month++) {
        const monthBtn = document.createElement('div');
        monthBtn.className = 'calendar-month';
        monthBtn.textContent = this.months[month].substring(0, 3);
        monthBtn.dataset.month = month;
        monthBtn.dataset.year = year;

        monthBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.selectMonth(year, month, monthBtn);
        });

        monthsDiv.appendChild(monthBtn);
      }

      yearDiv.appendChild(yearLabel);
      yearDiv.appendChild(monthsDiv);

      yearDiv.addEventListener('click', () => {
        this.toggleYear(yearDiv);
      });

      this.container.appendChild(yearDiv);
    }

    // Re-observe the new last year
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.addMoreYears();
        }
      });
    });

    const newLastYear = this.container.lastChild;
    if (newLastYear) {
      observer.observe(newLastYear);
    }
  }
}

// Initialize calendar when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const calendar = new TradeCalendar('calendarContainer');

  // Listen for day selection
  document.addEventListener('daySelected', (e) => {
    console.log('Day selected:', e.detail);
  });

  // Listen for month selection
  document.addEventListener('dateSelected', (e) => {
    console.log('Month selected:', e.detail);
  });
});

