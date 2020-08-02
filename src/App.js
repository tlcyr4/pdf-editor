import React from 'react';
import {useState} from 'react';
import {Breadcrumb, FontWeights } from '@fluentui/react';
import { Depths } from '@uifabric/fluent-theme/lib/fluent/FluentDepths';
import { FontSizes } from '@uifabric/fluent-theme/lib/fluent/FluentType';
import PDFEditor from './PDFEditor';


function App() {
  const baseCrumbs = [
    { text: "Home", key: 'Home'},
    { text: "PDF", key: 'PDF'},
  ];
  let [childCrumbs, setChildCrumbs] = useState([]);
  return (
    <div style={{height:"100vh",width:"100vw", display:"flex", flexDirection:"column"}}>
        <SiteNav/>
        <div
          style={{
            padding: "0px 60px",
            boxShadow: Depths.depth4
          }}>
            <Breadcrumb items={[...baseCrumbs,...childCrumbs]}/>
        </div>
        <PDFEditor
          setCrumbs={setChildCrumbs}
        />
    </div>
  );
}



function SiteNav(props) {
  return (
    <nav style={{flex:"0 0 auto", padding: "0.67em 60px", display: "flex", flexDirection: "row", justifyContent: "space-between", boxShadow: Depths.depth4}}>
        <div>
          <div style={{
            fontSize:FontSizes.size28,
            lineHeight: '36px',
            fontWeight: FontWeights.semibold,
            color:'#358510'
            }}>
              Gong-Gong
          </div>
        </div>
        <div>
          <div style={{
            fontSize:FontSizes.size28,
            lineHeight: '36px',
            fontWeight: FontWeights.semibold,
            color:'#358510'
            }}>PDF</div>
        </div>
    </nav>
  );
}

export default App;
