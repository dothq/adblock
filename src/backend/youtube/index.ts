// TODO [$605059a082bb71000891a63b]: Check the whitelist to see if youtube has been whitelisted
// Note that google really doesn't want ads blocked on youtube, hence why
// the default adblock behavior doesn't work properly. Instead we need to create
// a custom blocker that stops ads from being displayed. A really simple bodge
// is to just click the skip button instantly and seem like we have properly skipped
// the ad. The skip button ad is currently .ytp-ad-text.ytp-ad-skip-button-text
//
// Additionally #player-ads shows up below the video and can be hidden

// Keep a log of the current video source so we can check if it has changed
let currentSrc = ''

// We will keep looking for that button until we find it, then we will click it
let interval: NodeJS.Timeout

// This will be run whenever the video time changes, so we can compare the source
// to see if they have committed a sneaky and changed the URL on us
const videoUpdate = () => {
  if (this.src !== currentSrc) {
    // Youtube has committed a sneaky and changed the URL
    currentSrc = this.src

    interval = setInterval(() => {
      // Grab the skip button
      const skipButton: HTMLDivElement = document.querySelector(
        '.ytp-ad-text.ytp-ad-skip-button-text'
      )

      // If the skip button does exists
      if (skipButton) {
        // Lets "smash that skip button"
        skipButton.click()
        // TODO [$605059a082bb71000891a63c]: Automatically remove console.log's in production
        // Provide feedback in the console
        console.log('Video was skipped')
        // Stop the loop
        clearInterval(interval)
      }
    }, 10)
  }
}

// Lets add the videos via a loop
setInterval(() => {
  // Grab all of the video elements in the page
  const videoElements = document.getElementsByTagName('video')

  // Loop through them all
  for (let i = 0; i < videoElements.length; i++) {
    const video = videoElements[i]

    // Remove any existing event listeners specific to us to stop a memory leak
    video.removeEventListener('timeupdate', videoUpdate)
    // And add a new event listener to the video
    video.addEventListener('timeupdate', videoUpdate)
  }
}, 100)
