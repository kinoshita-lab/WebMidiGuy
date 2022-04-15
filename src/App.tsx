import { memo, useEffect, useState, ChangeEvent } from "react";
import { Midi } from "./midi/midi"
import { KnobWithCaption } from "./components/KnobWithText"
import 'react-piano/dist/styles.css';
import './index.css';

import { GmPrograms } from "./midi/gm_program"
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

  const onSelectProgram = (event: ChangeEvent<HTMLSelectElement>) => {
    console.log(event.target.value)

    const number = Number(event.target.value)
    midi.programChange(number)
  }

  const onChangeGMVolume = () => {

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

  const programList = () => {
    const list = GmPrograms.map((program, index) => {
      return <option key={index} value={program.number}>{program.name}</option>
    })
    return list
  }

  /*
   * Tons of callbacks 
   */
  const OnEqualizerLowChanged = (value: number) => {
    console.log(value)
    midi.sendNrpn(0, 0x0, value)
  }
  const OnEqualizerMedLowChanged = (value: number) => {
    console.log(value)
    midi.sendNrpn(0, 0x1, value)
  }

  const OnEqualizerMedHighChanged = (value: number) => {
    console.log(value)
    midi.sendNrpn(0, 0x2, value)
  }

  const OnEqualizerHighChanged = (value: number) => {
    console.log(value)
    midi.sendNrpn(0, 0x3, value)
  }


  return (
    <>
      <h1>
        WEB MIDI Guy ver.202204016
      </h1>
      <div>
        <div >
          <h2>Select MIDI Out</h2>
          {midiOutList.length &&
            <select onChange={onSelectMidiOut} >
              <option value="-1">-- select MIDI Out--</option>
              {midiOutList}
            </select>
          }
        </div>
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
      <div>
        <h2>Program</h2>
        <select onChange={onSelectProgram}>
          {programList()}
        </select>
      </div>
      <div>
        <h2>EQ</h2>
        <div className="group">
          <div>
            <KnobWithCaption caption="Equalizer High"
              onChange={OnEqualizerHighChanged} />
          </div>
          <div>
            <KnobWithCaption caption="Equalizer Med High"
              onChange={OnEqualizerMedHighChanged} />
          </div>
          <div>
            <KnobWithCaption caption="Equalizer Med Low"
              onChange={OnEqualizerMedLowChanged} />
          </div>

          <div>
            <KnobWithCaption caption="Equalizer Low"
              onChange={OnEqualizerLowChanged} />
          </div>
        </div>
      </div>
    </>
  );
})

export default App;
