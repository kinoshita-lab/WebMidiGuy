import { WebMidi, Output, Input, Note} from 'webmidi'


type EnabledCallback = (() => void)
type MidiOut = Output | null

// proxy for WebMidi.js
export class Midi {

    private static instance: Midi
    static getInstance(): Midi {
        if (!Midi.instance) {
            Midi.instance = new Midi()
        }
        return Midi.instance
    }
    

    private onEnabledCallback: EnabledCallback | null = null
    private midiOut: MidiOut = null
    initialize = (
        onEnabledCallback: EnabledCallback,

    ) => {
        this.onEnabledCallback = onEnabledCallback

        WebMidi.enable({ sysex: true }).then(this.onMidiEnabled).catch((err: any) => {
            console.log(`error!: ${err}`)
        })
    }

    // callback when enabling WebMidi
    onMidiEnabled = () => {
        this.closeInput() // should close here, to specify which port to listen
        this.closeOutput()
        if (this.onEnabledCallback) {
            this.onEnabledCallback()
        }
    }

    getInputs = (): Input[] => {
        return WebMidi.inputs
    }

    getOutputs = (): Output[] => {
        return WebMidi.outputs
    }

    closeInput = () => {
        // remove all listeners
        WebMidi.removeListener()

        // close all
        WebMidi.inputs.map((input) => {
            input.close()
            return input
        })
    }

    openInput = (index: number) => {
        if (index < 0 || index >= WebMidi.inputs.length) {
            console.log(`error, invalid index specified:{number}`)
            return
        }
        this.closeInput()

        const input = WebMidi.inputs[index]
        input.open()
    }

    closeOutput = () => {
        this.midiOut = null
    }

    openOutput = (index: number) => {
        if (index < 0 || index >= WebMidi.outputs.length) {
            console.log(`openOutput error: invalid index specified: {number}`)
            return
        }
        this.closeOutput()
        const output = WebMidi.outputs[index]
        output.open()
        this.midiOut = output
    }

    noteOn = (ch: number, note: number, velocity: number) => {
        console.log(`note on: ch ${ch}, note${note}, velo${velocity}`)
        if (this.midiOut) {
            this.midiOut.sendNoteOn(note, { channels: ch })
        }
    }

    noteOff = (ch: number, note: number, velocity: number) => {
        console.log(`note off: ch ${ch}, note${note}, velo${velocity}`)
        if (this.midiOut) {
            this.midiOut.sendNoteOff(note, { channels: ch })
        }
    }

    programChange = (number: number) => {
        if (this.midiOut) {
            this.midiOut.sendProgramChange(number)
        }
    }

    sendNrpn = (ch: number, lsb: number, value: number) => {
        if (this.midiOut) {
            this.midiOut.sendNrpnValue([0x37, lsb], value) // todo:SAM2695 specific
        }
    }
}
