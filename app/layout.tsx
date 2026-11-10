import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata={title:'ñapa · Finanzas claras',description:'Entiende el presente. Decide lo que sigue. Análisis financiero de Industrias Plásticas Altamira.',icons:{icon:'/favicon.svg'}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="es"><body>{children}</body></html>}
