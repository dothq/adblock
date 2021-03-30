/* eslint-disable no-console */
export const println = (message: string): void => console.log(message)
export const timeStart = (message: string): void => console.time(message)
export const timeEnd = (message: string): void => console.timeEnd(message)
