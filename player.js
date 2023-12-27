    var videoPlayer = document.getElementById('videoPlayer');
    var videoDetailsOverlay = document.getElementById('videoDetailsOverlay');
    var videoContainer = document.getElementById('videoContainer');
    var webpageTitle = document.getElementById('webpageTitle');
    var fileInput = document.getElementById('fileInput');
    var selectButton = document.querySelector('.select-button');
    var clicks = 0;

    function selectVideo() {
      fileInput.click();
    }

    function loadVideoFromLocal() {
      var selectedFile = fileInput.files[0];
      if (selectedFile) {
        changeVideo(selectedFile);
      }
    }

    function changeVideo(selectedFile) {
      videoPlayer.src = URL.createObjectURL(selectedFile);
      videoPlayer.playbackRate = 1.0; // Reset playback rate to normal
      videoPlayer.volume = 1.0; // Reset volume to full
      showVideoDetailsOverlay();
      var videoTitle = selectedFile.name.replace(/\.[^/.]+$/, ''); // Remove file extension
      webpageTitle.innerText = videoTitle;
    }

    // Keyboard shortcuts


document.addEventListener('keydown', function(event) {
  // Prevent default behavior for arrow keys and spacebar
  if (['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', ' '].includes(event.key)) {
    event.preventDefault();
  }
      if (event.key === ']') {
        videoPlayer.playbackRate += 0.1;
        showVideoDetailsOverlay();
      } else if (event.key === '[') {
        videoPlayer.playbackRate -= 0.1;
        showVideoDetailsOverlay();
      } else if (event.key === 't') {
        showVideoDetailsOverlay();
      } else if (event.key === 'ArrowRight') {
        videoPlayer.currentTime += 5;
        showVideoDetailsOverlay();
      } else if (event.key === 'ArrowLeft') {
        videoPlayer.currentTime -= 5;
        showVideoDetailsOverlay();
      } else if (event.key === 'ArrowUp') {
        videoPlayer.volume += 0.1;
        showVideoDetailsOverlay();
      } else if (event.key === 'ArrowDown') {
        videoPlayer.volume -= 0.1;
        showVideoDetailsOverlay();
      } else if (event.key === 'k' || event.key === ' ') {
        togglePlayPause();
        showVideoDetailsOverlay();
      } else if (event.key === 'f') {
        toggleFullScreen();
      } else if (event.key === 'i') {
        togglePictureInPicture();
      } else if (event.key === 'Backspace') {
        videoPlayer.playbackRate = 1.0; // Reset playback rate to normal
        showVideoDetailsOverlay();
      } else if (event.ctrlKey && event.key === 'z') {
        selectVideo();
      } else if (event.ctrlKey && event.key === 'c') {
        toggleVideoControls();
      } else if (event.altKey && event.key === 'n') {
        selectVideo();
      }
    });

    // Toggle play/pause
    function togglePlayPause() {
      if (videoPlayer.paused) {
        videoPlayer.play();
      } else {
        videoPlayer.pause();
      }
    }

    // Toggle full-screen mode
    function toggleFullScreen() {
      if (document.fullscreenElement) {
        document.exitFullscreen();
        videoContainer.classList.remove('full-screen'); // Remove full-screen class
      } else {
        if (videoContainer.requestFullscreen) {
          videoContainer.requestFullscreen();
        }
        videoContainer.classList.add('full-screen'); // Add full-screen class
      }
    }

    // Toggle Picture-in-Picture mode
    function togglePictureInPicture() {
      if (videoPlayer.readyState >= 2) {
        if (document.pictureInPictureElement) {
          document.exitPictureInPicture();
        } else {
          videoPlayer.requestPictureInPicture();
        }
      }
    }

    // Toggle HTML5 video controls
    function toggleVideoControls() {
      videoPlayer.controls = !videoPlayer.controls;
    }






    // Show video details overlay
    function showVideoDetailsOverlay() {
      videoDetailsOverlay.style.opacity = 1;
      var duration = formatTime(videoPlayer.duration);
      var currentTime = formatTime(videoPlayer.currentTime);
      var remainingTime = formatTime(videoPlayer.duration - videoPlayer.currentTime);
      var speed = Math.round(videoPlayer.playbackRate * 100);
      var volume = Math.round(videoPlayer.volume * 100);
      videoDetailsOverlay.innerText =
        `Duration: ${duration}\n` +
        `Current Time: ${currentTime}\n` +
        `Remaining Time: ${remainingTime}\n` +
        `Speed: ${speed}%\n` +
        `Volume: ${volume}%`;
      setTimeout(function() {
        videoDetailsOverlay.style.opacity = 0;
      }, 2000); // Hide details overlay after 2 seconds
    }






    // Format time in "hour:minute:second" format
    function formatTime(timeInSeconds) {
      var hours = Math.floor(timeInSeconds / 3600);
      var minutes = Math.floor((timeInSeconds % 3600) / 60);
      var seconds = Math.floor(timeInSeconds % 60);
      return (hours > 0 ? hours + ':' : '') + (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
    }

    // Hide the "Select Video" button after clicking anywhere on the screen three times
    document.addEventListener('click', function() {
      clicks++;
      if (clicks === 3) {
        selectButton.classList.add('hide-button');
        clicks = 0;
      }
    });



// Function to handle fullscreen change
function handleFullscreenChange() {
  if (document.fullscreenElement || document.webkitFullscreenElement ||
      document.mozFullScreenElement || document.msFullscreenElement) {
    // Entered fullscreen
    videoContainer.classList.add('full-screen'); // Add full-screen class
    videoDetailsOverlay.classList.add('full-screen-overlay'); // Add full-screen overlay class
  } else {
    // Exited fullscreen
    videoContainer.classList.remove('full-screen'); // Remove full-screen class
    videoDetailsOverlay.classList.remove('full-screen-overlay'); // Remove full-screen overlay class
    showVideoDetailsOverlay(); // Show overlay when exiting fullscreen
  }
}

// Event listener for fullscreen change
document.addEventListener('fullscreenchange', handleFullscreenChange);
document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
document.addEventListener('mozfullscreenchange', handleFullscreenChange);
document.addEventListener('MSFullscreenChange', handleFullscreenChange);
