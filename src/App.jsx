import { useState } from 'react'

import partsData from './PartsData.json';
partsData = partsData.map((part, idx) => Object.assign(part, {ID: idx}))

const partKinds = ['Unit', 'Head', 'Core', 'Arms', 'Legs','Booster', 'FCS', 
  'Generator', 'Expansion']

const KindSelector = ({kind, border, kindSetter, partSetter}) => {
  let style = {display : 'inline-block', margin: '10px'}
  if(border)
    style['border'] = 'solid'
  return (
    <div 
      style = {style}
      onMouseEnter = {
        () => {
          kindSetter(kind)
          partSetter(null)
        }
      }
    >
    {kind}
    </div>
  )
}

const PartSelector = ({name, id, setter}) => {
  return (
    <div onMouseEnter = {() => setter(id)}>{name}</div>
  )  
}

const PartList = ({kind, setter}) => {
  return(
    <>
    <div style = {{display: 'inline-block', verticalAlign: 'top'}}>
      {
        partsData.
          filter((part) => part.Kind === kind).
          map(
            (part) => <PartSelector
              name={part.Name} 
              id={part.ID} 
              setter={setter} 
              key={part.ID}
            />
          )
      }
    </div>
    </>
  )
}

const hidddenProps = ['Name', 'Kind', 'RightArm', 'LeftArm', 'RightShoulder', 'LeftShoulder',
  'ID']

function filterEntries(entries) {
  return entries.filter(([prop, val]) =>  !hidddenProps.includes(prop))
} 

const PartStats = ({id}) => {
  if(id === null) {
    return
  }
  return (
    <>
    <div style = {{display: 'inline-block', verticalAlign: 'top'}}>
    <table>
    <tbody>
    {
      filterEntries(Object.entries(partsData[id])).map(
        ([prop, val]) => {
          return (
            <tr key={prop}>
              <td>{prop}</td>
              <td>{val}</td>
            </tr>
          )
        }
      )
    }
    </tbody>
    </table>
    </div>
    </>
  )
}

const PartsExplorer = () => {
  const [selectedKind, setSelectedKind] = useState('Unit')
  const [selectedPart, setSelectedPart] = useState(null)

  return (
    <>
    {
      partKinds.map((k) => 
        <KindSelector 
          kind = {k}
          border = {k === selectedKind}
          kindSetter = {setSelectedKind}
          partSetter = {setSelectedPart}
          key = {k}
        />
      )
    }
    <br/>
    <div>
    <PartList kind={selectedKind} setter={setSelectedPart} />
    <PartStats id={selectedPart} />
    </div>
    </>
  )
}

function App() {
  return (
    <div>
      <PartsExplorer />
    </div>
  )
}

export default App;


// <a href="https://www.flaticon.com/free-icons/mechanic" title="mechanic icons">Mechanic icons created by Good Ware - Flaticon</a>