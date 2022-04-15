import { memo, useState, useEffect, useRef, MouseEvent, TouchEvent, VFC } from "react"



export type KnobCustomDrawParameters = {
    width: number;
    height: number;
    value: number;
    min: number;
    max: number;
};

export type KnobCustomizeProperties = {
    width: number;
    height: number;

    customDraw: (param: KnobCustomDrawParameters, context: CanvasRenderingContext2D) => void;
};

type Props = {
    x?: number;
    y?: number;
    min?: number;
    max?: number;
    props_value?: number;
    onChange?: (value: number) => void;
    custom?: KnobCustomizeProperties;
}
export const Knob: VFC<Props> = memo((props) => {

    const { x = 0, y = 0, min = 0, max = 127, props_value = 0, onChange = null, custom = null } = props;
    const width = custom ? custom.width : 100
    const height = custom ? custom.height : 100

    const [lastMouseY, setLastMouseY] = useState(0)
    const [value, setValue] = useState(props_value)
    const [selected, setSelected] = useState(false)
    const canvas_ref = useRef<HTMLCanvasElement>(null)
    const dragStartRef = useRef<number>()
    const valueRef = useRef<number>()

    dragStartRef.current = lastMouseY
    valueRef.current = value



    useEffect(() => {
        const onMouseMove = (e: any): void => {
            e.preventDefault()
            const mouseY = e.pageY
            const delta = dragStartRef.current! - mouseY // NOTE: must use reference here, state value is not updated
            const new_value = Math.max(min, Math.min(valueRef.current! + delta, max)) // NOTE: same as above
            setValue(new_value)
            setLastMouseY(mouseY)
        }

        const onMouseUp = (e: any): void => {
            e.preventDefault()
            setSelected(false);
        }

        const onTouchMove = (e: any): void => {
            e.preventDefault()
            const numTouch = e.touches.length
            if (numTouch !== 1) {
                setSelected(false)
                return
            }
            const theTouch = e.touches[0]
            const mouseY = theTouch.pageY
            const delta = Math.round(dragStartRef.current! - mouseY) // NOTE: must use reference here, state value is not updated
            const new_value = Math.max(min, Math.min(valueRef.current! + delta, max)) // NOTE: same as above
            setValue(new_value)
            setLastMouseY(mouseY)

        }
        const onTouchEnd = (e: any): void => {
            e.preventDefault()
            setSelected(false);
        }

        const addAllEventListener = (): void => {
            document.addEventListener('mousemove', onMouseMove)
            document.addEventListener('mouseup', onMouseUp)
            document.addEventListener('touchmove', onTouchMove)
            document.addEventListener('touchend', onTouchEnd)
        }

        const removeAllEventListener = (): void => {
            document.removeEventListener('mousemove', onMouseMove)
            document.removeEventListener('mouseup', onMouseUp)
            document.removeEventListener('touchmove', onTouchMove)
            document.removeEventListener('touchend', onTouchEnd)
        }

        if (selected) {
            addAllEventListener()
        } else {
            removeAllEventListener()
        }
        return () => {
            removeAllEventListener()
        }
    }, [selected, min, max])

    useEffect(() => {
        const defaultDraw = (): void => {
            const canvas = canvas_ref.current
            if (!canvas) {
                return
            }
            const context = canvas.getContext('2d')
            if (!context) {
                return
            }

            const radius = 45
            const width = canvas.width
            const height = canvas.height

            // fill background
            context.fillStyle = '#000'
            context.fillRect(0, 0, width, height)

            // draw circle
            context.strokeStyle = '#fff'
            context.fillStyle = '#fff'
            context.lineWidth = 1.5
            context.beginPath()
            const centerX = width / 2
            const centerY = height / 2
            context.arc(centerX, centerY, radius, 0, Math.PI * 2)
            context.stroke()

            // draw mark
            const angle = (5.0 / 4.0) * Math.PI - ((3.0 / 2.0) * Math.PI * (value / (max - min))) // Starting from 225 deg, CW 270 deg
            const markX = centerX + 0.75 * radius * Math.cos(angle)
            const markY = centerY - 0.75 * radius * Math.sin(angle)
            context.beginPath()
            context.arc(markX, markY, 3, 0, Math.PI * 2)
            context.stroke()
            context.fill()

            // draw value text
            context.textAlign = 'center'
            context.fillStyle = '#fff'
            context.fillText(`${value}`, width / 2, height / 2)
        }

        if (onChange) {
            onChange(value)
        }
        const canvas = canvas_ref.current
        if (!canvas) {
            return
        }
        const context = canvas.getContext('2d')
        if (!context) {
            return
        }

        if (custom) {
            const params: KnobCustomDrawParameters = { width, height, value, min, max }
            custom.customDraw(params, context)
        } else {
            defaultDraw()
        }

    }, [value])

    const onMouseDown = (e: MouseEvent) => {
        e.preventDefault()
        setLastMouseY(e.pageY)
        setSelected(true)
    }
    const onTouchStart = (e: TouchEvent<HTMLCanvasElement>) => {
        const numTouch = e.touches.length
        if (numTouch !== 1) {
            return // disable when multi touch
        }
        const theTouch = e.touches[0]
        setLastMouseY(Math.round(theTouch.pageY))
        setSelected(true)
    }



    return (
        <div style={{ position: "absolute", left: x, top: y, margin: "0", padding: "0", width: 100, height: 100 }}>
            <canvas ref={canvas_ref}
                width={width}
                height={height}
                style={{ cursor: "pointer", display: "block" }}
                onMouseDown={onMouseDown}
                onTouchStart={onTouchStart}

            ></canvas>

        </div >
    )
})
