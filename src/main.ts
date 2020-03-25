import fs from 'fs'
import path from 'path'
import matchAll from 'string.prototype.matchall'

matchAll.shim()

const rootPath = process.argv[2]
const jsonPath = path.join(rootPath, 'package.json')
const lockPath = path.join(rootPath, 'yarn.lock')

const json = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
const lockText = fs.readFileSync(lockPath, 'utf8')

const depKeys = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']

for (const depKey of depKeys) {
  const deps: Record<string, string> | undefined = json[depKey]
  if (!deps) continue

  for (const pkg in deps) {
    const version = deps[pkg]
    const escapedVersion = version.replace('^', '\\^').replace(/\./g, '\\.')
    const pkgStr = `${pkg}@${escapedVersion}`
    const regex = new RegExp(`${pkgStr}.*\n  version "(.+)"`, 'g')

    const matches = Array.from(lockText.matchAll(regex)).filter(m => {
      const prevChar = lockText[(m.index || 0) - 1]
      return prevChar === '\n' || prevChar === ' ' || prevChar === '"'
    })

    if (matches.length > 1) {
      console.log(pkg, version)
      throw new Error('found more than one match')
    }

    if (!matches.length) {
      console.log(pkg, version)
      throw new Error('No matches found')
    }

    const newVersion = matches[0][1]
    deps[pkg] = newVersion
  }
}

console.log(JSON.stringify(json, null, 2))
