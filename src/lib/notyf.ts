import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';

let notyf: Notyf | null = null;

if (typeof window !== 'undefined') {
  notyf = new Notyf();
}

export default notyf; 