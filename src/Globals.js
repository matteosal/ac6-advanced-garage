import partsData from './PartsData.json';
partsData = partsData.map((part, idx) => Object.assign(part, {ID: idx}))

export default partsData