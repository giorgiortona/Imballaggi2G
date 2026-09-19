"""Original articulated sea-turtle illustration for website motion."""
def turtle_art(label='swimmer'):
    return f'''<svg class="sea-turtle" viewBox="0 0 240 210" aria-hidden="true" focusable="false">
    <defs><linearGradient id="{label}-shell" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#8bc4a3"/><stop offset=".45" stop-color="#368f6c"/><stop offset="1" stop-color="#154d3c"/></linearGradient><linearGradient id="{label}-skin" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#70b997"/><stop offset="1" stop-color="#28644f"/></linearGradient></defs>
    <g class="turtle-body">
      <path class="flipper flipper-back-top" d="M77 71C48 51 32 39 23 45C23 56 40 80 69 92Z" fill="url(#{label}-skin)"/>
      <path class="flipper flipper-back-bottom" d="M75 122C47 142 33 168 23 163C24 150 38 121 69 109Z" fill="url(#{label}-skin)"/>
      <path d="M62 99L34 104L65 111Z" fill="#316f54"/>
      <g class="flipper flipper-front-top"><path d="M137 75C141 44 125 10 137 8C161 21 183 52 167 87Z" fill="url(#{label}-skin)"/><path d="M150 71Q158 44 141 21" fill="none" stroke="#b1d9b4" stroke-opacity=".5" stroke-width="2"/></g>
      <g class="flipper flipper-front-bottom"><path d="M142 125C150 156 128 194 141 198C168 185 186 148 167 120Z" fill="url(#{label}-skin)"/><path d="M151 132Q163 161 145 185" fill="none" stroke="#b1d9b4" stroke-opacity=".5" stroke-width="2"/></g>
      <path d="M161 89C182 88 187 79 201 82C224 86 226 106 210 116C198 123 184 111 163 116Z" fill="url(#{label}-skin)"/>
      <path d="M193 88L202 92L212 87M200 94L201 104L216 105M190 108L197 114" fill="none" stroke="#c9dfb4" stroke-opacity=".5" stroke-width="1.4"/>
      <circle cx="210" cy="94" r="3" fill="#0d3025"/><circle cx="210.8" cy="93.2" r=".85" fill="#fff"/>
      <path d="M215 107Q210 111 206 108" fill="none" stroke="#194832" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M64 104C63 67 88 46 120 50C152 52 179 73 180 104C179 135 151 156 120 158C87 161 64 141 64 104Z" fill="url(#{label}-shell)" stroke="#bed9b0" stroke-width="3"/>
      <g fill="none" stroke="#c4dcb4" stroke-width="1.8" stroke-linejoin="round" opacity=".8">
        <path d="M111 63L137 65L151 84L139 105L113 106L98 85ZM113 106L139 105L154 125L138 145L112 146L97 126Z"/>
        <path d="M111 63L98 56M137 65L145 57M151 84L171 80M139 105L179 104M154 125L172 129M138 145L146 151M112 146L102 155M97 126L69 128M98 85L71 78M113 106L65 104"/>
        <path d="M76 104C76 74 93 60 120 62C148 64 167 81 168 104C166 128 145 145 120 146C94 148 77 132 76 104Z"/>
      </g><path d="M85 81Q98 61 121 67" fill="none" stroke="#e7efcf" stroke-width="3" stroke-linecap="round" opacity=".4"/>
    </g></svg>'''
