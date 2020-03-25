import fs from 'fs'

const json1path = process.argv[2]
const json2path = process.argv[3]

const json1 = JSON.parse(fs.readFileSync(json1path, 'utf8'))
const json2 = JSON.parse(fs.readFileSync(json2path, 'utf8'))

const depKeys = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']

const missingDeps = []
const majorVersionChanges = []

for (const depKey of depKeys) {
  const deps1 = json1[depKey]
  if (!deps1) continue

  const deps2 = json2[depKey]

  for (const pkg in deps1) {
    const version1 = deps1[pkg]
    const version2 = deps2[pkg]

    if (!version2) {
      missingDeps.push(pkg)
      continue
    }

    const major1 = version1.split('.')[0].replace(/[\W_]+/g, '')
    const major2 = version2.split('.')[0]

    if (major1 !== major2) majorVersionChanges.push({ pkg, major1, major2 })
  }
}

console.log('******* missingDeps ********')
console.log(JSON.stringify(missingDeps, null, 2))

console.log()

console.log('******* majorVersionChanges ********')
console.log(JSON.stringify(majorVersionChanges, null, 2))
