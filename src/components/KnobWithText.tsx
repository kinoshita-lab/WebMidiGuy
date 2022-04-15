import { memo, useState, useEffect, useRef, MouseEvent, TouchEvent, VFC } from "react"
import { Knob, KnobCustomizeProperties } from "./Knob"

type Props = {
    caption?: string
    x?: number;
    y?: number;
    min?: number;
    max?: number;
    props_value?: number;
    onChange?: (value: number) => void;
    custom?: KnobCustomizeProperties;
};

export const KnobWithCaption: VFC<Props> = (props) => {
    const { caption, ...knobProps } = props
    return (
        <>
            <div>
                <p className="float">{caption}</p>
                <Knob
                    x={knobProps.x} y={knobProps.y ? knobProps.y + 10 : 0}
                    min={knobProps.min} max={knobProps.max}
                    props_value={knobProps.props_value}
                    onChange={knobProps.onChange} />
            </div>
        </>
    )
}