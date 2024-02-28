import { loadEnv } from 'vite'

const { NODE_ENV } = process.env

// 是否是开发环境
export const isDevelopment = NODE_ENV === 'development'

// 是否是生产环境
export const isProduction = NODE_ENV === 'production'

const stringToBoolean = (v: string) => {
  return Boolean(v === 'true' || false)
}

// 获取环境变量
const useEnv = () => {
  const env = isProduction
    ? loadEnv('production', '.')
    : loadEnv('development', '.')

  const {
    VITE_SITE_URL,
    VITE_APP_INSPECT,
    VITE_APP_MARKDOWN,
    VITE_APP_API_AUTO_IMPORT,
    VITE_APP_DIR_API_AUTO_IMPORT,
  } = env

  const newEnv = {
    VITE_SITE_URL,
    VITE_APP_INSPECT: stringToBoolean(VITE_APP_INSPECT),
    VITE_APP_MARKDOWN: stringToBoolean(VITE_APP_MARKDOWN),
    VITE_APP_API_AUTO_IMPORT: stringToBoolean(VITE_APP_API_AUTO_IMPORT),
    VITE_APP_DIR_API_AUTO_IMPORT: stringToBoolean(VITE_APP_DIR_API_AUTO_IMPORT),
  }
  return newEnv
}

export const env = useEnv()
