export class CalendarWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.config = {
      showWeekNumbers: false,
      startOfWeek: 0, // 0 = Sunday, 1 = Monday
      highlightToday: true,
      showEvents: true,
      events: [], // Array of event objects {date, title, color}
      monthNames: ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December'],
      dayNames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      ...this.config
    };
    this.currentDate = new Date();
    this.today = new Date();
  }

  connectedCallback() {
    // Override config with any passed configuration
    if (this.hasAttribute('config')) {
      try {
        const configAttr = JSON.parse(this.getAttribute('config'));
        this.config = { ...this.config, ...configAttr };
      } catch (e) {
        console.warn('CalendarWidget: Invalid config attribute');
      }
    }

    this.render();
  }

  previousMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.render();
  }

  nextMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.render();
  }

  goToToday() {
    this.currentDate = new Date();
    this.render();
  }

  getDaysInMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }

  getFirstDayOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  }

  getEventsForDate(date) {
    const dateStr = date.toISOString().split('T')[0];
    return this.config.events.filter(event => 
      event.date === dateStr || 
      (event.date && event.date.startsWith(dateStr))
    );
  }

  isToday(date) {
    return date.toDateString() === this.today.toDateString();
  }

  isSameMonth(date) {
    return date.getMonth() === this.currentDate.getMonth() && 
           date.getFullYear() === this.currentDate.getFullYear();
  }

  generateCalendarDays() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const daysInMonth = this.getDaysInMonth(this.currentDate);
    const firstDay = this.getFirstDayOfMonth(this.currentDate);
    
    const days = [];
    
    // Add days from previous month
    const prevMonth = new Date(year, month - 1, 1);
    const daysInPrevMonth = this.getDaysInMonth(prevMonth);
    const startDay = (firstDay - this.config.startOfWeek + 7) % 7;
    
    for (let i = startDay - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, daysInPrevMonth - i);
      days.push({
        date,
        day: date.getDate(),
        isCurrentMonth: false,
        events: this.getEventsForDate(date)
      });
    }
    
    // Add days from current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({
        date,
        day,
        isCurrentMonth: true,
        events: this.getEventsForDate(date)
      });
    }
    
    // Add days from next month to fill the grid
    const totalCells = Math.ceil(days.length / 7) * 7;
    let nextMonthDay = 1;
    while (days.length < totalCells) {
      const date = new Date(year, month + 1, nextMonthDay);
      days.push({
        date,
        day: nextMonthDay,
        isCurrentMonth: false,
        events: this.getEventsForDate(date)
      });
      nextMonthDay++;
    }
    
    return days;
  }

  render() {
    const calendarDays = this.generateCalendarDays();
    const monthYear = `${this.config.monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
    
    // Adjust day names based on start of week
    const dayNames = [...this.config.dayNames];
    if (this.config.startOfWeek === 1) {
      dayNames.push(dayNames.shift()); // Move Sunday to end
    }
    
    this.shadowRoot.innerHTML = `
      <style>
        .calendar-widget {
          display: flex;
          flex-direction: column;
          background: linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%);
          color: white;
          border-radius: 12px;
          padding: 1rem;
          height: 100%;
          box-sizing: border-box;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          position: relative;
          overflow: hidden;
        }
        
        .calendar-widget::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          z-index: 0;
        }
        
        .content {
          position: relative;
          z-index: 1;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .title {
          font-size: 1.2rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .nav-controls {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }
        
        .nav-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
          transition: background 0.2s;
        }
        
        .nav-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        
        .month-year {
          font-size: 1rem;
          font-weight: 500;
          margin: 0 0.5rem;
          min-width: 120px;
          text-align: center;
        }
        
        .calendar-grid {
          flex: 1;
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 1px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          overflow: hidden;
        }
        
        .day-header {
          background: rgba(255, 255, 255, 0.2);
          padding: 0.5rem 0.2rem;
          text-align: center;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
        }
        
        .calendar-day {
          background: rgba(255, 255, 255, 0.05);
          padding: 0.3rem;
          text-align: center;
          font-size: 0.9rem;
          position: relative;
          cursor: pointer;
          transition: background 0.2s;
          min-height: 2.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
        }
        
        .calendar-day:hover {
          background: rgba(255, 255, 255, 0.15);
        }
        
        .calendar-day.other-month {
          opacity: 0.4;
        }
        
        .calendar-day.today {
          background: rgba(255, 255, 255, 0.3);
          font-weight: bold;
        }
        
        .calendar-day.today::before {
          content: '';
          position: absolute;
          top: 2px;
          right: 2px;
          width: 6px;
          height: 6px;
          background: #00b894;
          border-radius: 50%;
        }
        
        .day-number {
          font-size: 0.8rem;
          margin-bottom: 0.2rem;
        }
        
        .events {
          display: flex;
          flex-direction: column;
          gap: 1px;
          width: 100%;
        }
        
        .event {
          background: rgba(255, 255, 255, 0.8);
          color: #333;
          font-size: 0.6rem;
          padding: 1px 2px;
          border-radius: 2px;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
          max-width: 100%;
        }
        
        .event.color-red { background: #ff6b6b; color: white; }
        .event.color-blue { background: #74b9ff; color: white; }
        .event.color-green { background: #00b894; color: white; }
        .event.color-yellow { background: #fdcb6e; color: #333; }
        .event.color-purple { background: #a29bfe; color: white; }
        
        .today-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          border-radius: 16px;
          padding: 0.3rem 0.8rem;
          color: white;
          cursor: pointer;
          font-size: 0.8rem;
          transition: background 0.2s;
        }
        
        .today-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      </style>
      <div class="calendar-widget">
        <div class="content">
          <div class="header">
            <div class="title">
              📅 Calendar
            </div>
            <div class="nav-controls">
              <button class="nav-btn" onclick="this.getRootNode().host.previousMonth()">‹</button>
              <div class="month-year">${monthYear}</div>
              <button class="nav-btn" onclick="this.getRootNode().host.nextMonth()">›</button>
              <button class="today-btn" onclick="this.getRootNode().host.goToToday()">Today</button>
            </div>
          </div>
          <div class="calendar-grid">
            ${dayNames.map(day => `
              <div class="day-header">${day}</div>
            `).join('')}
            ${calendarDays.map(dayData => `
              <div class="calendar-day ${!dayData.isCurrentMonth ? 'other-month' : ''} ${this.isToday(dayData.date) ? 'today' : ''}">
                <div class="day-number">${dayData.day}</div>
                ${this.config.showEvents && dayData.events.length > 0 ? `
                  <div class="events">
                    ${dayData.events.slice(0, 3).map(event => `
                      <div class="event ${event.color ? `color-${event.color}` : ''}" title="${event.title}">
                        ${event.title}
                      </div>
                    `).join('')}
                    ${dayData.events.length > 3 ? `
                      <div class="event">+${dayData.events.length - 3} more</div>
                    ` : ''}
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // Widget contract methods
  init(config) {
    this.config = { ...this.config, ...config };
    this.render();
  }

  refresh() {
    this.render();
  }

  destroy() {
    // No cleanup needed for calendar
  }
}

customElements.define('calendar-widget', CalendarWidget); 