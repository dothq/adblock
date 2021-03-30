// Note that google really doesn't want ads blocked on youtube, hence why
// the default adblock behavior doesn't work properly. Instead we need to create
// a custom blocker that stops ads from being displayed. A really simple bodge
// is to just click the skip button instantly and seem like we have properly skipped
// the ad. The skip button ad is currently .ytp-ad-text.ytp-ad-skip-button-text

import { println } from '../lib/logger'
import { remoteFn } from '../lib/remoteFunctions'

// Needs to be in an async block to get the whitelist
;(async () => {
  const whitelist = await remoteFn('getWhitelist')
  if (whitelist.includes('youtube.com')) return

  setInterval(() => {
    // Grab the skip button
    const skipButton: HTMLDivElement = document.querySelector(
      '.ytp-ad-text.ytp-ad-skip-button-text'
    )

    // If the skip button does exists
    if (skipButton) {
      // Lets "smash that skip button"
      skipButton.click()
      // Provide feedback in the console
      println('Video was skipped')
    }
  }, 100)

  println(
    '================================\nDot Shield is enabled on youtube.com\nWe will try to block all ads on this webpage'
  )
})()
