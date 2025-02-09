class PrayerTracker {
    constructor() {
        this.prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
        this.currentDate = new Date();
        this.init();
        this.setupMonthlyAutoUpdate();
        this.setupThemeToggle();
    }

    setupThemeToggle() {
        const theme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', theme);
        const themeToggle = document.getElementById('theme-toggle');
        const toggleIcon = themeToggle.querySelector('i');
        
        this.updateThemeIcon(toggleIcon, theme);
        
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            this.updateThemeIcon(toggleIcon, newTheme);
        });
    }

    updateThemeIcon(icon, theme) {
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    init() {
        this.setupNavigationControls();
        this.updateDateDisplay();
        this.generateCalendar();
        this.loadPrayerStatus();
        this.setupEventListeners();
        this.fetchPrayerTimes();
    }

    setupNavigationControls() {
        const header = document.querySelector('header');
        const nav = document.createElement('div');
        nav.className = 'month-navigation mb-4';
        nav.innerHTML = `
            <button class="btn btn-outline-primary" id="prevMonth">
                <i class="fas fa-chevron-left"></i>
            </button>
            <span class="mx-3" id="current-date"></span>
            <button class="btn btn-outline-primary" id="nextMonth">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;
        header.appendChild(nav);

        document.getElementById('prevMonth').addEventListener('click', () => this.changeMonth(-1));
        document.getElementById('nextMonth').addEventListener('click', () => this.changeMonth(1));
    }

    changeMonth(delta) {
        this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + delta, 1);
        this.updateDateDisplay();
        this.generateCalendar();
        this.loadPrayerStatus();
        this.fetchPrayerTimes();
    }

    setupMonthlyAutoUpdate() {
        setInterval(() => {
            const now = new Date();
            if (now.getMonth() !== this.currentDate.getMonth()) {
                this.currentDate = now;
                this.init();
            }
        }, 60000);
    }

    updateDateDisplay() {
        const options = { 
            year: 'numeric', 
            month: 'long'
        };
        document.getElementById('current-date').textContent = 
            this.currentDate.toLocaleDateString('en-US', options);
    }

    generateCalendar() {
        const calendarGrid = document.getElementById('calendar-grid');
        calendarGrid.innerHTML = '';
        const daysInMonth = new Date(
            this.currentDate.getFullYear(),
            this.currentDate.getMonth() + 1,
            0
        ).getDate();

        for (let day = 1; day <= daysInMonth; day++) {
            const dateBox = this.createDateBox(day);
            calendarGrid.appendChild(dateBox);
            dateBox.style.animationDelay = `${day * 0.05}s`;
        }
    }

    createDateBox(day) {
        const dateBox = document.createElement('div');
        dateBox.className = 'date-box';
        dateBox.innerHTML = `
            <div class="date-header">
                <span class="date-number">${day}</span>
                <div class="bulk-actions">
                    <button class="complete-all-btn" data-day="${day}">
                        <i class="fas fa-check"></i> All
                    </button>
                    <button class="cross-all-btn" data-day="${day}">
                        <i class="fas fa-times"></i> All
                    </button>
                </div>
            </div>
            <div class="prayer-list">
                ${this.prayers.map(prayer => `
                    <div class="prayer-item" data-date="${day}" data-prayer="${prayer.toLowerCase()}">
                        <div class="prayer-name">
                            <i class="fas ${this.getPrayerIcon(prayer)} prayer-icon"></i>
                            ${prayer}
                        </div>
                        <div class="prayer-actions">
                            <button class="cross-btn" data-day="${day}" data-prayer="${prayer.toLowerCase()}">
                                <i class="fas fa-times"></i>
                            </button>
                            <div class="prayer-check">
                                <input type="checkbox" class="prayer-checkbox" 
                                       id="prayer-${day}-${prayer.toLowerCase()}"
                                       data-day="${day}" 
                                       data-prayer="${prayer.toLowerCase()}">
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        return dateBox;
    }

    getPrayerIcon(prayer) {
        return prayer === 'Fajr' || prayer === 'Dhuhr' || prayer === 'Asr' 
            ? 'fa-sun' 
            : 'fa-moon';
    }

    getStorageKey(day) {
        return `prayers_${this.currentDate.getFullYear()}_${this.currentDate.getMonth() + 1}_${day}`;
    }

    loadPrayerStatus() {
        const checkboxes = document.querySelectorAll('.prayer-checkbox');
        checkboxes.forEach(checkbox => {
            const day = checkbox.dataset.day;
            const prayer = checkbox.dataset.prayer;
            const savedPrayers = JSON.parse(localStorage.getItem(this.getStorageKey(day)) || '{}');

            if (savedPrayers[prayer]) {
                checkbox.checked = true;
                checkbox.closest('.prayer-item').classList.add('completed');
            }
        });
    }

    setupEventListeners() {
        document.querySelectorAll('.complete-all-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const day = e.target.closest('.complete-all-btn').dataset.day;
                const prayers = document.querySelectorAll(`.prayer-item[data-date="${day}"]`);
                prayers.forEach(prayer => {
                    const checkbox = prayer.querySelector('.prayer-checkbox');
                    checkbox.checked = true;
                    prayer.classList.add('completed');
                    prayer.classList.remove('not-offered');
                    this.updatePrayerStatus(day, prayer.dataset.prayer, true);
                });
            });
        });

        document.querySelectorAll('.cross-all-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const day = e.target.closest('.cross-all-btn').dataset.day;
                const prayers = document.querySelectorAll(`.prayer-item[data-date="${day}"]`);
                prayers.forEach(prayer => {
                    const checkbox = prayer.querySelector('.prayer-checkbox');
                    checkbox.checked = false;
                    prayer.classList.remove('completed');
                    prayer.classList.add('not-offered');
                    this.updatePrayerStatus(day, prayer.dataset.prayer, false);
                });
            });
        });

        document.querySelectorAll('.prayer-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const day = e.target.dataset.day;
                const prayer = e.target.dataset.prayer;
                const completed = e.target.checked;
                const prayerItem = e.target.closest('.prayer-item');

                this.updatePrayerStatus(day, prayer, completed);
                prayerItem.classList.toggle('completed', completed);
                prayerItem.classList.remove('not-offered');
            });
        });

        document.querySelectorAll('.cross-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const prayerItem = e.target.closest('.prayer-item');
                const day = btn.dataset.day;
                const prayer = btn.dataset.prayer;
                const checkbox = document.getElementById(`prayer-${day}-${prayer}`);
                
                if (checkbox) {
                    checkbox.checked = false;
                    this.updatePrayerStatus(day, prayer, false);
                    prayerItem.classList.remove('completed');
                    prayerItem.classList.toggle('not-offered');
                }
            });
        });
    }

    updatePrayerStatus(day, prayer, completed) {
        const storageKey = this.getStorageKey(day);
        let prayers = JSON.parse(localStorage.getItem(storageKey) || '{}');
        prayers[prayer] = completed;
        localStorage.setItem(storageKey, JSON.stringify(prayers));
    }

    async fetchPrayerTimes() {
        try {
            const response = await fetch('/prayer-times');
            const prayerTimes = await response.json();
            this.prayerTimes = prayerTimes;
        } catch (error) {
            console.error('Error fetching prayer times:', error);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PrayerTracker();
});

