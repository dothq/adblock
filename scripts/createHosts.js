const fs = require('fs')
const path = require('path')

const { get } = require('axios')
const { minify } = require('terser')

const finalPath = path.join(__dirname, '..', 'src', 'blockedDomains.js')
const blockedFooter = fs.readFileSync(
  path.join(__dirname, '..', 'src', 'blockedFooter.js')
)

const process = (contents) =>
  contents
    .split('\n')
    .filter((str) => str.includes('0.0.0.0'))
    .map((str) => str.split(' ')[1] || '')
    .filter((str) => str !== '')
    .filter((str) => str !== '0.0.0.0')
    .map((str) => `*://*.${str}/*`)

;(async () => {
  console.log('Downloading...')

  const base = process(
    (
      await get(
        'https://raw.githubusercontent.com/StevenBlack/hosts/master/hosts'
      )
    ).data
  )

  const fakeNews = process(
    (
      await get(
        'https://raw.githubusercontent.com/StevenBlack/hosts/master/alternates/fakenews/hosts'
      )
    ).data
  )

  const gambling = process(
    (
      await get(
        'https://raw.githubusercontent.com/StevenBlack/hosts/master/alternates/gambling/hosts'
      )
    ).data
  )

  const porn = process(
    (
      await get(
        'https://raw.githubusercontent.com/StevenBlack/hosts/master/alternates/porn/hosts'
      )
    ).data
  )

  const social = process(
    (
      await get(
        'https://raw.githubusercontent.com/StevenBlack/hosts/master/alternates/social/hosts'
      )
    ).data
  )

  console.log('Generating...')

  const fileContents = `
const common = ${JSON.stringify(base)};

const fakeNews = ${JSON.stringify(fakeNews)};

const gambling = ${JSON.stringify(gambling)};

const porn = ${JSON.stringify(porn)};

const social = ${JSON.stringify(social)};


${blockedFooter}
  `
  const result = await minify(fileContents, {
    mangle: { reserved: ['blockedDomains'] },
  })

  console.log('Writing...')

  fs.writeFileSync(finalPath, result.code)
})()
