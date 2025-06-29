/**
 * Scene Scheduler Component for LumaBoard
 * Handles time-based scene switching and advanced scheduling
 */
export class SceneScheduler {
  constructor(sceneEngine, config = {}) {
    this.sceneEngine = sceneEngine;
    this.config = {
      enabled: config.enabled !== false,
      timezone: config.timezone || 'local',
      defaultDuration: config.defaultDuration || 30, // seconds
      transitionDuration: config.transitionDuration || 1000, // milliseconds
      schedules: config.schedules || [],
      ...config
    };
    
    this.currentSchedule = null;
    this.scheduleTimer = null;
    this.nextScheduleTimer = null;
    this.isActive = false;
    
    this.init();
  }

  /**
   * Initialize the scheduler
   */
  init() {
    if (!this.config.enabled) {
      console.log('SceneScheduler: Disabled in configuration');
      return;
    }
    
    this.start();
  }

  /**
   * Start the scheduler
   */
  start() {
    if (this.isActive) return;
    
    this.isActive = true;
    this.checkCurrentSchedule();
    this.scheduleNextCheck();
    
    console.log('SceneScheduler: Started');
  }

  /**
   * Stop the scheduler
   */
  stop() {
    if (!this.isActive) return;
    
    this.isActive = false;
    this.clearTimers();
    this.currentSchedule = null;
    
    console.log('SceneScheduler: Stopped');
  }

  /**
   * Check what schedule should be active now
   */
  checkCurrentSchedule() {
    if (!this.isActive) return;
    
    const now = new Date();
    const activeSchedule = this.findActiveSchedule(now);
    
    if (activeSchedule !== this.currentSchedule) {
      this.switchToSchedule(activeSchedule);
    }
  }

  /**
   * Find the active schedule for a given time
   */
  findActiveSchedule(time) {
    if (!this.config.schedules || this.config.schedules.length === 0) {
      return null;
    }
    
    const timeInfo = this.getTimeInfo(time);
    
    // Sort schedules by priority (higher priority first)
    const sortedSchedules = [...this.config.schedules].sort((a, b) => 
      (b.priority || 0) - (a.priority || 0)
    );
    
    for (const schedule of sortedSchedules) {
      if (this.isScheduleActive(schedule, timeInfo)) {
        return schedule;
      }
    }
    
    return null;
  }

  /**
   * Check if a schedule is active for the given time
   */
  isScheduleActive(schedule, timeInfo) {
    // Check if schedule is enabled
    if (schedule.enabled === false) {
      return false;
    }
    
    // Check date range
    if (!this.isInDateRange(schedule, timeInfo.date)) {
      return false;
    }
    
    // Check day of week
    if (!this.isValidDayOfWeek(schedule, timeInfo.dayOfWeek)) {
      return false;
    }
    
    // Check time range
    if (!this.isInTimeRange(schedule, timeInfo.time)) {
      return false;
    }
    
    return true;
  }

  /**
   * Check if current date is in schedule's date range
   */
  isInDateRange(schedule, date) {
    if (!schedule.dateRange) return true;
    
    const { start, end } = schedule.dateRange;
    
    if (start && date < new Date(start)) return false;
    if (end && date > new Date(end)) return false;
    
    return true;
  }

  /**
   * Check if current day of week is valid for schedule
   */
  isValidDayOfWeek(schedule, dayOfWeek) {
    if (!schedule.daysOfWeek) return true;
    
    return schedule.daysOfWeek.includes(dayOfWeek);
  }

  /**
   * Check if current time is in schedule's time range
   */
  isInTimeRange(schedule, time) {
    if (!schedule.timeRange) return true;
    
    const { start, end } = schedule.timeRange;
    
    if (start && time < start) return false;
    if (end && time > end) return false;
    
    return true;
  }

  /**
   * Get time information for scheduling
   */
  getTimeInfo(date) {
    // Convert to target timezone if specified
    const targetDate = this.config.timezone === 'local' ? 
      date : this.convertToTimezone(date, this.config.timezone);
    
    return {
      date: targetDate,
      dayOfWeek: targetDate.getDay(), // 0 = Sunday, 1 = Monday, etc.
      time: this.formatTime(targetDate),
      hour: targetDate.getHours(),
      minute: targetDate.getMinutes()
    };
  }

