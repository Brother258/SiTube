videoPlayer.addEventListener('wheel', function(event) {
  event.preventDefault(); // Prevent the default page scroll behavior

  // Check if there is a video selected and it's playing
  if (videoPlayer.src && !videoPlayer.paused) {
    const videoWidth = videoPlayer.offsetWidth;
    const mouseX = event.clientX - videoPlayer.getBoundingClientRect().left;

    if (event.deltaY > 0 && mouseX <= videoWidth * 0.4) {
      // Scroll down in the left side (0%-40% width) to adjust playback speed by -0.1
      videoPlayer.playbackRate -= 0.1;
      showVideoDetailsOverlay();
    } else if (event.deltaY < 0 && mouseX <= videoWidth * 0.4) {
      // Scroll up in the left side (0%-40% width) to adjust playback speed by +0.1
      videoPlayer.playbackRate += 0.1;
      showVideoDetailsOverlay();
    } else if (event.deltaY > 0 && mouseX > videoWidth * 0.4 && mouseX <= videoWidth * 0.6) {
      // Scroll down in the middle (41%-60% width) to rewind 5 seconds
      videoPlayer.currentTime -= 5;
      showVideoDetailsOverlay();
    } else if (event.deltaY < 0 && mouseX > videoWidth * 0.4 && mouseX <= videoWidth * 0.6) {
      // Scroll up in the middle (41%-60% width) to forward 5 seconds
      videoPlayer.currentTime += 5;
      showVideoDetailsOverlay();
    } else if (event.deltaY > 0 && mouseX > videoWidth * 0.6) {
      // Scroll down in the right side (61%-100% width) to decrease volume by 10%
      videoPlayer.volume = Math.max(0, videoPlayer.volume - 0.1);
      showVideoDetailsOverlay();
    } else if (event.deltaY < 0 && mouseX > videoWidth * 0.6) {
      // Scroll up in the right side (61%-100% width) to increase volume by 10%
      videoPlayer.volume = Math.min(1, videoPlayer.volume + 0.1);
      showVideoDetailsOverlay();
    }
  }
});
