from PIL import Image, ImageDraw, ImageFont

W, H = 1400, 1900
BG = '#efefef'
PANEL = '#f7f7f7'
LINE = '#2a2a2a'
img = Image.new('RGB', (W, H), BG)
d = ImageDraw.Draw(img)

try:
    f_title = ImageFont.truetype('arial.ttf', 18)
    f_main = ImageFont.truetype('arial.ttf', 14)
    f_sub = ImageFont.truetype('arial.ttf', 13)
    f_inc = ImageFont.truetype('arial.ttf', 11)
except OSError:
    f_title = ImageFont.load_default()
    f_main = ImageFont.load_default()
    f_sub = ImageFont.load_default()
    f_inc = ImageFont.load_default()


def draw_actor(cx, cy, label):
    d.ellipse((cx - 12, cy - 12, cx + 12, cy + 12), outline=LINE, width=1)
    d.line((cx, cy + 12, cx, cy + 70), fill=LINE, width=1)
    d.line((cx - 22, cy + 38, cx + 22, cy + 38), fill=LINE, width=1)
    d.line((cx, cy + 70, cx - 20, cy + 105), fill=LINE, width=1)
    d.line((cx, cy + 70, cx + 20, cy + 105), fill=LINE, width=1)
    d.text((cx, cy + 132), label, fill='#111', font=f_main, anchor='mm')


def draw_uc(x, y, rx, ry, label, main=False):
    d.ellipse((x - rx, y - ry, x + rx, y + ry), outline=LINE, fill=PANEL, width=1)
    d.text((x, y), label, fill='#111', font=f_main if main else f_sub, anchor='mm')


def draw_dashed_arrow(a, b, label_xy=None):
    x1, y1 = a
    x2, y2 = b
    steps = 22
    for i in range(steps):
        if i % 2 == 0:
            t1 = i / steps
            t2 = (i + 1) / steps
            xa = x1 + (x2 - x1) * t1
            ya = y1 + (y2 - y1) * t1
            xb = x1 + (x2 - x1) * t2
            yb = y1 + (y2 - y1) * t2
            d.line((xa, ya, xb, yb), fill='#5f5f5f', width=1)

    # Arrow head
    vx, vy = x2 - x1, y2 - y1
    ln = max((vx * vx + vy * vy) ** 0.5, 1)
    ux, uy = vx / ln, vy / ln
    px, py = -uy, ux
    p0 = (x2, y2)
    p1 = (x2 - 9 * ux + 4 * px, y2 - 9 * uy + 4 * py)
    p2 = (x2 - 9 * ux - 4 * px, y2 - 9 * uy - 4 * py)
    d.polygon([p0, p1, p2], fill='#5f5f5f')

    if label_xy:
        d.text(label_xy, '<<include>>', fill='#222', font=f_inc, anchor='mm')


def draw_polyline(points):
    for i in range(len(points) - 1):
        d.line((points[i], points[i + 1]), fill=LINE, width=1)


# System boundary and title
panel = (170, 40, 1230, 1840)
d.rounded_rectangle(panel, radius=4, outline='#222', width=1, fill=PANEL)
d.text((700, 68), 'Centralized Agricultural Product Distribution Management System for the', fill='#111', font=f_title, anchor='mm')
d.text((700, 98), 'Bauang Agricultural Trade Center', fill='#111', font=f_title, anchor='mm')
d.text((700, 128), '(AGRI_SYS_V3)', fill='#111', font=f_title, anchor='mm')

# Actors similar to template
admin = (70, 770)
manager = (1260, 600)
distributor = (1260, 980)
draw_actor(*admin, 'Admin')
draw_actor(*manager, 'Manager')
draw_actor(*distributor, 'Distributor')

# Main use cases, vertically stacked
main = {
    'login': (700, 220, 95, 27, 'Login'),
    'user': (700, 350, 170, 31, 'User Management'),
    'listing': (700, 500, 190, 31, 'Listing Management'),
    'demand': (700, 680, 290, 35, 'Marketplace and Demand Management'),
    'order': (700, 940, 190, 31, 'Order Management'),
    'log': (700, 1180, 200, 31, 'Logistics Management'),
    'report': (700, 1450, 175, 31, 'Generate Report'),
}
for _, (x, y, rx, ry, label) in main.items():
    draw_uc(x, y, rx, ry, label, main=True)

