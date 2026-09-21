// skeletonDark: https://github.com/tusen-ai/naive-ui/issues/5777
import { autoCompleteDark, createTheme, dividerDark, rateDark, tagDark } from 'naive-ui'
import { skeletonDark } from 'naive-ui/es/skeleton/styles'

const isDark = useDark()
const toggleDark = useToggle(isDark)
const darkTheme = createTheme([autoCompleteDark, dividerDark, rateDark, tagDark, skeletonDark])
const darkOverrides = {
  common: {
    popoverColor: '#1e1e1e',
  },
}

export default () => ({ isDark, toggleDark, darkTheme, darkOverrides })
