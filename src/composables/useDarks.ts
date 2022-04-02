const isDark = useDark()
const toggleDark = useToggle(isDark)
const darkOverrides = {
    Layout: {
      color: 'rgb(24, 24, 28)',
    },
  }

export default () => ({ isDark, toggleDark, darkOverrides })
