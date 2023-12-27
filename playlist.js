var playlist = [];
var sidebarHidden = true;

function handleFileSelect(event) {
  const selectedFiles = event.target.files;
  if (selectedFiles.length > 0) {
    playlist = playlist.concat(Array.from(selectedFiles).sort((a, b) => a.name.localeCompare(b.name)));
    updatePlaylist();
    changeVideo(playlist[0]);

    // Show the sidebar when videos are selected
    showSidebar();
  }
}

function showSidebar() {
  const playlistContainer = document.getElementById('playlistContainer');
  playlistContainer.classList.remove('hidden');
  sidebarHidden = false;
}

function toggleSidebar() {
  const playlistContainer = document.getElementById('playlistContainer');
  playlistContainer.classList.toggle('hidden');
  sidebarHidden = !sidebarHidden;
}

function updatePlaylist() {
  const playlistItemsContainer = document.getElementById('playlistItems');
  playlistItemsContainer.innerHTML = '';
  playlist.forEach((file, index) => {
    const listItem = createPlaylistItem(file, index);
    playlistItemsContainer.appendChild(listItem);
  });
}

function createPlaylistItem(file, index) {
  const listItem = document.createElement('div');
  listItem.classList.add('playlist-item');
  listItem.draggable = true;

  const fileName = document.createElement('div');
  fileName.classList.add('file-name');
  fileName.innerText = `${index + 1}. ${file.name}`;

  listItem.appendChild(fileName);

  listItem.addEventListener('dragstart', (event) => {
    event.dataTransfer.setData('text/plain', index);
  });

  listItem.addEventListener('dragover', (event) => {
    event.preventDefault();
  });

  listItem.addEventListener('drop', (event) => {
    event.preventDefault();
    const fromIndex = parseInt(event.dataTransfer.getData('text/plain'), 10);
    const toIndex = index;
    if (!isNaN(fromIndex) && !isNaN(toIndex) && fromIndex !== toIndex) {
      const [movedItem] = playlist.splice(fromIndex, 1);
      playlist.splice(toIndex, 0, movedItem);
      updatePlaylist();
    }
  });

  listItem.addEventListener('click', () => changeVideo(file));

  return listItem;
}

fileInput.addEventListener('change', handleFileSelect);

// Hide the sidebar on page load
const playlistContainer = document.getElementById('playlistContainer');
playlistContainer.classList.add('hidden');

document.addEventListener('keydown', function (event) {
  if (event.key === 'd') {
    toggleSidebar();
  }
});
