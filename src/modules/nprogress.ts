/*!
 * Portions derived from NProgress: https://github.com/rstacruz/nprogress
 * Copyright (c) 2013-2014 Rico Sta. Cruz
 * SPDX-License-Identifier: MIT
 * See LICENSE.md for the full license text.
 */
import type { Router } from 'vue-router'

export default (router: Router) => {
  let progress: HTMLDivElement | undefined
  let value = 0
  let trickle: ReturnType<typeof setInterval>
  let removal: ReturnType<typeof setTimeout>

  function update(next = value) {
    progress!.style.transform = `translateX(${(next - 1) * 100}%)`
  }

  function start() {
    if (value > 0)
      return

    // A new navigation can start while the previous bar is fading out.
    clearTimeout(removal)
    progress?.remove()
    progress = document.createElement('div')
    progress.id = 'nprogress'
    document.body.append(progress)
    // Commit the initial position before starting the transition.
    progress.getBoundingClientRect()
    value = 0.08
    update()
    trickle = setInterval(() => {
      value = Math.min(value + Math.random() * 0.02, 0.994)
      update()
    }, 800)
  }

  function done() {
    if (!progress || value === 0)
      return

    clearInterval(trickle)
    update(1)
    value = 0
    progress.style.opacity = '0'
    removal = setTimeout(() => {
      progress?.remove()
      progress = undefined
    }, 400)
  }

  router.beforeEach(start)
  router.afterEach(done)
  router.onError(done)
}
