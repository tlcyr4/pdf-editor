import React from 'react';

export default function FileList(props) {
    return (

        <div className="workspace-view">
            <h2>Files To Merge</h2>
            <ol className="file-list">
                {props.files.map((file, i) => 
                <li key={i.toString()} className="file-record">
                    <div>{file.name}</div>
                    <div className="btn-container">
                        <button className="btn chinese" onClick={props.handleSelect(i)}>修改</button>
                        <button className="btn chinese" onClick={props.handleDelete(i)}>删掉</button>
                        <button className="btn chinese" onClick={props.handleUp(i)}>上</button>
                        <button className="btn chinese" onClick={props.handleDown(i)}>下</button>
                    </div>
                </li>)}
                        
            </ol>
        </div>
    )
}
