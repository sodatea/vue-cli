const path = require('path')
const fs = require('fs')

const toExtract = process.argv[2]
if (!toExtract) {
  console.error('Usage: yarn extract [pkg-name-to-extract]\n')
  process.exit(1)
}

const servicePkgPath = path.resolve(__dirname, '../../cli-service/package.json')
const servicePkg = JSON.parse(fs.readFileSync(servicePkgPath))

if (!servicePkg.dependencies[toExtract]) {
  console.error(
    `Package ${toExtract} is not a dependency of @vue/cli-service\n`
  )
  process.exit(1)
}

const depPkg = require('../package.json')
depPkg.devDependencies[toExtract] = servicePkg.dependencies[toExtract]

delete servicePkg.dependencies[toExtract]
fs.writeFileSync(servicePkgPath, JSON.stringify(servicePkg, null, 2))
fs.writeFileSync(
  path.resolve(__dirname, '../package.json'),
  JSON.stringify(depPkg, null, 2)
)

const excludedDeps = ['@zeit/ncc', 'mkdirp']
fs.writeFileSync(
  path.resolve(__dirname, '../src/index.js'), `module.exports = {
  ${Object.keys(depPkg.devDependencies)
    .filter(dep => !excludedDeps.includes(dep))
    .map(dep => `'${dep}': require('${dep}')`)
    .join(',\n  ')}
}
`)

// replace `require('${toExtract}')` with `require('@vue/cli-service-dependencies')['${toExtract}']`
require('child_process').spawnSync('find', [
  path.resolve(__dirname, '../../cli-service'),
  '-name',
  '*.js',
  '-exec',
  'sed',
  '-i',
  '',
  `s/require[(]\\'${toExtract}\\'[)]/require(\\'@vue\\/cli-service-dependencies\\')\\[\\'${toExtract}\\'\\]/g`,
  '{}',
  '\;'
], {
  stdio: 'inherit'
})
