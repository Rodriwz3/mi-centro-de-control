// Frases de Mi Centro de Control.
// "desde" indica en qué versión de la app se agregó cada frase: así, al actualizar,
// se suman las nuevas sin tocar las que ya tenías (ni revivir las que borraste).
// Las frases sin autor son originales de la app.

export const VERSION_FRASES = 2;

const v = (desde, categoria, lista) => lista.map(([texto, autor = '']) => ({ texto, autor, categoria, desde }));

export const FRASES = [
  // ---------- One Piece ----------
  ...v(1, 'onepiece', [
    ['¡Voy a ser el Rey de los Piratas!', 'Monkey D. Luffy · One Piece'],
  ]),
  ...v(2, 'onepiece', [
    ['Cuando decidí seguir mi sueño, ya había dejado mi vida de lado.', 'Roronoa Zoro · One Piece'],
    ['¡El One Piece es real!', 'Barbablanca · One Piece'],
    ['¿Mi tesoro? Si lo quieren, búsquenlo. Lo dejé todo en ese lugar.', 'Gol D. Roger · One Piece'],
    ['¿Cuándo muere una persona? Cuando la olvidan.', 'Dr. Hiluluk · One Piece'],
    ['Si no arriesgás tu vida, no podés crear un futuro.', 'Monkey D. Luffy · One Piece'],
    ['¡Quiero vivir! ¡Llévenme al mar con ustedes!', 'Nico Robin · One Piece'],
    ['No quiero conquistar nada. El que es más libre en todo el mar es el Rey de los Piratas.', 'Monkey D. Luffy · One Piece'],
    ['Gracias por quererme.', 'Portgas D. Ace · One Piece'],
    ['Cada tarea tachada es una isla más en tu Grand Line.'],
    ['Tu tripulación cree en vos. Empezá por creer vos también.'],
    ['Ningún pirata llegó a Laugh Tale sin navegar tormentas.'],
    ['Hoy no hace falta encontrar el One Piece: alcanza con avanzar una milla.'],
    ['Estirate como Luffy: un poco más de lo que creés que podés.'],
    ['Un buen nakama también se cuida: comé bien, dormí y descansá.'],
    ['Si te caés al mar, que sea persiguiendo algo que valga la pena.'],
  ]),

  // ---------- Naruto ----------
  ...v(1, 'naruto', [
    ['Si no te gusta tu destino, no lo aceptes. Tené el coraje de cambiarlo como vos quieras.', 'Naruto Uzumaki · Naruto'],
    ['Nunca retrocedo en mi palabra. ¡Ese es mi camino ninja!', 'Naruto Uzumaki · Naruto'],
  ]),
  ...v(2, 'naruto', [
    ['El trabajo duro no sirve de nada si no creés en vos mismo.', 'Naruto Uzumaki · Naruto'],
    ['Cuando una persona tiene algo importante que proteger, ahí se vuelve realmente fuerte.', 'Haku · Naruto'],
    ['Un lugar donde alguien todavía piensa en vos es un lugar al que podés llamar hogar.', 'Jiraiya · Naruto'],
    ['Los que rompen las reglas son escoria, pero los que abandonan a sus amigos son peores que escoria.', 'Kakashi Hatake · Naruto'],
    ['Aunque no pueda usar ninjutsu ni genjutsu, voy a demostrar que puedo ser un gran ninja.', 'Rock Lee · Naruto'],
    ['¡No me voy a rendir, de veras!', 'Naruto Uzumaki · Naruto'],
    ['Hoy entrená como si fueras a ser Hokage.'],
    ['Mil clones de sombra empiezan con uno solo.'],
    ['Tu camino ninja se escribe con lo que hacés cuando nadie te mira.'],
    ['Rock Lee no tenía talento para el ninjutsu y se volvió fuerte igual: entrenando.'],
    ['De Genin a Hokage no hay atajos: hay entrenamiento diario.'],
    ['Un ramen de Ichiraku sabe mejor después de cumplir tus hábitos.'],
    ['Si fallás, levantate y volvé a intentarlo. Así se forjó el Séptimo Hokage.'],
  ]),

  // ---------- Black Clover ----------
  ...v(2, 'blackclover', [
    ['¡No rendirse es mi magia!', 'Asta · Black Clover'],
    ['¡Voy a ser el Rey Mago!', 'Asta · Black Clover'],
    ['Superá tus límites. ¡Acá y ahora!', 'Yami Sukehiro · Black Clover'],
    ['Aunque no tenga magia, nunca me voy a rendir.', 'Asta · Black Clover'],
    ['Tu grimorio se escribe con lo que hacés hoy.'],
    ['Sin magia, Asta entrenó el doble. Vos también podés.'],
    ['Cada día cumplido es una página más de tu grimorio.'],
    ['Superá tus límites de ayer: esa es la única competencia.'],
    ['Los Toros Negros no son perfectos, pero nunca se rinden.'],
    ['Cortá la duda como Asta corta la magia.'],
    ['Hasta un trébol de cinco hojas empezó siendo una semilla.'],
  ]),

  // ---------- Otros animes ----------
  ...v(1, 'anime', [
    ['Si no peleás, no podés ganar.', 'Eren Jaeger · Attack on Titan'],
    ['Quien no puede sacrificar nada, nunca podrá cambiar nada.', 'Armin Arlert · Attack on Titan'],
    ['No creas en vos. Creé en mí, que creo en vos.', 'Kamina · Gurren Lagann'],
    ['Andá más allá: ¡Plus Ultra!', 'All Might · My Hero Academia'],
  ]),

  // ---------- Motivación ----------
  ...v(1, 'motivacion', [
    ['El éxito es la suma de pequeños esfuerzos repetidos día tras día.', 'Robert Collier'],
    ['Somos lo que hacemos repetidamente. La excelencia no es un acto, sino un hábito.', 'Will Durant'],
    ['La disciplina es el puente entre las metas y los logros.', 'Jim Rohn'],
    ['Empezá donde estás. Usá lo que tenés. Hacé lo que puedas.', 'Arthur Ashe'],
  ]),
  ...v(2, 'motivacion', [
    ['Caer está permitido. ¡Levantarse es obligatorio!', 'Proverbio ruso'],
    ['No nos atrevemos a muchas cosas porque son difíciles, pero son difíciles porque no nos atrevemos.', 'Séneca'],
    ['Quien tiene un porqué para vivir puede soportar casi cualquier cómo.', 'Friedrich Nietzsche'],
    ['Un viaje de mil millas comienza con un solo paso.', 'Lao Tse'],
    ['Siempre parece imposible hasta que se hace.', 'Nelson Mandela'],
    ['La educación es el arma más poderosa que podés usar para cambiar el mundo.', 'Nelson Mandela'],
    ['La suerte es lo que sucede cuando la preparación se encuentra con la oportunidad.', 'Séneca'],
    ['El secreto para salir adelante es comenzar.', 'Mark Twain'],
    ['La motivación te pone en marcha; el hábito te mantiene en movimiento.', 'Jim Ryun'],
    ['No tenés que ser grande para empezar, pero tenés que empezar para ser grande.', 'Zig Ziglar'],
    ['Creé que podés y ya estás a mitad de camino.', 'Theodore Roosevelt'],
    ['El éxito no es definitivo y el fracaso no es fatal: lo que cuenta es el valor para continuar.', 'Atribuida a Winston Churchill'],
    ['Lo que hacemos en la vida tiene eco en la eternidad.', 'Máximo · Gladiador'],
    ['Hacelo o no lo hagas, pero no lo intentes.', 'Yoda · Star Wars'],
    ['La paciencia es amarga, pero su fruto es dulce.', 'Jean-Jacques Rousseau'],
    ['Nuestra mayor gloria no está en no caer nunca, sino en levantarnos cada vez que caemos.', 'Atribuida a Confucio'],
    ['La mejor forma de predecir el futuro es crearlo.', 'Atribuida a Peter Drucker'],
    ['Lo importante es no dejar de hacerse preguntas.', 'Albert Einstein'],
    ['La vida es como andar en bicicleta: para mantener el equilibrio hay que seguir adelante.', 'Albert Einstein'],
    ['Cuidá tu cuerpo: es el único lugar donde vas a vivir siempre.', 'Jim Rohn'],
    ['La constancia vence lo que la dicha no alcanza.', 'Refrán'],
    ['Poco a poco se va lejos.', 'Refrán'],
    ['Gota a gota, el agua horada la piedra.', 'Refrán'],
    ['No dejes para mañana lo que podés hacer hoy.', 'Refrán'],
    ['El que no arriesga no gana.', 'Refrán'],
  ]),

  // ---------- Deporte ----------
  ...v(1, 'deporte', [
    ['No cuentes los días: hacé que los días cuenten.', 'Muhammad Ali'],
    ['Fallé una y otra vez en mi vida. Por eso tuve éxito.', 'Michael Jordan'],
    ['Errás el 100 % de los tiros que no hacés.', 'Wayne Gretzky'],
  ]),
  ...v(2, 'deporte', [
    ['Odié cada minuto de entrenamiento, pero me dije: no abandones. Sufrí ahora y viví el resto de tu vida como un campeón.', 'Muhammad Ali'],
    ['El dolor es temporal. Rendirse dura para siempre.', 'Lance Armstrong'],
    ['Es difícil vencer a alguien que nunca se rinde.', 'Babe Ruth'],
    ['Cuanto más soñás, más lejos llegás.', 'Michael Phelps'],
    ['El talento gana partidos, pero el trabajo en equipo y la inteligencia ganan campeonatos.', 'Michael Jordan'],
    ['Los campeones siguen jugando hasta que les sale bien.', 'Billie Jean King'],
    ['Me llevó 17 años y 114 días convertirme en un éxito de la noche a la mañana.', 'Lionel Messi'],
    ['Los momentos de mi vida en los que crecí tienen que ver con los fracasos.', 'Marcelo Bielsa'],
    ['La victoria pertenece al más perseverante.', 'Atribuida a Napoleón Bonaparte'],
  ]),

  // ---------- Mi Centro (originales) ----------
  ...v(2, 'centro', [
    ['Hoy no tiene que ser perfecto. Tiene que estar hecho.'],
    ['Un hábito chico hoy es un cambio grande en un año.'],
    ['Lo que estudiás hoy es la ventaja que vas a tener mañana.'],
    ['No compitas con los demás: competí con quien eras ayer.'],
    ['Si te cuesta, es porque estás creciendo.'],
    ['Primero lo importante, después lo urgente, al final lo demás.'],
    ['Descansar también es parte del entrenamiento.'],
    ['Cinco minutos de algo es mejor que una hora de nada.'],
    ['Las rachas no se construyen en un día, pero se construyen cada día.'],
    ['Tu yo del futuro te va a agradecer lo que hagas hoy.'],
    ['Una materia difícil se aprueba igual que se sube una montaña: paso a paso.'],
    ['Equivocarte es parte del código: se depura y se sigue.'],
    ['Hacé que hoy cuente, aunque sea un poquito.'],
    ['Tachar una tarea también es una forma de ganar.'],
    ['El progreso lento sigue siendo progreso.'],
    ['Si hoy no tenés ganas, hacé la versión más chica del hábito.'],
    ['No esperes a tener ganas: las ganas llegan después de empezar.'],
    ['Cada "no puedo" es, en realidad, un "todavía no puedo".'],
    ['Dormí bien, tomá agua y seguí adelante.'],
    ['Un día malo no borra una buena racha. Mañana seguís.'],
  ]),
];
