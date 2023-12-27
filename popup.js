// Check if the feature popup should be displayed
if (!localStorage.getItem('featurePopupShown')) {
    showPopup('featurePopup');
    localStorage.setItem('featurePopupShown', 'true');
}

// Listen for the 'u' key press to show the key popup
// and Enter key press to close the popups
document.addEventListener('keydown', function(event) {
    if (event.key === 'u') {
        showPopup('keyPopup');
    } else if (event.key === 'Enter') {
        closePopup('featurePopup');
        closePopup('keyPopup');
    }
});

// Function to display a popup
function showPopup(popupId) {
    document.getElementById(popupId).style.display = 'block';
}

// Function to close a popup
function closePopup(popupId) {
    document.getElementById(popupId).style.display = 'none';
}

// Function to get an item from localStorage
function getItemFromLocalStorage(key) {
    return localStorage.getItem(key);
}

// Function to set an item in localStorage
function setItemInLocalStorage(key, value) {
    localStorage.setItem(key, value);
}
