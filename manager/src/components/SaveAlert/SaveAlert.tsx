import React, {useRef} from 'react'

interface IProps{
    success : boolean,
    unsuccess : boolean
}

export const SaveAlert = ({ success , unsuccess } : IProps) => {
    return (
        <div className="mt-5">
            <div className="alert alert-success mt-5" hidden={!success}>
                Well Done. Successfully saved.
            </div>
            <div className="alert alert-danger mt-5" hidden={!unsuccess}>
                Error . Saving failed.
            </div>
        </div>
    )
}