  /**
   * Format time as HH:MM for comparison
   */
  formatTime(date) {
    return date.toTimeString().slice(0, 5); // "HH:MM"
  }

  /**
   * Convert date to specified timezone (simplified)
   */
  convertToTimezone(date, timezone) {
    // This is a simplified implementation
    // In production, you'd want to use a library like date-fns-tz or moment-timezone
    try {
      return new Date(date.toLocaleString("en-US", { timeZone: timezone }));
    } catch (error) {
      console.warn(`SceneScheduler: Invalid timezone '${timezone}', using local time`);
      return date;
    }
  }

  /**
   * Switch to a new schedule
   */
  switchToSchedule(schedule) {
    const previousSchedule = this.currentSchedule;
    this.currentSchedule = schedule;
    
    if (schedule) {
      console.log(`SceneScheduler: Switching to schedule '${schedule.name}'`);
      this.applySchedule(schedule);
    } else {
      console.log('SceneScheduler: No active schedule, using default behavior');
      this.applyDefaultBehavior();
    }
    
    // Emit schedule change event
    this.emitScheduleChange(previousSchedule, schedule);
  }

  /**
   * Apply a schedule configuration
   */
  applySchedule(schedule) {
    if (!this.sceneEngine) return;
    
    // Apply scene configuration
    if (schedule.scenes && schedule.scenes.length > 0) {
      this.sceneEngine.loadScenes(schedule.scenes);
      this.sceneEngine.goToScene(0);
    }
    
    // Apply rotation settings
    if (schedule.rotation) {
      if (schedule.rotation.enabled) {
        const interval = schedule.rotation.interval || this.config.defaultDuration;
        this.sceneEngine.startRotation(interval);
      } else {
        this.sceneEngine.stopRotation();
      }
    }
    
    // Apply specific scene if defined
    if (schedule.sceneIndex !== undefined) {
      this.sceneEngine.goToScene(schedule.sceneIndex);
    }
  }

  /**
   * Apply default behavior when no schedule is active
   */
  applyDefaultBehavior() {
    // This could load default scenes or maintain current state
    // Implementation depends on desired behavior
    console.log('SceneScheduler: Applying default behavior');
  }

  /**
   * Schedule the next check
   */
  scheduleNextCheck() {
    if (!this.isActive) return;
    
    const nextCheckTime = this.calculateNextCheckTime();
    const delay = nextCheckTime - Date.now();
    
    this.nextScheduleTimer = setTimeout(() => {
      this.checkCurrentSchedule();
      this.scheduleNextCheck();
    }, Math.max(delay, 1000)); // At least 1 second delay
    
    console.log(`SceneScheduler: Next check in ${Math.round(delay / 1000)}s`);
  }

  /**
   * Calculate when the next schedule check should occur
   */
  calculateNextCheckTime() {
    const now = new Date();
    const nextMinute = new Date(now);
    nextMinute.setSeconds(0, 0);
    nextMinute.setMinutes(nextMinute.getMinutes() + 1);
    
    // Find the next schedule change time
    let nextChangeTime = nextMinute;
    
    for (const schedule of this.config.schedules) {
      if (!schedule.timeRange) continue;
      
      const scheduleStartTime = this.getNextScheduleTime(schedule.timeRange.start, now);
      const scheduleEndTime = this.getNextScheduleTime(schedule.timeRange.end, now);
      
      if (scheduleStartTime && scheduleStartTime < nextChangeTime) {
        nextChangeTime = scheduleStartTime;
      }
      
      if (scheduleEndTime && scheduleEndTime < nextChangeTime) {
        nextChangeTime = scheduleEndTime;
      }
    }
    
    return nextChangeTime;
  }

