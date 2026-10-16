/* eslint-disable antfu/no-top-level-await */
import buildRSS from './buildRSS.ts'
import buildSearchIndex from './buildSearchIndex.ts'
import buildStaticSite from './buildStaticSite.ts'

await buildStaticSite()
await buildRSS()
await buildSearchIndex()
