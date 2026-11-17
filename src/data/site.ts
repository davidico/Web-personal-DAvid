export const site = {
  name: 'David Cueva',
  role: 'Webflow & JavaScript expert · Berlin',
  headline: ['You focus on your product.', 'I handle your digital presence.'] as [string, string],
  statement: 'Everything tailored to your needs.',
  contactHref: '#contact',
} as const;

export const services: { n: string; title: string; line: string }[] = [
  { n: '01', title: 'Web development', line: 'Webflow builds and custom JavaScript, from your strategy to launch.' },
  { n: '02', title: 'Photo shoots', line: 'Portraits and brand images shot for the pages they will live on.' },
  { n: '03', title: 'Video editing', line: 'Edits and short clips that make a website move.' },
];

/** `url` is optional: until a project has one, its card is not a link. */
export const projects: { slug: string; name: string; pitch: string; url?: string }[] = [
  { slug: 'prezenti', name: 'Prezenti', pitch: 'A clear, credible grants platform for the Celo community.' },
  { slug: 'jade-energy', name: 'Jade Energy', pitch: '[One-line pitch]' },
  { slug: 'com-create', name: 'com-create', pitch: 'A cohesive website for a German marketplace agency.' },
  { slug: 'atalma', name: 'Atalma', pitch: 'A website that builds trust for a Swiss blockchain infrastructure brand.' },
];

export const socials: { label: string; href: string }[] = [
  { label: '[LinkedIn]', href: '#' },
  { label: '[Instagram]', href: '#' },
];
