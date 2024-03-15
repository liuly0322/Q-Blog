// skeletonDark: https://github.com/tusen-ai/naive-ui/issues/5777
import { autoCompleteDark, createTheme, dividerDark, layoutDark, rateDark, tagDark } from 'naive-ui'
import { skeletonDark } from 'naive-ui/es/skeleton/styles'

const isDark = useDark()
const toggleDark = useToggle(isDark)
const darkTheme = createTheme([autoCompleteDark, dividerDark, layoutDark, rateDark, tagDark, skeletonDark])
const darkOverrides = {
  Layout: {
    color: 'rgb(24, 24, 28)',
  },
}

export default () => ({ isDark, toggleDark, darkTheme, darkOverrides })
