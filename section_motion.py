"""Small, original line illustrations for the white section entrances."""
def section_motion(key):
    scenes = {
        'coprispalla': '<path class="motion-trace" d="M72 43c0-14 20-14 20-2 0 7-12 9-12 18L34 83q-6 4 1 7h90q7-3 1-7L80 59"/><path class="motion-drape" d="M57 70 38 82l-5 43h94l-5-43-19-12"/>',
        'bobine': '<g class="motion-reel"><circle cx="59" cy="75" r="29"/><circle cx="59" cy="75" r="9"/><path d="M59 46v10m29 19H78m-19 29V94M30 75h10"/></g><path class="motion-film" d="M59 104h62q10 0 10-10V74"/>',
        'protezioni': ''.join(f'<circle class="motion-bubble" style="--n:{i}" cx="{52+(i%3)*28}" cy="{47+(i//3)*28}" r="10"/>' for i in range(9)),
        'buste': '<path class="motion-trace" d="M43 56v64h74V56"/><path class="motion-fold" d="M43 56h74L80 79Z"/><path class="motion-seam" d="M52 108h56"/>',
        'macchine': '<path class="motion-trace" d="M28 101h104v16H28Zm12 16v10m80-10v10M42 91V36h76v55"/><g class="motion-package"><path d="M58 69h36v31H58Zm18 0v31"/></g><path class="motion-press" d="M56 48h48"/>',
        'sostenibilita': '<g class="motion-turtle"><ellipse cx="77" cy="80" rx="27" ry="21"/><path d="m65 67 16-4 15 14-9 18-20-1-10-14Z"/><path d="M103 73c21-15 31 9 11 14l-11-2M50 78l-12 3 12 3"/><path class="motion-fin-top" d="M89 62C92 45 79 31 85 30c17 5 26 23 16 38M59 66 40 52l8 21"/><path class="motion-fin-bottom" d="M91 98c3 17-11 30-5 31 17-5 26-21 16-36M60 96l-20 15 9-22"/></g>',
        'azienda': '<path class="motion-trace" d="M36 121V67l44-30 44 30v54Zm0-54h88M69 121V89h22v32M48 80h9m46 0h9"/><path class="motion-sun" d="M107 38a12 12 0 1 1 18 15"/>',
        'contatti': '<path class="motion-trace" d="M35 49h90v55H77l-21 17v-17H35Z"/>'+''.join(f'<circle class="motion-dot" style="--n:{i}" cx="{61+i*19}" cy="77" r="2.5"/>' for i in range(3)),
    }
    return '<svg class="section-sketch" viewBox="0 0 160 160" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">'+scenes[key]+'</svg>'
