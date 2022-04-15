import { memo, useEffect, useState, ChangeEvent } from "react";
import { Midi } from "./midi/midi"
import 'react-piano/dist/styles.css';
const reactPiano = require('react-piano');
const App = memo(() => {
  const [initialized] = useState(false) // dummy value  call useEffect only once
  const [midiOut, setMidiOut] = useState<Array<string>>([])
  // on component mount  
  useEffect(() => {
    Midi.getInstance().initialize(onMidiEnabled)
  }, [initialized])

  // callback when midi initialize success
  const onMidiEnabled = () => {

    const outputs = Midi.getInstance().getOutputs()
    console.log(outputs)
    const newOutput: Array<string> = []
    outputs.map((output) => {
      newOutput.push(output.name)
      return output.name
    })
    setMidiOut(newOutput)
  }


  const onSelectMidiOut = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = Number(event.target.value)
    const midi = Midi.getInstance()
    if (value === -1) {
      midi.closeOutput()
    } else {
      midi.openOutput(Number(value))
    }
  }

  const midiOutList = midiOut.map((output, index) => (<option value={index} key={index}>{`${output}`}</option>))

  const firstNote = reactPiano.MidiNumbers.fromNote('c3');
  const lastNote = reactPiano.MidiNumbers.fromNote('f5');
  const keyboardShortcuts = reactPiano.KeyboardShortcuts.create({
    firstNote: firstNote,
    lastNote: lastNote,
    keyboardConfig: reactPiano.KeyboardShortcuts.HOME_ROW,
  });

  const midi = Midi.getInstance()

  return (
    <>
      <h1>
        WEB MIDI Guy
      </h1>
      <div>
        {midiOutList.length &&
          <select onChange={onSelectMidiOut}>
            <option value="-1">-- select MIDI Out--</option>
            {midiOutList}
          </select>
        }
      </div>
      <div>
        <reactPiano.Piano
          noteRange={{ first: firstNote, last: lastNote }}
          playNote={(midiNumber: number) => {
            // Play a given note - see notes below
            console.log(midiNumber)
            midi.noteOn(1, midiNumber, 127)
          }}
          stopNote={(midiNumber: number) => {
            // Stop playing a given note - see notes below
            console.log(midiNumber)
            midi.noteOff(1, midiNumber, 127)
          }}
          width={1000}
          keyboardShortcuts={keyboardShortcuts}
        />
      </div>
    </>
  );
})

export default App;
