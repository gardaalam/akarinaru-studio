/* data.js — all site content in one place. Edit here to update the website. */
window.AK = window.AK || {};

AK.BG = {
  night: 'linear-gradient(170deg,#1C1238 0%,#3A1E5E 60%,#120A24 100%)',
  wine:  'linear-gradient(170deg,#2A0F22 0%,#5E1430 55%,#170816 100%)',
  dusk:  'linear-gradient(170deg,#241A44 0%,#5B3F86 55%,#1A1230 100%)',
  ink:   'linear-gradient(170deg,#0E0C1E 0%,#22204A 60%,#0B0A18 100%)',
  rose:  'linear-gradient(170deg,#2E1430 0%,#7A2E54 60%,#1E0C20 100%)'
};

AK.works = [
  { img:'garda', cat:'Model Art', title:'Garda',       path:'Path: Live2D Model Art', bg:'night', alt:'Garda, a cyber-feline character in neon-lined armour, full body', desc:'Full body Live2D model art — a cyber-feline in neon-lined armour, painted and separated layer by layer, ready to rig.' },
  { img:'garda', cat:'Rigging',   title:'Garda · Rig', path:'Path: Live2D Rigging',   bg:'ink', rig:true, alt:'Garda model with a Live2D rig skeleton overlay', desc:'The same model brought to life in Live2D: head and body angles, physics on hair and tail, and expression toggles.' },
  { img:'e12', cat:'Emotes', title:'Approved',   path:'Path: Emote', bg:'wine',  alt:'Emote of a character giving a confident thumbs-up', desc:'A confident thumbs-up emote, drawn to read clearly even at 28 pixels.' },
  { img:'e59', cat:'Emotes', title:'Gasp',       path:'Path: Emote', bg:'dusk',  alt:'Emote of a shocked character with both hands on their face', desc:'Pure shock, framed by both hands — made for chat reactions.' },
  { img:'e33', cat:'Emotes', title:'Loading',    path:'Path: Emote', bg:'ink',   alt:'Playful buffering emote', desc:'A playful buffering emote for those moments the brain needs a second.' },
  { img:'e1',  cat:'Emotes', title:'Blown Kiss', path:'Path: Emote', bg:'rose',  alt:'Emote of a character blowing a kiss with floating hearts', desc:'A sweet blown kiss with floating hearts — a channel favourite.' },
  { img:'e20', cat:'Emotes', title:'Headpat',    path:'Path: Emote', bg:'night', alt:'Emote of a content character receiving a headpat with happy tears', desc:'A content headpat emote with soft, happy tears.' },
  { img:'e4',  cat:'Emotes', title:'Cozy',       path:'Path: Emote', bg:'rose',  alt:'Emote of a character wrapped in a hoodie', desc:'Wrapped in a hoodie and ready for a quiet stream.' }
];
AK.categories = ['All', 'Model Art', 'Rigging', 'Emotes'];

AK.services = [
  { num:'I',   name:'Illustration', script:'Portrait',    img:'garda', price:'$25',  path:'Path: Illustration',
    desc:'Character portraits, original characters and key art — painted with mature, cinematic lighting.',
    items:['Headshot, half body or full body','Two revisions at the sketch stage','High-resolution PNG'] },
  { num:'II',  name:'Animation',    script:'Mouvement',   img:'e12',   price:'$60',  path:'Path: Animation',
    desc:'Idle loops, animated emotes and short clips in 2D or 3D, timed to feel alive.',
    items:['Animated emote or idle loop','2D or 3D','GIF or MP4 delivery'] },
  { num:'III', name:'Rigging',      script:'Marionnette', img:'garda', rig:true, price:'$150', path:'Path: Rigging',
    desc:'Clean, expressive 2D and 3D rigs — ready for animation or live face tracking.',
    items:['Head, body, eye and mouth parameters','Hair and cloth physics','Ready-to-use project files'] },
  { num:'IV',  name:'3D Modelling', script:'Sculpture',   img:null,    price:'$300', path:'Path: 3D',
    desc:'Anime-style 3D characters, from your 2D design to a render-ready model.',
    items:['Built from your 2D design','Hand-painted anime textures','Animation-ready file'] }
];

AK.shop = [
  { name:'Illustration', stars:'★★★★',  img:'garda', bg:'night', price:'$25',
    lines:[['Headshot','$25'],['Half body','$40'],['Full body','$60']] },
  { name:'Animation',    stars:'★★★★★', img:'e59',   bg:'dusk', price:'$60',
    lines:[['Animated emote','$60'],['Idle loop','$120'],['Delivery','GIF / MP4']] },
  { name:'Rigging & 3D', stars:'★★★★★', img:'garda', bg:'ink', rig:true, price:'$150',
    lines:[['2D rig · half body','$150'],['2D rig · full body','$250'],['3D model','from $300']] }
];

AK.quests = [
  ['Choose your path', 'Illustration, animation, rigging or a 3D model.'],
  ['Share your references', 'Message us on Etsy with images and the story of your character.'],
  ['Approve the sketch', 'Review the first sketch and request revisions.'],
  ['Receive the final work', 'Delivered through Etsy, ready to use.']
];

AK.fateCards = [
  { name:'The Sketchbook', price:'$20', desc:'A refined colour sketch of your character — pose and mood chosen by the artist.' },
  { name:'The Muse',       price:'$35', desc:'A half body portrait with a palette and atmosphere picked for you.' },
  { name:'The Heartbeat',  price:'$45', desc:'A small animated emote with an artist-chosen expression.' },
  { name:'The Stage',      price:'$55', desc:'A full body piece with a simple scene and full creative freedom.' }
];

// ⚠️ email & instagram are PLACEHOLDERS — replace with the real accounts before publishing.
AK.contact = {
  etsy: 'https://www.etsy.com/shop/akamerenata',
  email: 'hello@akarinaru.studio',
  instagram: '@akarinaru.studio'
};

AK.slots = { left: 3, total: 5 };
