const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')
const ncc = require('@zeit/ncc')

ncc(path.resolve(__dirname, '../src/index.js'), {
  minify: true, // default
  externals: ['webpack', 'fsevents'],
  sourceMap: true // default
}).then(
  ({ code, map, assets }) => {
    const outDir = path.resolve(__dirname, '../lib')

    mkdirp.sync(outDir)
    fs.writeFileSync(outDir + '/index.js', code)
    if (map) fs.writeFileSync(outDir + '/index.js.map', map)

    for (const asset of Object.keys(assets)) {
      mkdirp.sync(path.dirname(asset))
      fs.writeFileSync(outDir + '/' + asset, assets[asset])
    }
  }
)
