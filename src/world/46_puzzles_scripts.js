// Puzzle logic
const LANTERN_ORDER = [2, 1, 0];
async function meridianIntro() {
  hero.dir = 0; setTrack('silent');
  const r = route();
  await say('MERIDIAN', 'tick.', 'tock.', '...well, well. the little chime that fell out of my bell.');
  if (r === 'peace') await say('MERIDIAN', 'i\'ve been watching you, you know. all the way up.', 'you didn\'t stop a single clock. not one. even the ones who swung at you.', '...that\'s annoying. it makes you very hard to hate.');
  else if (r === 'violent') await say('MERIDIAN', 'i\'ve been watching you, you know.', 'the woods are quiet. the works are quiet. even the gallery is quiet.', 'you stopped them. one by one. you\'re not a chime at all, are you?', 'you\'re a little hammer.');
  else await say('MERIDIAN', 'i\'ve been watching you, you know. you let some of them go home. others... not so much.', 'that\'s the thing about time, spark. it doesn\'t give anything back.');
  await say('MERIDIAN', 'you want to know why it\'s always 11:59.', 'simple. my spring was wound for so many days. when this bell rings midnight, i wind down. for good.', 'so i stopped the bell. and the clocks. and everyone in them.', 'and you\'re the twelfth chime. the one that never rang. if you get past me... midnight comes.',
    'so. let\'s see if you can keep time.');
  hero.flags.meridian_met = true;
  startBattle('meridian', { boss: true });
}

