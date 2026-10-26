import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def create_adobe_style_icon(size=1024):
    scale = 2  # 2x supersampling for ultra crisp edges
    s = size * scale

    # Master canvas
    canvas = Image.new("RGBA", (s, s), (0, 0, 0, 0))

    pad = s * 0.05
    radius = s * 0.22
    rect = [pad, pad, s - pad, s - pad]

    # 1. Base Squircle Fill (Deep Authentic Adobe Obsidian)
    # Adobe uses dark chromatic backgrounds matching the accent color (e.g. #001e36 for Ps)
    bg = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    bg_draw = ImageDraw.Draw(bg)
    bg_draw.rounded_rectangle(rect, radius=radius, fill=(0, 24, 38, 255)) # #001826

    # Gradient sheen (top-left lighter to bottom-right darker)
    sheen = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    sheen_draw = ImageDraw.Draw(sheen)
    for y in range(int(pad), int(s - pad)):
        t = (y - pad) / (s - 2 * pad)
        # from #002b44 down to #000d17
        r = int(0 + (1 - t) * 6)
        g = int(32 + (1 - t) * 16)
        b = int(50 + (1 - t) * 24)
        sheen_draw.line([(pad, y), (s - pad, y)], fill=(r, g, b, 255), width=1)
    
    # Mask sheen into squircle
    bg = Image.alpha_composite(bg, Image.composite(sheen, Image.new("RGBA", (s, s), (0,0,0,0)), bg))

    # 2. Subtle Radial Light Sheen from Top-Left
    radial = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    r_draw = ImageDraw.Draw(radial)
    light_cx, light_cy = s * 0.3, s * 0.25
    max_r = s * 0.65
    for dist in range(int(max_r), 0, -10):
        intensity = int(22 * (1.0 - dist / max_r))
        r_draw.ellipse(
            [light_cx - dist, light_cy - dist, light_cx + dist, light_cy + dist],
            fill=(255, 255, 255, intensity)
        )
    radial = radial.filter(ImageFilter.GaussianBlur(radius=20 * scale))
    bg = Image.alpha_composite(bg, Image.composite(radial, Image.new("RGBA", (s, s), (0,0,0,0)), bg))

    # 3. Adobe CC Iconic Colored Border (Electric Cyan #00E5FF)
    border_width = int(s * 0.024)
    border_layer = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    b_draw = ImageDraw.Draw(border_layer)
    b_rect = [pad + border_width / 2, pad + border_width / 2, s - pad - border_width / 2, s - pad - border_width / 2]
    b_draw.rounded_rectangle(
        b_rect,
        radius=radius - border_width / 2,
        outline=(0, 229, 255, 255),  # #00E5FF
        width=border_width
    )
    
    # 4. Subtle Inner Specular Chamfer Rim (1px white sheen inside border)
    chamfer_layer = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    c_draw = ImageDraw.Draw(chamfer_layer)
    c_offset = border_width + 2
    c_rect = [pad + c_offset, pad + c_offset, s - pad - c_offset, s - pad - c_offset]
    c_draw.rounded_rectangle(
        c_rect,
        radius=radius - c_offset,
        outline=(255, 255, 255, 28),
        width=int(2 * scale)
    )

    # 5. Adobe Typography: "Dm"
    text_layer = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    t_draw = ImageDraw.Draw(text_layer)

    # Try Segoe UI Bold or Arial Bold for authentic Adobe CC font metrics
    font_size = int(s * 0.50)
    font_path = r"C:\Windows\Fonts\segoeuib.ttf"
    if not os.path.exists(font_path):
        font_path = r"C:\Windows\Fonts\arialbd.ttf"
    
    font = ImageFont.truetype(font_path, font_size)

    # Measure text bounding box
    bbox = t_draw.textbbox((0, 0), "Dm", font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]

    # Center text horizontally and vertically in squircle
    tx = (s - text_w) / 2 - bbox[0]
    ty = (s - text_h) / 2 - bbox[1] - s * 0.015  # slight optical lift

    # Soft ambient drop shadow under text
    shadow_layer = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    s_draw = ImageDraw.Draw(shadow_layer)
    s_draw.text((tx, ty + int(6 * scale)), "Dm", font=font, fill=(0, 0, 0, 140))
    s_draw.text((tx, ty), "Dm", font=font, fill=(0, 229, 255, 40)) # soft cyan ambient glow
    shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(radius=8 * scale))

    # Render crisp text
    t_draw.text((tx, ty), "Dm", font=font, fill=(0, 229, 255, 255))

    # Optional subtle accent: 3 small data indicators along bottom-right representing Data Management
    dot_radius = int(6 * scale)
    dot_y = int(s - pad - s * 0.08)
    for i, offset_x in enumerate([s * 0.72, s * 0.77, s * 0.82]):
        alpha = int(120 + i * 50)
        t_draw.ellipse(
            [offset_x - dot_radius, dot_y - dot_radius, offset_x + dot_radius, dot_y + dot_radius],
            fill=(0, 229, 255, alpha)
        )

    # Composite all layers together
    comp = Image.alpha_composite(bg, border_layer)
    comp = Image.alpha_composite(comp, chamfer_layer)
    comp = Image.alpha_composite(comp, shadow_layer)
    comp = Image.alpha_composite(comp, text_layer)

    # Downsample Lanczos for ultra high fidelity
    final = comp.resize((size, size), Image.Resampling.LANCZOS)
    return final

if __name__ == '__main__':
    print("Generating Adobe CC / Anything Style 'Dm' Logo...")
    logo_1024 = create_adobe_style_icon(1024)

    # Output paths
    dm_dir = r"C:\Users\Burhanuddin\OneDrive\Desktop\Anything Data Manage"
    anything_dir = r"C:\Users\Burhanuddin\OneDrive\Desktop\Anything\Anything"

    png_dm = os.path.join(dm_dir, "ICON.png")
    ico_dm = os.path.join(dm_dir, "icon.ico")
    png_build = os.path.join(dm_dir, "build_scripts", "ICON.png")

    png_rel = os.path.join(anything_dir, "releases", "anything-data-manage", "app-logo.png")
    png_pub = os.path.join(anything_dir, "published-apps", "anything-data-manage", "app-logo.png")

    # Save master PNG
    logo_1024.save(png_dm, "PNG")
    print(f"Saved: {png_dm}")

    logo_1024.save(png_build, "PNG")
    print(f"Saved: {png_build}")

    # Generate multi-resolution ICO for Windows
    icon_sizes = [(16,16), (32,32), (48,48), (64,64), (128,128), (256,256)]
    logo_1024.save(ico_dm, format="ICO", sizes=icon_sizes)
    print(f"Saved: {ico_dm}")

    # Save to Anything Hub
    os.makedirs(os.path.dirname(png_rel), exist_ok=True)
    os.makedirs(os.path.dirname(png_pub), exist_ok=True)
    logo_1024.save(png_rel, "PNG")
    logo_1024.save(png_pub, "PNG")
    print(f"Saved: {png_rel}")
    print(f"Saved: {png_pub}")

    print("\n✅ All Adobe-style 'Dm' logos generated and synchronized successfully!")
