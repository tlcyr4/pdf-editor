import React from 'react';
import {List} from '@fluentui/react';

export default function FileList(props) {
    return (
        <List
          items={[]}
          />
    )
    // return (

    //     <div className="workspace-view">
    //         {/* <ol className="file-list">
    //             {props.files.map((file, i) => 
    //             <li key={i.toString()} className="file-record">
    //                 <div className="file-name">{file.name}</div>
    //                 <div className="btn-container">
    //                     <button className="btn chinese" onClick={props.handleSelect(i)}>修改</button>
    //                     <button className="btn chinese" onClick={props.handleDelete(i)}>删掉</button>
    //                     <button className="btn chinese" onClick={props.handleUp(i)}>上</button>
    //                     <button className="btn chinese" onClick={props.handleDown(i)}>下</button>
    //                 </div>
    //             </li>)}
                        
    //         </ol> */}
    //         <StaticTable/>
    //     </div>
    // )
}