  /**
   * Get the next occurrence of a specific time
   */
  getNextScheduleTime(timeString, fromDate) {
    if (!timeString) return null;
    
    const [hours, minutes] = timeString.split(':').map(Number);
    const nextTime = new Date(fromDate);
    nextTime.setHours(hours, minutes, 0, 0);
    
    // If the time has already passed today, move to tomorrow
    if (nextTime <= fromDate) {
      nextTime.setDate(nextTime.getDate() + 1);
    }
    
    return nextTime;
  }

  /**
   * Clear all timers
   */
  clearTimers() {
    if (this.scheduleTimer) {
      clearTimeout(this.scheduleTimer);
      this.scheduleTimer = null;
    }
    
    if (this.nextScheduleTimer) {
      clearTimeout(this.nextScheduleTimer);
      this.nextScheduleTimer = null;
    }
  }

  /**
   * Emit schedule change event
   */
  emitScheduleChange(previousSchedule, currentSchedule) {
    const event = new CustomEvent('schedulechange', {
      detail: {
        previous: previousSchedule,
        current: currentSchedule,
        timestamp: Date.now()
      }
    });
    
    document.dispatchEvent(event);
  }

  /**
   * Get current schedule information
   */
  getCurrentScheduleInfo() {
    return {
      isActive: this.isActive,
      currentSchedule: this.currentSchedule,
      nextCheckTime: this.nextScheduleTimer ? 
        Date.now() + (this.nextScheduleTimer._idleTimeout || 0) : null,
      timezone: this.config.timezone,
      scheduleCount: this.config.schedules.length
    };
  }

  /**
   * Add a new schedule
   */
  addSchedule(schedule) {
    if (!schedule.name) {
      throw new Error('Schedule must have a name');
    }
    
    this.config.schedules.push(schedule);
    
    // Recheck current schedule
    if (this.isActive) {
      this.checkCurrentSchedule();
    }
    
    console.log(`SceneScheduler: Added schedule '${schedule.name}'`);
  }

  /**
   * Remove a schedule by name
   */
  removeSchedule(name) {
    const index = this.config.schedules.findIndex(s => s.name === name);
    
    if (index !== -1) {
      this.config.schedules.splice(index, 1);
      
      // Recheck current schedule
      if (this.isActive) {
        this.checkCurrentSchedule();
      }
      
      console.log(`SceneScheduler: Removed schedule '${name}'`);
      return true;
    }
    
    return false;
  }

  /**
   * Update scheduler configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    
    if (this.isActive) {
      this.checkCurrentSchedule();
    }
  }

  /**
   * Get all schedules
   */
  getSchedules() {
    return [...this.config.schedules];
  }

  /**
   * Destroy the scheduler
   */
  destroy() {
    this.stop();
    this.sceneEngine = null;
    this.config = null;
  }
}

/**
 * Example schedule configurations
 */
export const exampleSchedules = {
  businessHours: {
    name: 'Business Hours',
    priority: 1,
    enabled: true,
    timeRange: {
      start: '09:00',
      end: '17:00'
    },
    daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
    scenes: [
      {
        name: 'Business Dashboard',
        layout: '2x2',
        widgets: [
          { type: 'clock', position: 0 },
          { type: 'weather', position: 1 },
          { type: 'news', position: 2 },
          { type: 'stocks', position: 3 }
        ]
      }
    ],
    rotation: {
      enabled: true,
      interval: 60
    }
  },
  
  afterHours: {
    name: 'After Hours',
    priority: 0,
    enabled: true,
    timeRange: {
      start: '17:01',
      end: '08:59'
    },
    scenes: [
      {
        name: 'Relaxed Display',
        layout: 'single',
        widgets: [
          { type: 'image-slideshow', position: 0 }
        ]
      }
    ],
    rotation: {
      enabled: false
    }
  },
  
  weekend: {
    name: 'Weekend Mode',
    priority: 2,
    enabled: true,
    daysOfWeek: [0, 6], // Sunday and Saturday
    scenes: [
      {
        name: 'Weekend Info',
        layout: '2x2',
        widgets: [
          { type: 'clock', position: 0 },
          { type: 'weather', position: 1 },
          { type: 'calendar', position: 2 },
          { type: 'youtube', position: 3 }
        ]
      }
    ],
    rotation: {
      enabled: true,
      interval: 120
    }
  }
}; 