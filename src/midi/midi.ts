import { WebMidi, Input, MessageEvent } from 'webmidi'


// todo: add more callback types..
type EnabledCallback = (() => void)
type NoteOnCallback = ((channel: number, note: number, velocity: number) => void)
type NoteOffCallback = ((channel: number, note: number, velocity: number) => void)
type ControlChangeCallback = ((channel: number, controlNumber: number, value: number) => void)

// proxy for WebMidi.js
export class Midi {

    private static instance: Midi    
    static getInstance(): Midi {
        if (!Midi.instance) {
            Midi.instance = new Midi()            
        }
        return Midi.instance
    }

    private inputIndex = -1
    private outputIndex = -1

    // todo : would be better to make below members as array of callbacks w/ add/remove interfaces for each
    //  e.g. onEnabledCallback: Array<EnabledCallback>
    private onEnabledCallback: EnabledCallback | null = null
    private onNoteOnCallback: NoteOnCallback | null = null
    private onNoteOffCallback: NoteOffCallback | null = null
    private onControlChangeCallback : ControlChangeCallback | null = null

    initialize = (
        onEnabledCallback: EnabledCallback,
        onNoteOnCallback: NoteOnCallback,
        onNoteOffCallback: NoteOffCallback,
        onControlChangeCallback: ControlChangeCallback

    ) => {
        this.onEnabledCallback = onEnabledCallback
        this.onNoteOnCallback = onNoteOnCallback
        this.onNoteOffCallback = onNoteOffCallback
        this.onControlChangeCallback = onControlChangeCallback

        WebMidi.enable({ sysex: true })
            .then(this.onMidiEnabled).
            catch((err: any) => {
                console.log(`error!: ${err}`)
            })
    }

    // callback when enabling WebMidi
    onMidiEnabled = () => {
        this.closeInput() // should close here, to specify which port to listen
        if (this.onEnabledCallback) {
            this.onEnabledCallback()
        }
    }

    // callback when receiving MIDI message 
    onMidiMessage = (event: MessageEvent) => {
        const type = event.message.type        
        const data = event.message.data

        switch (type) {
            case 'clock':
                break;
            case 'start':
                break;
            case 'continue':
                break;
            case 'stop':
                break;
            case 'activesensing':
                break;
            case 'resset':
                break;
                
            case 'noteon': {
                const channel = data[0] & 0x0F
                const note = data[1]
                const velocity = data[2]
                this.onNoteOnCallback
                    && this.onNoteOnCallback(channel, note, velocity)
            }
                break;
            case 'noteoff': {
                const channel = data[0] & 0x0F
                const note = data[1]
                const velocity = data[2]
                this.onNoteOffCallback
                    && this.onNoteOffCallback(channel, note, velocity)
            }
                break;
            case 'controlchange': {
                const channel = data[0] & 0x0F
                const controlNumber = data[1]
                const value = data[2]
                this.onControlChangeCallback
                    && this.onControlChangeCallback(channel, controlNumber, value)
            }
                
                break;
            default:
                break;
        }
    }

    getInputs = ():Input[] => {
        return WebMidi.inputs
    }

    closeInput = () => {
        // remove all listeners
        WebMidi.removeListener()

        // close all
        WebMidi.inputs.map((input) => {
            input.close()
            return input
        })
        this.inputIndex = -1
    }

    openInput = (index: number) => {
        if (index < 0 || index >= WebMidi.inputs.length) {
            console.log(`error, invalid index specified:{number}`)
        }
        this.closeInput()

        const input = WebMidi.inputs[index]
        input.open()
        
        // receive all messages
        input.addListener('midimessage', this.onMidiMessage)
    }
}
