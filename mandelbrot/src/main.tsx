import { createRoot } from 'react-dom/client'

import './index.css'
import Mandelbrot from './Mandelbrot'

createRoot(document.getElementById('root')!).render(
  <Mandelbrot />
)
