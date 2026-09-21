import NProgress from 'nprogress'
import { router } from './router'

export default () => {
  router.beforeEach(() => {
    NProgress.start()
  })
  router.afterEach(() => {
    NProgress.done()
  })
}
