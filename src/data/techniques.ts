import { Technique } from '../types';

export const TECHNIQUES: Technique[] = [
  // De pie
  { id: 'double-leg', name: 'Double Leg', position: 'De pie', kind: 'Derribo', tags: ['Derribo', 'Gi/No-Gi'], level: 'Blanco', description: 'Cambio de nivel, penetración y finalización del derribo llevando las dos piernas del rival.' },
  { id: 'single-leg', name: 'Single Leg', position: 'De pie', kind: 'Derribo', tags: ['Derribo', 'Gi/No-Gi'], level: 'Blanco', description: 'Derribo a una pierna con opciones de acabado: correr la esquina, levantar o barrer.' },
  { id: 'guard-pull', name: 'Tirar a guardia', position: 'De pie', kind: 'Transición', tags: ['Transición', 'Gi/No-Gi'], level: 'Blanco', description: 'Llevar el combate al suelo de forma controlada sin perder la posición.' },
  { id: 'osoto-gari', name: 'Osoto Gari', position: 'De pie', kind: 'Derribo', tags: ['Judo', 'Gi'], level: 'Azul', description: 'Proyección de judo barriendo la pierna de apoyo desde atrás.' },
  { id: 'uchimata', name: 'Uchimata', position: 'De pie', kind: 'Derribo', tags: ['Judo', 'Gi'], level: 'Azul', description: 'Proyección de cadera con barrido interno del muslo.' },

  // Pases
  { id: 'knee-slice', name: 'Knee Slice Pass', position: 'Pases', kind: 'Pase', tags: ['Pase de guardia', 'Top', 'Gi'], level: 'Blanco', description: 'Cortar la rodilla por dentro de la guardia y asentar el peso en control lateral.' },
  { id: 'toreando', name: 'Toreando Pass', position: 'Pases', kind: 'Pase', tags: ['Pase de guardia', 'Top', 'Gi/No-Gi'], level: 'Blanco', description: 'Controlar los pantalones, desviar las piernas y rodear hacia el lateral.' },
  { id: 'over-under', name: 'Over-Under Pass', position: 'Pases', kind: 'Pase', tags: ['Pase de guardia', 'Presión', 'Gi/No-Gi'], level: 'Azul', description: 'Pase de presión con un brazo por encima y otro por debajo de las piernas.' },
  { id: 'stack-pass', name: 'Stack Pass', position: 'Pases', kind: 'Pase', tags: ['Pase de guardia', 'Presión', 'Gi/No-Gi'], level: 'Azul', description: 'Apilar al rival sobre sus hombros para abrir la guardia y pasar.' },
  { id: 'leg-drag', name: 'Leg Drag', position: 'Pases', kind: 'Pase', tags: ['Pase de guardia', 'Top', 'Gi/No-Gi'], level: 'Morado', description: 'Arrastrar la pierna del rival a través de su cuerpo para fijar la cadera.' },

  // Guardia
  { id: 'triangle', name: 'Triangle Choke', position: 'Guardia', kind: 'Finalización', tags: ['Finalización', 'Guardia cerrada', 'Gi/No-Gi'], level: 'Blanco', description: 'Estrangulación con las piernas alrededor del cuello y un brazo del rival.' },
  { id: 'armbar-guard', name: 'Armbar desde guardia cerrada', position: 'Guardia', kind: 'Finalización', tags: ['Finalización', 'Guardia cerrada', 'Gi/No-Gi'], level: 'Blanco', description: 'Aislar el brazo, pivotar la cadera y extender contra la articulación del codo.' },
  { id: 'scissor-sweep', name: 'Scissor Sweep', position: 'Guardia', kind: 'Raspada', tags: ['Raspada', 'Guardia cerrada', 'Gi'], level: 'Blanco', description: 'Raspada clásica con tijera de piernas desde guardia cerrada.' },
  { id: 'hip-bump', name: 'Hip Bump Sweep', position: 'Guardia', kind: 'Raspada', tags: ['Raspada', 'Guardia cerrada', 'Gi/No-Gi'], level: 'Blanco', description: 'Sentarse, empujar con la cadera y terminar en montada.' },
  { id: 'dlr-sweep', name: 'De La Riva Sweep', position: 'Guardia', kind: 'Raspada', tags: ['Raspada', 'Guardia abierta', 'Gi'], level: 'Azul', description: 'Enganche De La Riva para desequilibrar y barrer.' },
  { id: 'z-guard', name: 'Z Guard (media guardia)', position: 'Guardia', kind: 'Transición', tags: ['Media guardia', 'Gi/No-Gi'], level: 'Azul', description: 'Marco con la rodilla para controlar la distancia desde media guardia.' },
  { id: 'butterfly-sweep', name: 'Butterfly Sweep', position: 'Guardia', kind: 'Raspada', tags: ['Raspada', 'Guardia abierta', 'Gi/No-Gi'], level: 'Azul', description: 'Elevar con los ganchos mientras se inclina al rival hacia un lado.' },
  { id: 'omoplata', name: 'Omoplata', position: 'Guardia', kind: 'Finalización', tags: ['Finalización', 'Guardia abierta', 'Gi/No-Gi'], level: 'Azul', description: 'Llave de hombro usando las piernas desde guardia abierta.' },

  // Control
  { id: 'upa', name: 'Upa (escape de montada)', position: 'Control', kind: 'Escape', tags: ['Escape', 'Montada', 'Gi/No-Gi'], level: 'Blanco', description: 'Atrapar brazo y pie del mismo lado y puentear para invertir la posición.' },
  { id: 'shrimp-escape', name: 'Escape de cadera (shrimp)', position: 'Control', kind: 'Escape', tags: ['Escape', 'Control lateral', 'Gi/No-Gi'], level: 'Blanco', description: 'Crear espacio con la cadera para recuperar la guardia desde control lateral.' },
  { id: 'kimura-side', name: 'Kimura desde Control Lateral', position: 'Control', kind: 'Finalización', tags: ['Finalización', 'Top', 'No-Gi'], level: 'Blanco', description: 'Llave de hombro con la empuñadura de figura cuatro desde control lateral.' },
  { id: 'americana', name: 'Americana', position: 'Control', kind: 'Finalización', tags: ['Finalización', 'Montada', 'Gi/No-Gi'], level: 'Blanco', description: 'Llave de hombro con el brazo del rival doblado contra el suelo.' },
  { id: 'back-take', name: 'Toma de espalda', position: 'Control', kind: 'Transición', tags: ['Transición', 'Espalda', 'Gi/No-Gi'], level: 'Blanco', description: 'Pasar del lateral o de la guardia a la espalda con ganchos puestos.' },
  { id: 'rnc', name: 'Rear Naked Choke', position: 'Control', kind: 'Finalización', tags: ['Finalización', 'Espalda', 'Gi/No-Gi'], level: 'Blanco', description: 'Estrangulación desde la espalda sin usar el kimono.' },
  { id: 'cross-collar', name: 'Cross Collar Choke', position: 'Control', kind: 'Finalización', tags: ['Finalización', 'Montada', 'Gi'], level: 'Azul', description: 'Estrangulación cruzando las solapas desde la montada o la guardia.' },

  // Leg locks
  { id: 'straight-ankle', name: 'Straight Ankle Lock', position: 'Leg locks', kind: 'Finalización', tags: ['Leg lock', 'Finalización', 'Gi/No-Gi'], level: 'Azul', description: 'Llave recta de tobillo extendiendo la cadera contra el empeine.' },
  { id: 'kneebar', name: 'Kneebar', position: 'Leg locks', kind: 'Finalización', tags: ['Leg lock', 'Finalización', 'Gi/No-Gi'], level: 'Azul', minBelt: 'Azul', description: 'Hiperextensión de rodilla con la pierna atrapada entre tus muslos.' },
  { id: 'toe-hold', name: 'Toe Hold', position: 'Leg locks', kind: 'Finalización', tags: ['Leg lock', 'Finalización', 'Gi/No-Gi'], level: 'Morado', minBelt: 'Azul', description: 'Torsión de tobillo con agarre de pie y muñeca en figura cuatro.' },
  { id: 'inside-heel-hook', name: 'Inside Heel Hook', position: 'Leg locks', kind: 'Finalización', tags: ['Leg lock', 'Heel hook', 'No-Gi'], level: 'Morado', minBelt: 'Azul', description: 'Rotación del talón hacia dentro. Alto riesgo de lesión: se practica con control y tap temprano.' },
  { id: 'outside-heel-hook', name: 'Outside Heel Hook', position: 'Leg locks', kind: 'Finalización', tags: ['Leg lock', 'Heel hook', 'No-Gi'], level: 'Marrón', minBelt: 'Azul', description: 'Rotación del talón hacia fuera. Alto riesgo de lesión: se practica con control y tap temprano.' },
];

export function isHeelHook(t: Technique): boolean {
  return t.tags.includes('Heel hook');
}
