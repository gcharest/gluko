// Returns an array of supported locales as strings
const Trans = {
  get supportedLocales() {
    return import.meta.env.VITE_SUPPORTED_LOCALES.split(',')
  }
}
export default Trans
