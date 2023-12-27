// additional.js

var playlist = [];

function handleFileSelect(event) {
  const selectedFiles = event.target.files;
  if (selectedFiles.length > 0) {
    // Add selected files to the playlist array
    playlist = Array.from(selectedFiles).sort((a, b) => a.name.localeCompare(b.name));
    updatePlaylist();
    changeVideo(playlist[0]);
  }
}

function updatePlaylist() {
  const playlistContainer = document.getElementById('playlistContainer');
  playlistContainer.innerHTML = '';
  playlist.forEach((file, index) => {
    const listItem = document.createElement('div');
    listItem.innerText = `${index + 1}. ${file.name}`;
    listItem.addEventListener('click', () => changeVideo(file));
    playlistContainer.appendChild(listItem);
  });
}

function changeVideo(selectedFile) {
  videoPlayer.src = URL.createObjectURL(selectedFile);
  videoPlayer.playbackRate = 1.0;
  videoPlayer.volume = 1.0;
  showVideoDetailsOverlay();
  webpageTitle.innerText = selectedFile.name.replace(/\.[^/.]+$/, '');
}

function toggleSidebar() {
  const playlistContainer = document.getElementById('playlistContainer');
  playlistContainer.classList.toggle('hidden');
}

document.addEventListener('keydown', function(event) {
  if (event.key === 'd') {
    toggleSidebar();
  }
});

document.addEventListener('wheel', function(event) {
  const videoWidth = videoContainer.offsetWidth;
  if (event.deltaY > 0 && event.clientX <= videoWidth * 0.4) {
    // Scroll down in the left side (0%-40% width) to adjust playback speed by -0.1
    videoPlayer.playbackRate -= 0.1;
    showVideoDetailsOverlay();
  } else if (event.deltaY < 0 && event.clientX <= videoWidth * 0.4) {
    // Scroll up in the left side (0%-40% width) to adjust playback speed by +0.1
    videoPlayer.playbackRate += 0.1;
    showVideoDetailsOverlay();
  } else if (event.deltaY > 0 && event.clientX > videoWidth * 0.4 && event.clientX <= videoWidth * 0.6) {
    // Scroll down in the middle (41%-60% width) to rewind 5 seconds
    videoPlayer.currentTime -= 5;
    showVideoDetailsOverlay();
  } else if (event.deltaY < 0 && event.clientX > videoWidth * 0.4 && event.clientX <= videoWidth * 0.6) {
    // Scroll up in the middle (41%-60% width) to forward 5 seconds
    videoPlayer.currentTime += 5;
    showVideoDetailsOverlay();
  } else if (event.deltaY > 0 && event.clientX > videoWidth * 0.6) {
    // Scroll down in the right side (61%-100% width) to decrease volume by 10%
    videoPlayer.volume = Math.max(0, videoPlayer.volume - 0.1);
    showVideoDetailsOverlay();
  } else if (event.deltaY < 0 && event.clientX > videoWidth * 0.6) {
    // Scroll up in the right side (61%-100% width) to increase volume by 10%
    videoPlayer.volume = Math.min(1, videoPlayer.volume + 0.1);
    showVideoDetailsOverlay();
  }
});

// Add event listener for file input
fileInput.addEventListener('change', handleFileSelect);
