export const site = {
  name: 'David Cueva',
  role: 'Webflow & JavaScript expert · Berlin',
  headline: ['You bring your business.', 'I make it live.'] as [string, string],
  statement: 'Everything tailored to your needs.',
  contactHref: '#contact',
} as const;

export const services: { n: string; title: string; line: string }[] = [
  { n: '01', title: 'Web development', line: 'Webflow builds and custom JavaScript, from your strategy to launch.' },
  { n: '02', title: 'Photo shoots', line: 'Portraits and brand images shot for the pages they will live on.' },
  { n: '03', title: 'Video editing', line: 'Edits and short clips that make a website move.' },
];

export const projects: { slug: string; name: string; pitch: string }[] = [
  { slug: 'prezenti', name: 'Prezenti', pitch: 'Website design · Webflow development' },
  { slug: 'jade-energy', name: 'Jade Energy', pitch: '[One-line pitch]' },
  { slug: 'com-create', name: 'com-create', pitch: '[One-line pitch]' },
  { slug: 'atalma', name: 'Atalma', pitch: '[One-line pitch]' },
];

export const socials: { label: string; href: string }[] = [
  { label: '[LinkedIn]', href: '#' },
  { label: '[Instagram]', href: '#' },
];
