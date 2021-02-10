// =================================================================
// Start of code for generating block list

let blockedDomains = [...common, ...fakeNews, ...gambling, ...porn, ...social]

// Retrieve settings
// Generate block list

blockedDomains = blockedDomains.filter(
  (c, i) => blockedDomains.indexOf(c) !== i
)

console.log(blockedDomains.length)
