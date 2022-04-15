import { memo, useEffect, useState, ChangeEvent } from "react";
import { Midi } from "./midi/midi"

const App = memo(() => {
  const [initialized] = useState(false) // dummy value  call useEffect only once
  const [midiIn, setMidiIn] = useState<Array<string>>([])
  // const [midiOut, setMidiOut] = useState([]) // not yet
  const [midiMessage, setMidiMessage] = useState("")

  // on component mout  
  useEffect(() => {

    Midi.getInstance().initialize(onMidiEnabled, onNoteOn, onNoteOff, onControlChange)
  }, [initialized])

  // callback when midi initialize success
  const onMidiEnabled = () => {
    const inputs = Midi.getInstance().getInputs()
    const newInput: Array<string> = []
    inputs.map((input) => { newInput.push(input.name) })
    setMidiIn(newInput)
  }

  // callback on note on
  const onNoteOn = (channel: number, note: number, velocity: number) => {
    const message = `NoteOn Ch ${channel + 1}, Note ${note}, Velocity ${velocity}`
    setMidiMessage(message)
  }
  // callback on note off
  const onNoteOff = (channel: number, note: number, velocity: number) => {
    const message = `NoteOff Ch ${channel + 1}, Note ${note}, Velocity ${velocity}`
    setMidiMessage(message)
  }

  // callback on control change
  const onControlChange = (channel: number, controlNumber: number, value: number) => {
    const message = `Control Change Ch ${channel + 1}, Number ${controlNumber}, Value ${value}`
    setMidiMessage(message)
  }

  const onSelectMidiIn = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = Number(event.target.value)
    const midi = Midi.getInstance()
    if (value === -1) {
      midi.closeInput()
    } else {
      midi.openInput(Number(value))
    }
  }

  const midiInList = midiIn.map((input, index) => (<option value={index} key={index}>{`${input}`}</option>))

  return (
    <>
      <div>
        {midiInList.length &&
          <select onChange={onSelectMidiIn}>
            <option value="-1">-- select MIDI In--</option>
            {midiInList}
          </select>
        }
      </div>
      {
        midiMessage &&
        <h1 >{midiMessage} </h1>
      }
    </>
  );
})

export default App;
