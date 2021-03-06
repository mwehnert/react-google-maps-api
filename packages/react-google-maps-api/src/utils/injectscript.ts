import { isBrowser } from './isbrowser'

interface WindowWithGoogleMap extends Window {
  initMap?: () => void
}

interface InjectScriptArg {
  url: string
  id: string
}

export const injectScript = ({ url, id }: InjectScriptArg): Promise<any> => {
  if (!isBrowser) {
    return Promise.reject(new Error('document is undefined'))
  }

  return new Promise(function injectScriptCallback(resolve, reject) {
    const existingScript = document.getElementById(id) as HTMLScriptElement | undefined
    const windowWithGoogleMap: WindowWithGoogleMap = window
    if (existingScript) {
      // Same script id/url: keep same script
      const dataStateAttribute = existingScript.getAttribute('data-state')
      if (existingScript.src === url && dataStateAttribute !== 'error') {
        if (dataStateAttribute === 'ready') {
          return resolve(id)
        } else {
          const originalInitMap = windowWithGoogleMap.initMap
          const originalErrorCallback = existingScript.onerror

          windowWithGoogleMap.initMap = function initMap() {
            if (originalInitMap) {
              originalInitMap()
            }
            resolve(id)
          }

          existingScript.onerror = function(err) {
            if (originalErrorCallback) {
              originalErrorCallback(err)
            }
            reject(err)
          }

          return
        }
      }
      // Same script id, but either
      // 1. requested URL is different
      // 2. script failed to load
      else {
        existingScript.remove()
      }
    }

    const script = document.createElement('script')

    script.type = 'text/javascript'
    script.src = url
    script.id = id
    script.async = true
    script.onerror = function onerror(err) {
      script.setAttribute('data-state', 'error')
      reject(err)
    }

    windowWithGoogleMap.initMap = function onload() {
      script.setAttribute('data-state', 'ready')
      resolve(id)
    }

    document.head.appendChild(script)
  }).catch(err => {
    console.error('injectScript error: ', err)
    throw err
  })
}
