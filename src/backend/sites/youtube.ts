// TODO [#25]: Check the whitelist to see if youtube has been whitelisted
// Note that google really doesn't want ads blocked on youtube, hence why
// the default adblock behavior doesn't work properly. Instead we need to create
// a custom blocker that stops ads from being displayed. A really simple bodge
// is to just click the skip button instantly and seem like we have properly skipped
// the ad. The skip button ad is currently .ytp-ad-text.ytp-ad-skip-button-text

setInterval(() => {
  // Grab the skip button
  const skipButton: HTMLDivElement = document.querySelector(
    '.ytp-ad-text.ytp-ad-skip-button-text'
  )

  // If the skip button does exists
  if (skipButton) {
    // Lets "smash that skip button"
    skipButton.click()
    // TODO [#26]: Automatically remove console.log's in production
    // Provide feedback in the console
    console.log('Video was skipped')
  }
}, 100)

console.log(
  '================================\nDot Shield is enabled on youtube.com\nWe will try to block all ads on this webpage'
)
