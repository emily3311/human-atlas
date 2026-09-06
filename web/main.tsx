import {createRoot} from 'react-dom/client';
import Home from '../app/page';
import TcmApp from '../app/tcm/TcmApp';
import '../app/globals.css';
createRoot(document.getElementById('root')!).render(new URLSearchParams(location.search).get('view')==='anatomy'?<Home/>:<TcmApp/>);
