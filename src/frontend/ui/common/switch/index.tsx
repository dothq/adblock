import React from 'react'

import switchStyle from './switch.module.css'

export const Switch = ({ defaultState, checkedColour, onChange }: { defaultState: boolean; checkedColour: string, onChange: any }) => {
    const [state, setState] = React.useState(defaultState);

    const onSChange = () => {
        setState(!state)
        onChange(state);
    }

    return (
        <div className={switchStyle.parent} onClick={() => onSChange()}>
            <i style={{ backgroundColor: state ? checkedColour : "" }} className={`${switchStyle.switchCircle} ${state == true ? switchStyle.switchCircleChecked : ""}`}></i>
        </div>
    )
}