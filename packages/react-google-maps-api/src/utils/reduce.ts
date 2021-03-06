export const reduce = (obj: any, fn: any, acc: any): any => {
  return Object.keys(obj).reduce(function reducer(newAcc, key) {
    return fn(newAcc, obj[key], key)
  }, acc)
}