# Sub use cases grouped per main section
subs = {
    'user': [
        (560, 445, 82, 22, 'Add'),
        (840, 445, 82, 22, 'View'),
    ],
    'listing': [
        (440, 610, 82, 22, 'Add'),
        (620, 610, 82, 22, 'Edit'),
        (800, 610, 82, 22, 'View'),
        (980, 610, 82, 22, 'Update'),
    ],
    'demand': [
        (350, 815, 82, 22, 'Add'),
        (585, 815, 82, 22, 'View'),
        (805, 815, 82, 22, 'Edit'),
        (1030, 815, 82, 22, 'Update'),
    ],
    'order': [
        (400, 1055, 82, 22, 'Add'),
        (620, 1055, 82, 22, 'View'),
        (840, 1055, 82, 22, 'Edit'),
        (1040, 1055, 82, 22, 'Update'),
    ],
    'log': [
        (320, 1285, 82, 22, 'Add'),
        (520, 1285, 82, 22, 'View'),
        (730, 1285, 82, 22, 'Edit'),
        (940, 1285, 82, 22, 'Update'),
        (1140, 1285, 82, 22, 'Generate'),
    ],
    'report': [
        (600, 1570, 88, 22, 'Generate'),
        (790, 1570, 82, 22, 'View'),
        (970, 1570, 82, 22, 'Edit'),
        (1130, 1570, 82, 22, 'Update'),
    ],
}

for group in subs.values():
    for x, y, rx, ry, label in group:
        draw_uc(x, y, rx, ry, label, main=False)


# Include links
draw_dashed_arrow((650, 380), (580, 422), (615, 400))
draw_dashed_arrow((750, 380), (820, 422), None)

for i, (sx, sy) in enumerate([(455, 588), (620, 588), (800, 588), (965, 588)]):
    label = ((700 + sx) // 2, (532 + sy) // 2 - 8) if i == 0 else None
    draw_dashed_arrow((700, 532), (sx, sy), label)

for i, (sx, sy) in enumerate([(370, 790), (580, 790), (800, 790), (1010, 790)]):
    label = ((700 + sx) // 2, (715 + sy) // 2 - 8) if i == 0 else None
    draw_dashed_arrow((700, 715), (sx, sy), label)

for i, (sx, sy) in enumerate([(420, 1030), (620, 1030), (830, 1030), (1020, 1030)]):
    label = ((700 + sx) // 2, (972 + sy) // 2 - 8) if i == 0 else None
    draw_dashed_arrow((700, 972), (sx, sy), label)

for i, (sx, sy) in enumerate([(340, 1261), (540, 1261), (740, 1261), (920, 1261), (1120, 1261)]):
    label = ((700 + sx) // 2, (1212 + sy) // 2 - 8) if i == 0 else None
    draw_dashed_arrow((700, 1212), (sx, sy), label)

for i, (sx, sy) in enumerate([(620, 1546), (790, 1546), (960, 1546), (1120, 1546)]):
    label = ((700 + sx) // 2, (1482 + sy) // 2 - 8) if i == 0 else None
    draw_dashed_arrow((700, 1482), (sx, sy), label)


# Actor routing: use side hubs (very similar to template fan-out)
left_hub = (170, 820)
right_hub_top = (1230, 700)
right_hub_bottom = (1230, 1000)

for tx, ty in [(605, 220), (530, 350), (510, 500), (420, 680), (510, 940), (500, 1180), (530, 1450)]:
    draw_polyline([admin, left_hub, (tx, ty)])

for tx, ty in [(795, 220), (870, 350), (890, 500), (980, 680)]:
    draw_polyline([manager, right_hub_top, (tx, ty)])

for tx, ty in [(890, 940), (900, 1180), (860, 1450)]:
    draw_polyline([distributor, right_hub_bottom, (tx, ty)])

img.save('AGRI_SYS_V3_USE_CASE_TEMPLATE_FIXED.png')
print('saved AGRI_SYS_V3_USE_CASE_TEMPLATE_FIXED.png')
