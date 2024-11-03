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
    <li onMouseEnter = {() => setter(id)}>{name}</li>
  )  
}

const PartList = ({kind, setter}) => {
  return(
    <>
    <div style = {{display : 'inline-block'}}>
    <ul style = {{'listStyleType': 'none'}}>
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
    </ul>
    </div>
    </>
  )
}

const PartStats = ({id}) => {
  if(id === null) {
    return
  }
  return (
    <>
    <div style = {{display : 'inline-block'}}>
    <table>
    <tbody>
    {
      Object.entries(partsData[id]).map(
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
    <div style={{'verticalAlign': 'top'}}>
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