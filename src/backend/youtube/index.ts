// Todo: Check the whitelist to see if youtube has been whitelisted
// Note that google really doesn't want ads blocked on youtube, hence why
// the default adblock behavior doesn't work properly. Instead we need to create
// a custom blocker that stops ads from being displayed. A really simple bodge
// is to just click the skip button instantly and seem like we have properly skipped
// the ad. The skip button ad is currently .ytp-ad-text.ytp-ad-skip-button-text
//
// Additionally #player-ads shows up below the video and can be hidden

// Keep a log of the current video source so we can check if it has changed
let currentSrc = ''

// This will be run whenever the video time changes, so we can compare the source
// to see if they have committed a sneaky and changed the URL on us
const videoUpdate = () => {
  if (this.src !== currentSrc) {
    // Youtube has committed a sneaky and changed the URL
    currentSrc = this.src

    // Grab the skip button
    const skipButton: HTMLDivElement = document.querySelector(
      '.ytp-ad-text.ytp-ad-skip-button-text'
    )

    // If the skip button does exists
    if (skipButton) {
      // Lets "smash that skip button"
      skipButton.click()
    }
  }
}

// We can override all of the videos on youtube because I am lazy. HTMLMediaElement
// encompasses audio as well, so thats fun
const originalPlay = HTMLMediaElement.prototype.play
HTMLMediaElement.prototype.play = () => {
  // TODO [#24]: Make a script that removes console.logs from production
  console.log('Play')
  // Here we can do whatever we want, like add event listeners
  // Remove any existing event listeners specific to us to stop a memory leak
  this.removeEventListener('timeupdate', videoUpdate)
  // And add a new event listener to the video
  this.addEventListener('timeupdate', videoUpdate)

  // Now we call the original function as if nothing happened
  return originalPlay()
}
