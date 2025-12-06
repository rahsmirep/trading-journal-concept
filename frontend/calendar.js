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
    this.init();
  }

  init() {
    this.render();
    this.attachEvents();
  }

  render() {
    this.container.innerHTML = '';
    const currentYear = new Date().getFullYear();
    
    // Render years from startYear to currentYear + 5
    for (let year = this.startYear; year <= currentYear + 5; year++) {
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
    // Remove previous selection
    document.querySelectorAll('.calendar-month.selected').forEach((m) => {
      m.classList.remove('selected');
    });

    // Add selection to clicked month
    monthBtn.classList.add('selected');

    // Create date object (1st of selected month)
    this.selectedDate = new Date(year, month, 1);

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

  getSelectedDate() {
    return this.selectedDate;
  }
}

// Initialize calendar when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const calendar = new TradeCalendar('calendarContainer');

  // Listen for date selection and optionally populate a hidden field
  document.addEventListener('dateSelected', (e) => {
    console.log('Date selected:', e.detail);
    // You can use this to populate a date field or update the form
  });
});
