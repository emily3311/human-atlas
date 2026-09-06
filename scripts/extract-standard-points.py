"""Read GB/T 12346-2021 chapter 5 into factual fields; print JSON, write no files.

Requires pypdf. Source PDF URL and page links are documented in content-sources.md.
Only short point-specific anatomical location facts are extracted, not explanatory notes.
"""
import json
import re
import sys
from pypdf import PdfReader

reader = PdfReader(sys.argv[1])
chunks = []
page_offsets = []
offset = 0
for index in range(12, 35):
    lines = reader.pages[index].extract_text().splitlines()
    text = '\n'.join(lines[2:]) + '\n'
    page_offsets.append((offset, index + 1))
    chunks.append(text)
    offset += len(text)
text = ''.join(chunks)
pattern = re.compile(r'(?m)^(5\.\d+\.\d+)\s+([^\s]+)\s+([^\s（]+)（([A-Z]+\d+\+?)）\s*\n')
matches = list(pattern.finditer(text))
counts = dict(LU=11, LI=20, ST=45, SP=21, HT=9, SI=19, BL=67, KI=27, PC=9, TE=23, GB=44, LR=14, GV=29, CV=24)

def region_of(location):
    area = re.split('[，,。]', location)[0]
    if '手背' in area:
        return '上肢'
    if '足背' in area:
        return '下肢'
    if re.search('头|面|颈|项|耳|眉|目|唇|颏|鼻', area):
        return '头颈'
    if re.search('肩胛|背|腰|骶|脊柱|臀', area):
        return '背腰'
    if re.search('肩|臂|肘|腕|手|腋', area):
        return '上肢'
    if re.search('腿|股|膝|踝|足|趾|髋', area):
        return '下肢'
    if re.search('胸|腹|胁|肋|耻|会阴', area):
        return '胸腹'
    raise ValueError(f'Unmapped region: {area}')

points = []
for index, match in enumerate(matches):
    section, name, pinyin, code = match.groups()
    following = text[match.end():matches[index+1].start() if index+1 < len(matches) else len(text)]
    location = re.split(r'\n注\s*\d*\s*[：:]|\n5\.\d+\s', following)[0]
    location = re.sub(r'\s+', '', location).split('。')[0] + '。'
    if not location.startswith('在'):
        raise ValueError(f'Unexpected location {code}: {location}')
    meridian = re.match('[A-Z]+', code)[0]
    page = max(page for start, page in page_offsets if start <= match.start())
    points.append(dict(id=code, name=name, pinyin=pinyin, meridian=meridian, region=region_of(location), location=location.removeprefix('在'), section=section, page=page))

assert len(points) == 362, f'Expected 362 entries, got {len(points)}'
for meridian, count in counts.items():
    actual = [p['id'] for p in points if p['meridian'] == meridian]
    expected = [f'{meridian}{i}' for i in range(1,count+1)]
    if meridian == 'GV':
        expected = [f'GV{i}' for i in range(1,25)] + ['GV24+'] + [f'GV{i}' for i in range(25,29)]
    assert actual == expected, (meridian, actual)
assert len({p['id'] for p in points}) == 362
print(json.dumps(points, ensure_ascii=False, indent=2))
