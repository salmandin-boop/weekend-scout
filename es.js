/* Weekend Scout · Spanish layer, loaded only when the app is in Spanish (keeps the English page small). Only loaded when the app is in Spanish. */
(() => {
const LANG = 'es';
const ES = {
  "What's on":'Qué hay', 'this weekend':'este fin de semana', 'Skip to events':'Ir a los eventos', 'Choose city':'Elige ciudad', 'This Weekend':'Este fin de semana',
  'Loading this weekend…':'Cargando el fin de semana…', 'Search events':'Buscar eventos', 'Filters':'Filtros', 'Map':'Mapa', 'Send':'Enviar', 'Nearest first':'Más cerca primero',
  "🎲 Can't decide? Pick one for me":'🎲 ¿No te decides? Elige uno por mí', 'Run a venue or event?':'¿Tienes un local o evento?',
  'Get listed here for free, or ask about one of only 3 Featured spots in your city each weekend.':'Aparece aquí gratis, o pregunta por uno de los solo 3 lugares Destacados de tu ciudad cada fin de semana.',
  'How to get listed':'Cómo aparecer', 'Your plans':'Tus planes', 'Saved':'Guardados', 'Tap the heart on any event to keep it here.':'Toca el corazón en cualquier evento para guardarlo aquí.',
  'Add all to my calendar':'Agregar todo a mi calendario', 'Share my weekend':'Compartir mi fin de semana', 'About':'Acerca de', 'This weekend':'Este finde',
  "A short, hand-checked list of what's worth doing each weekend, in cities across the US. New lists every Wednesday.":'Una lista corta y revisada a mano de lo que vale la pena hacer cada fin de semana en ciudades de EE. UU. Listas nuevas cada miércoles.',
  'Put it on your home screen':'Ponla en tu pantalla de inicio', 'On iPhone: tap Share, then':'En iPhone: toca Compartir y luego', 'Add to Home Screen':'Agregar a inicio',
  '. On Android: tap the ⋮ menu, then':'. En Android: toca el menú ⋮ y luego', 'Install app':'Instalar app', 'Install the app':'Instalar la app', 'GET IT ON':'DISPONIBLE EN',
  'Get a reminder every Wednesday':'Recibe un recordatorio cada miércoles', "We'll let you know when the new weekend list is out.":'Te avisamos cuando salga la nueva lista del fin de semana.',
  'Remind me on Wednesdays':'Recordarme los miércoles', 'Follow along':'Síguenos', 'Weekend picks, hidden gems and quick videos, every week.':'Planes, joyas escondidas y videos cortos, cada semana.',
  'Enjoying Weekend Scout?':'¿Te gusta Weekend Scout?', 'Rate it on Google Play':'Califícala en Google Play', '. It really helps a new app.':'. Ayuda mucho a una app nueva.',
  "Send us your event and we'll add it to the weekend list.":'Envíanos tu evento y lo agregamos a la lista del fin de semana.', 'Standard listing':'Anuncio estándar', 'Free':'Gratis',
  "Featured: one of only 3 spots at the top of your city's list, labeled Sponsored":'Destacado: uno de solo 3 lugares arriba de la lista de tu ciudad, marcado como Patrocinado',
  'Rates on request':'Precio a consultar', 'Business name':'Nombre del negocio', 'Your name':'Tu nombre', 'Business email':'Correo del negocio', 'Business phone':'Teléfono del negocio',
  'Business website':'Sitio web del negocio', 'Event name':'Nombre del evento', 'City':'Ciudad', 'Date and time':'Fecha y hora', 'Price':'Precio', 'Official event or ticket page':'Página oficial o de boletos',
  'Listing':'Anuncio', 'Free listing':'Anuncio gratis', 'Featured (send me rates)':'Destacado (envíenme precios)', "I work for this business and I'm allowed to promote this event.":'Trabajo para este negocio y puedo promocionar este evento.',
  'Send for review':'Enviar a revisión', 'To keep Weekend Scout safe, we check every business before it goes live:':'Para que Weekend Scout sea seguro, revisamos cada negocio antes de publicarlo:',
  "It's registered with the state and listed on Google Maps at the same address.":'Está registrado en el estado y aparece en Google Maps en la misma dirección.',
  'We call back on its public phone number.':'Llamamos a su número público.', 'The event is on its official website or a major ticket seller.':'El evento está en su sitio oficial o en una boletera conocida.',
  "Featured spots are limited to 3 per city each weekend, first approved, first booked. After approval we send a secure card payment link (Stripe) in the business's name. If a weekend is full, we offer the next open one.":'Los Destacados son máximo 3 por ciudad cada fin de semana: el primero aprobado, el primero reservado. Tras aprobarlo, enviamos un enlace de pago seguro (Stripe) a nombre del negocio. Si un fin de semana está lleno, ofrecemos el siguiente disponible.',
  'Or email or text us the details:':'O envíanos los detalles por correo o mensaje:', 'Copy':'Copiar', 'Email':'Correo', 'Text':'Mensaje', 'Good to know':'Bueno saber',
  'Times and prices can change. Check with the venue before you go.':'Horarios y precios pueden cambiar. Confirma con el lugar antes de ir.',
  'Some ticket links may earn us a small commission, at no cost to you.':'Algunos enlaces de boletos nos dan una pequeña comisión, sin costo para ti.',
  'Featured events are paid placements and are always labeled Sponsored.':'Los eventos Destacados son pagados y siempre dicen Patrocinado.',
  "Your saved events stay on this device only. We don't collect any personal data.":'Tus eventos guardados quedan solo en este dispositivo. No recopilamos datos personales.',
  '"Use my location" and "Nearest first" work out distances on your phone. Your location is never sent to us or stored.':'"Usar mi ubicación" y "Más cerca primero" calculan distancias en tu teléfono. Tu ubicación nunca se nos envía ni se guarda.',
  '"Picked for you" learns from what you open and save, on this phone only.':'"Para ti" aprende de lo que abres y guardas, solo en este teléfono.',
  'Weather comes from Open-Meteo and the map from OpenStreetMap. Neither gets your location.':'El clima viene de Open-Meteo y el mapa de OpenStreetMap. Ninguno recibe tu ubicación.',
  'Privacy policy':'Política de privacidad', 'Terms':'Términos', 'Search events, venues…':'Buscar eventos, lugares…', 'Change city':'Cambiar ciudad', 'Day':'Día', 'Main':'Principal',
  'Search events and venues':'Buscar eventos y lugares', 'Send this weekend to a friend':'Enviar este fin de semana a un amigo',
  // filters
  'Everything':'Todo', 'Under $25':'Menos de $25', 'Music':'Música', 'Sports':'Deportes', 'Arts':'Arte', 'Food & Drink':'Comida y bebida', 'Family':'Familia', 'Comedy':'Comedia',
  'Date night':'Cita', 'Kids':'Niños', 'Groups':'Grupos', 'Indoors':'Bajo techo', 'Outdoors':'Al aire libre', 'Dog friendly':'Se admiten perros', 'Accessible':'Accesible',
  'Type':'Tipo', 'Good for':'Ideal para', 'GOOD FOR':'IDEAL PARA', 'Sort':'Orden', 'Anything':'Cualquiera', 'Soonest first':'Más pronto primero', 'Clear all':'Borrar todo',
  'All':'Todo', 'weekend':'el finde', 'Today':'Hoy',
  // cards & sheet
  'See times':'Ver horarios', 'Times vary':'Horarios varían', 'see venue':'ver el lugar', 'Tickets':'Boletos', 'Sponsored':'Patrocinado', 'Event details':'Detalles del evento',
  'Directions':'Cómo llegar', 'Share':'Compartir', 'Story image':'Imagen para historia', 'Save':'Guardar', 'Save the event':'Guardar el evento', 'Find tickets & info':'Boletos e información',
  'Add to calendar':'Agregar al calendario', 'Report a problem':'Reportar un problema', 'Getting there:':'Cómo llegar:', 'Send this plan':'Enviar este plan', 'Book a table':'Reservar mesa',
  'Or nearby:':'O cerca:', 'Find a spot':'Buscar un lugar', 'Find coffee':'Buscar café', 'Find brunch':'Buscar brunch', 'Find food':'Buscar comida', 'Find a treat':'Buscar un antojo',
  'The main event':'El evento', 'Coffee first':'Primero un café', 'Warm up before you go.':'Para entrar en calor antes de ir.', 'Brunch after':'Brunch después', 'A slow late breakfast nearby.':'Un desayuno tardío y tranquilo cerca.',
  'Dessert or a nightcap':'Postre o una última copa', 'End the night somewhere cozy nearby.':'Termina la noche en un lugar acogedor cerca.', 'Grab a bite':'Algo de comer',
  'Something quick and shareable nearby.':'Algo rápido para compartir cerca.', 'Keep the night going.':'Que siga la noche.', 'Keep the day going.':'Que siga el día.',
  'Kid-friendly food close by.':'Comida para niños cerca.', 'Fuel up before the fun.':'Recarga energía antes de la diversión.', 'Treat on the way home':'Un antojo de regreso',
  'Ice cream, hot cocoa or a bakery stop.':'Helado, chocolate caliente o una panadería.', 'Pick a cozy spot close to the venue. Book ahead on weekends.':'Elige un lugar acogedor cerca. Reserva con tiempo los fines de semana.',
  'Date night plans':'Planes para una cita', 'Ready-made evenings':'Noches listas', 'Family day plans':'Planes en familia', 'Ready-made days out':'Días listos',
  'Night out with friends':'Salida con amigos', 'Ready-made plans':'Planes listos', 'Picked for you':'Para ti', 'Coming up':'Próximamente', 'Plan ahead':'Planea con tiempo', 'Any weekend':'Cualquier fin de semana',
  'Get every weekend in your calendar':'Recibe cada fin de semana en tu calendario', 'Google Calendar':'Google Calendar', 'Apple / Outlook':'Apple / Outlook',
  'Nothing matches':'Nada coincide', 'Try another day or filter, or clear your search.':'Prueba otro día o filtro, o borra tu búsqueda.', 'Show everything':'Ver todo',
  'Show indoor picks':'Ver planes bajo techo', 'Show outdoor picks':'Ver planes al aire libre', 'Date night picks':'Planes para una cita', 'How about this one?':'¿Qué tal este?',
  'No saved events yet':'Aún no tienes eventos guardados', "Tap the heart on anything that looks good and it'll wait for you here.":'Toca el corazón en lo que te guste y te esperará aquí.',
  'Browse this weekend':'Ver este fin de semana', 'Happening now':'Ahora mismo', 'Opening weekend':'Fin de semana de estreno', 'Friday only':'Solo viernes', 'Saturday only':'Solo sábado', 'Sunday only':'Solo domingo',
  'Sold out':'Agotado', 'Use my location':'Usar mi ubicación', 'Choose your city':'Elige tu ciudad', 'Choose a city':'Elige una ciudad', 'Holiday guides':'Guías de fiestas', 'From venues you follow':'De lugares que sigues', '★ Follow venue':'★ Seguir lugar', '★ Following venue':'★ Siguiendo este lugar', '★ Following':'★ Siguiendo', 'Venues you follow':'Lugares que sigues', 'Unfollow':'Dejar de seguir', 'Their events show up first, every weekend, in any city.':'Sus eventos salen primero, cada fin de semana, en cualquier ciudad.', 'Follow your favorite venues':'Sigue tus lugares favoritos', 'Open any event and tap "Follow venue". Its events will show up first every weekend.':'Abre cualquier evento y toca "Seguir lugar". Sus eventos saldrán primero cada fin de semana.', "Kids' ages":'Edades de los niños', 'All ages':'Todas las edades', 'Toddlers (0–4)':'Pequeños (0–4)', 'Kids (5–12)':'Niños (5–12)', 'Teens (13+)':'Adolescentes (13+)', 'Toddlers':'Pequeños', 'Kids':'Niños', 'Teens':'Adolescentes', 'Any budget':'Cualquier presupuesto', 'Under $50':'Menos de $50', 'No plans with tickets in that budget this weekend. Try a higher one.':'No hay planes con entradas en ese presupuesto este fin de semana. Prueba uno más alto.', 'Free event':'Evento gratis', 'Early picks for next weekend':'Primeros planes del próximo fin de semana', 'Coming up soon':'Muy pronto', "The full hand-checked list lands Wednesday. Here's what's already on the calendar.":'La lista completa revisada llega el miércoles. Esto ya está en el calendario.', "Below: last weekend's list.":'Abajo: la lista del fin de semana pasado.', 'Submit your event':'Envía tu evento', 'No email app opened? Copy this and email it to support@weekendscout.app, or text it to 315-383-9602:':'¿No se abrió tu correo? Copia esto y envíalo a support@weekendscout.app, o por mensaje al 315-383-9602:', 'Now':'Ahora', "That's it for today":'Eso es todo por hoy', 'Happening now':'En curso', 'Help us pick':'Ayúdanos a elegir', 'Choose 2 to 4 options and send one link. Friends see them side by side and tap their vote, which comes back to you as a message.':'Elige de 2 a 4 opciones y envía un enlace. Tus amigos las ven juntas y votan; el voto te llega como mensaje.', 'Your first name (optional)':'Tu nombre (opcional)', 'Send the vote':'Enviar la votación', 'Pick 2 to 4 options':'Elige de 2 a 4 opciones', 'Vote link copied. Paste it in your group chat':'Enlace copiado. Pégalo en tu chat de grupo', 'Which one should we do?':'¿Cuál hacemos?', 'Vote for this':'Votar por este', 'Details':'Detalles', 'Back to the vote':'Volver a la votación', 'Vote sent':'Voto enviado', 'Copied. Paste it in your chat':'Copiado. Pégalo en tu chat', 'Save at least 2 events first (tap the heart)':'Guarda al menos 2 eventos (toca el corazón)', "This vote was for an earlier weekend. Here's what's on now":'Esta votación era de otro fin de semana. Esto es lo de ahora', 'Your vote opens a message you send back.':'Tu voto abre un mensaje para responder.', 'Christmas lights':'Luces navideñas', 'Holiday markets':'Mercados navideños', "New Year's Eve":'Nochevieja', 'All season':'Toda la temporada', 'Get a heads-up every Friday morning':'Recibe un aviso cada viernes por la mañana', 'Remind me on Fridays':'Recuérdame los viernes', 'No thanks':'No, gracias', 'Reminders are on':'Recordatorios activados', 'Get a reminder every Friday morning':'Recibe un recordatorio cada viernes por la mañana', "A heads-up with your city's weekend picks before the weekend starts.":'Un aviso con los planes de tu ciudad antes del fin de semana.', 'Open the file we just saved to add a Friday 9 AM reminder to your calendar.':'Abre el archivo que guardamos para añadir un recordatorio los viernes a las 9 AM.', 'Search cities':'Buscar ciudades', 'More cities are on the way.':'Vienen más ciudades.', 'Closest events first':'Eventos más cercanos primero',
  'Copied. Paste it to a friend':'Copiado. Pégalo a un amigo', 'Story image saved':'Imagen guardada', 'Plan copied':'Plan copiado', 'Saved!':'¡Guardado!', 'Removed':'Quitado',
  'Free entry':'Entrada gratis', 'Tickets online':'Boletos en línea', 'Opens Friday':'Abre el viernes', 'Opens Saturday':'Abre el sábado', 'Check details':'Ver detalles', 'Vehicle fee in season':'Cuota por vehículo en temporada',
  'Event info':'Info del evento', 'Calendar':'Calendario', 'More about this event':'Más sobre este evento', 'Something wrong with this listing?':'¿Algo está mal en este anuncio?',
  'Ticket links may earn us a small commission, at no cost to you. Times and prices can change — check with the venue.':'Algunos enlaces de boletos nos dan una pequeña comisión, sin costo para ti. Horarios y precios pueden cambiar; confirma con el lugar.',
  'Weekend Scout is run by ENDins LLC, East Syracuse, NY. ·':'Weekend Scout es de ENDins LLC, East Syracuse, NY. ·', 'Official site':'Sitio oficial', 'Get tickets':'Comprar boletos', 'More info':'Más información', 'Check ticket prices':'Ver precios', 'Timed tickets':'Boletos con horario', 'Free admission':'Entrada gratis', 'Español':'Español', 'English':'English'
};
const ES_RX = [
  [/^(\d+) (?:things?|picks?) to do this weekend$/, (m,n) => `${n} ${n === '1' ? 'plan' : 'planes'} este fin de semana`],
  [/^(\d+) (?:things?) to do on (\w+)$/, (m,n,d) => `${n} ${n === '1' ? 'plan' : 'planes'} el ${d.toLowerCase()}`],
  [/^(\d+) (date night picks?|picks? for kids|picks? for groups|indoor picks?|outdoor picks?|dog-friendly picks?|accessible picks?) (this weekend|on (\w+))$/, (m,n,k,w,d) => {
    const K = { 'date night pick':'plan para una cita', 'date night picks':'planes para una cita', 'pick for kids':'plan para niños', 'picks for kids':'planes para niños', 'pick for groups':'plan para grupos', 'picks for groups':'planes para grupos',
      'indoor pick':'plan bajo techo', 'indoor picks':'planes bajo techo', 'outdoor pick':'plan al aire libre', 'outdoor picks':'planes al aire libre', 'dog-friendly pick':'plan con perro', 'dog-friendly picks':'planes con perro', 'accessible pick':'plan accesible', 'accessible picks':'planes accesibles' };
    return `${n} ${K[k] || k} ${d ? 'el ' + d.toLowerCase() : 'este fin de semana'}`; }],
  [/^Show (\d+) events?$/, (m,n) => `Ver ${n} ${n === '1' ? 'evento' : 'eventos'}`],
  [/^(Dinner|Early dinner|Lunch|Lunch first|Nightcap|Drinks after|Happy hour) (at|nearby)(.*)$/, (m,a,b,rest) => ({ 'Dinner':'Cena', 'Early dinner':'Cena temprano', 'Lunch':'Almuerzo', 'Lunch first':'Primero almuerzo', 'Nightcap':'Última copa', 'Drinks after':'Tragos después', 'Happy hour':'Happy hour' }[a]) + (b === 'at' ? ' en' + rest : ' cerca')],
  [/^(\d+) min walk$/, (m,n) => `${n} min a pie`], [/^([\d.]+) mi away$/, (m,n) => `a ${n} mi`],
  [/^Starts in (.+)$/, (m,x) => `Empieza en ${x}`], [/^Ends in (.+)$/, (m,x) => `Termina en ${x}`],
  [/^Good for: (.+)$/, (m,x) => 'Ideal para: ' + x.split(', ').map(w => ({ 'date night':'cita', 'kids':'niños', 'groups':'grupos', 'indoors':'bajo techo', 'outdoors':'al aire libre', 'dog friendly':'perros', 'accessible':'accesible' }[w] || w)).join(', ')],
  [/^Always good in (.+)$/, (m,c) => `Siempre bueno en ${c}`],
  [/^A quick reminder with (.+)'s picks before the weekend starts\.$/, (m,c) => `Un recordatorio con los planes de ${c} antes del fin de semana.`],
  [/^Done\. You'll get a notification on Friday mornings with (.+)'s picks\.$/, (m,c) => `Listo. Recibirás un aviso los viernes por la mañana con los planes de ${c}.`],
  [/^(.+) wants your vote$/, (m,n) => `${n} quiere tu voto`], [/^Help us pick · (.+)$/, (m,c) => `Ayúdanos a elegir · ${c}`],
  [/^Your vote opens a message you send back to (.+)\.$/, (m,n) => `Tu voto abre un mensaje para enviarle a ${n}.`], [/^Copied\. Paste it to (.+)$/, (m,n) => `Copiado. Pégalo a ${n}`],
  [/^Visiting (.+)\? See a one-day plan →$/, (m,c) => `¿Visitas ${c}? Mira un plan de un día →`],
  [/^(\d+) things? still ahead (today|tonight)$/, (m,n,w) => `${n} ${n === '1' ? 'plan' : 'planes'} por delante ${w === 'tonight' ? 'esta noche' : 'hoy'}`],
  [/^Everything on today's list has wrapped up\. Tomorrow's picks are ready\.$/, () => 'Todo lo de hoy ya terminó. Los planes de mañana están listos.'],
  [/^Show all of (.+)$/, (m,d) => `Ver todo el ${d.toLowerCase()}`], [/^See (Viernes|Sábado|Domingo|Friday|Saturday|Sunday)$/, (m,d) => `Ver ${d.toLowerCase()}`],
  [/^Tickets from \$(\d+) pp$/, (m,n) => `Entradas desde $${n} p/p`], [/^(\d+) this weekend$/, (m,n) => `${n} este fin de semana`],
  [/^Next weekend · (.+)$/, (m,d) => `Próximo fin de semana · ${d}`], [/^Always good: (.+)$/, (m,x) => `Siempre bueno: ${x}`],
  [/^Following (.+)\. Its events will show up first\.$/, (m,v) => `Sigues ${v}. Sus eventos saldrán primero.`], [/^Stopped following (.+)$/, (m,v) => `Dejaste de seguir ${v}`],
  [/^(\d+) picks?$/, (m,n) => `${n} ${n === '1' ? 'plan' : 'planes'}`],
  [/^Updated (.+)$/, (m,x) => `Actualizado ${x}`], [/^(.+) · Updated (.+)$/, (m,a,b) => `${a} · Actualizado ${b}`],
  [/^Date night plan · (.+)$/, (m,x) => `Plan para una cita · ${x}`], [/^Family day plan · (.+)$/, (m,x) => `Plan en familia · ${x}`], [/^Friends night plan · (.+)$/, (m,x) => `Plan con amigos · ${x}`],
  [/^(.+?) · Free$/, (m,a) => `${a} · Gratis`],
  [/^🎉 (.+)\. Some hours change\.$/, (m,a) => `🎉 ${a}. Algunos horarios cambian.`],
  [/^(Fri|Sat|Sun)–(Fri|Sat|Sun)$/, (m,a,b) => `${({Fri:'Vie',Sat:'Sáb',Sun:'Dom'})[a]}–${({Fri:'Vie',Sat:'Sáb',Sun:'Dom'})[b]}`],
  [/^(From )?\$[\d.]+.*$/, m => m.replace(/^From /, 'Desde ').replace(/\badults?\b/g, 'adultos').replace(/\bkids?\b/g, 'niños').replace(/\byouth\b/g, 'jóvenes').replace(/\bseniors?\b/g, 'mayores').replace(/\bchildren\b/g, 'niños')],
  [/^© (\d+) ENDins LLC · Version ([\d.]+) · Events updated (.+)$/, (m,y,v,d) => `© ${y} ENDins LLC · Versión ${v} · Eventos actualizados ${d}`],
  [/^(.+) →$/, (m,a) => (Object.prototype.hasOwnProperty.call(ES, a) ? ES[a] : a) + ' →'],
  [/^(?:☂ )?Rain likely (.+) \((\d+)%\)\.$/, (m,d,p) => `☂ Probable lluvia el ${d.replace(' and ', ' y ').toLowerCase()} (${p}%).`],
  [/^(?:☀ )?Nice weather (.+) \((\d+)°\)\.$/, (m,d,t) => `☀ Buen clima el ${d.replace(' and ', ' y ').toLowerCase()} (${t}°).`],
  [/^\+(\d+) more shows?$/, (m,n) => `+${n} ${n === '1' ? 'función' : 'funciones'} más`], [/^to (.+)$/, (m,x) => `hasta ${x}`],
  [/^Subscribe once and (.+)'s picks show up in your calendar each week, updated automatically\.$/, (m,c) => `Suscríbete una vez y los planes de ${c} aparecen en tu calendario cada semana, actualizados solos.`],
  [/^Event: (.+?)\. (.*)$/, (m,a) => `Evento: ${a === 'Free' ? 'Gratis' : a}. Comida y bebida van por tu cuenta; reserva con tiempo los fines de semana.`],
  [/^(\d+) to (\d+)$/, null]
];
const ES_SUB = [[/ · Tickets$/g, ' · Boletos'], [/ min walk\b/g, ' min a pie'], [/ mi away\b/g, ' mi'], [/\bFarm-to-table\b/g, 'De la granja a la mesa']];
function trES(t){
  const k = t.trim(); if (!k) return null;
  if (Object.prototype.hasOwnProperty.call(ES, k)) return t.replace(k, ES[k]);
  for (const [rx, fn] of ES_RX){ if (!fn) continue; const m = k.match(rx); if (m) return t.replace(k, fn(...m)); }
  let o = t; for (const [rx, r] of ES_SUB) o = o.replace(rx, r);
  return o !== t ? o : null;
}
const ES_SKIP = new Set(['SCRIPT','STYLE','TEXTAREA','INPUT','SELECT','OPTION','CODE']);
function translateTree(root){
  if (LANG !== 'es' || !root) return;
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: n => n.parentElement && !ES_SKIP.has(n.parentElement.tagName) && !n.parentElement.closest('h3 .open, .venue, [data-notr]') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT });
  const nodes = []; while (w.nextNode()) nodes.push(w.currentNode);
  for (const n of nodes){ const r = trES(n.nodeValue); if (r !== null && r !== n.nodeValue) n.nodeValue = r; }
  const els = root.querySelectorAll ? root.querySelectorAll('[placeholder],[aria-label],[title]') : [];
  for (const el of [root, ...els]){ if (!el.getAttribute) continue; for (const a of ['placeholder','aria-label','title']){ const v = el.getAttribute(a); if (v){ const r = trES(v); if (r !== null && r !== v) el.setAttribute(a, r); } } }
}
if (LANG === 'es'){
  const mo = new MutationObserver(ms => { for (const m of ms){ if (m.type === 'characterData'){ const r = trES(m.target.nodeValue); if (r !== null && r !== m.target.nodeValue) m.target.nodeValue = r; } else m.addedNodes.forEach(n => n.nodeType === 1 ? translateTree(n) : n.nodeType === 3 && n.parentElement && !ES_SKIP.has(n.parentElement.tagName) && (r => r !== null && r !== n.nodeValue && (n.nodeValue = r))(trES(n.nodeValue))); } });
  const go = () => { translateTree(document.body); mo.observe(document.body, { childList:true, subtree:true, characterData:true }); };
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', go) : go();
}
})();
