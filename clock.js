  // Function to update the digital clock
function updateClock() {
    const clock = document.getElementById('clock');
    const time = document.getElementById('time');
    const currentTime = new Date();
    const hours = currentTime.getHours().toString().padStart(2, '0');
    const minutes = currentTime.getMinutes().toString().padStart(2, '0');
    const seconds = currentTime.getSeconds().toString().padStart(2, '0');
    const formattedTime = `${hours}:${minutes}:${seconds}`;
    time.textContent = formattedTime;
}

// Function to show/hide the clock
function toggleClock() {
    const clock = document.getElementById('clock');
    clock.classList.toggle('active');
}

// Event listener to toggle the clock when "c" key is pressed
document.addEventListener('keydown', function(event) {
    if (event.key === 'C') {
        toggleClock();
    }
});

// Update the clock every second
setInterval(updateClock, 1000);

// Initial call to updateClock to display the time immediately
updateClock();