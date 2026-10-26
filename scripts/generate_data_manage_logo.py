import math
from PIL import Image, ImageDraw, ImageFilter

def create_data_manage_logo(size=1024):
    # Create master RGBA canvas
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    pad = size * 0.06
    r = size * 0.22  # rounded corner radius

    # Background Squircle with deep space dark gradient
    bg = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    bg_draw = ImageDraw.Draw(bg)

    # Draw rounded rect mask
    bg_draw.rounded_rectangle(
        [pad, pad, size - pad, size - pad],
        radius=r,
        fill=(14, 18, 30, 255)
    )

    # Gradient overlay inside squircle
    for y in range(int(pad), int(size - pad)):
        t = (y - pad) / (size - 2 * pad)
        # Deep cosmic indigo to midnight slate
        r_c = int(10 + t * 18)
        g_c = int(15 + t * 12)
        b_c = int(32 + t * 40)
        line_mask = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        ld = ImageDraw.Draw(line_mask)
        ld.line([(pad, y), (size - pad, y)], fill=(r_c, g_c, b_c, 255), width=1)
        bg = Image.alpha_composite(bg, Image.composite(line_mask, Image.new("RGBA", (size, size), (0,0,0,0)), bg))

    # Inner subtle specular rim border
    rim = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    rim_draw = ImageDraw.Draw(rim)
    rim_draw.rounded_rectangle(
        [pad + 2, pad + 2, size - pad - 2, size - pad - 2],
        radius=r - 2,
        outline=(56, 189, 248, 120),  # Sky blue specular highlight
        width=4
    )
    bg = Image.alpha_composite(bg, rim)

    # Ambient radial backlight glow behind the central glyph
    glow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    cx, cy = size / 2, size / 2
    for gr in range(int(size * 0.35), 0, -8):
        alpha = int(45 * (1.0 - gr / (size * 0.35)))
        glow_draw.ellipse([cx - gr, cy - gr - 20, cx + gr, cy + gr - 20], fill=(0, 229, 255, alpha))
        glow_draw.ellipse([cx - gr * 0.7, cy - gr * 0.7 + 30, cx + gr * 0.7, cy + gr * 0.7 + 30], fill=(168, 85, 247, alpha))

    glow = glow.filter(ImageFilter.GaussianBlur(radius=28))
    bg = Image.alpha_composite(bg, glow)

    # Central Isometric Database Discs & Data Streams
    art = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    adraw = ImageDraw.Draw(art)

    # 3 Layered Cylindrical Database Platers
    disc_w = size * 0.46
    disc_h = size * 0.13
    disc_depth = size * 0.065
    
    y_positions = [
        cy - size * 0.16,  # Top layer (Analytics / Report)
        cy,                # Middle layer (Processing / Sequence)
        cy + size * 0.16   # Bottom layer (Storage / Master DB)
    ]
    
    colors = [
        ((0, 229, 255), (6, 182, 212), (14, 116, 144)),   # Electric Cyan (Top)
        ((129, 140, 248), (99, 102, 241), (67, 56, 202)), # Radiant Indigo (Middle)
        ((168, 85, 247), (147, 51, 234), (107, 33, 168))  # Neon Purple (Bottom)
    ]

    for idx in [2, 1, 0]: # Draw bottom to top
        dy = y_positions[idx]
        c_top, c_mid, c_bot = colors[idx]

        # Draw cylinder body (depth)
        body_box = [
            (cx - disc_w / 2, dy),
            (cx + disc_w / 2, dy),
            (cx + disc_w / 2, dy + disc_depth),
            (cx - disc_w / 2, dy + disc_depth)
        ]
        adraw.polygon(body_box, fill=(*c_bot, 240))
        adraw.chord([cx - disc_w / 2, dy + disc_depth - disc_h / 2, cx + disc_w / 2, dy + disc_depth + disc_h / 2], 0, 180, fill=(*c_bot, 240))

        # Cylinder top surface (ellipse)
        adraw.ellipse([cx - disc_w / 2, dy - disc_h / 2, cx + disc_w / 2, dy + disc_h / 2], fill=(*c_mid, 255), outline=(*c_top, 255), width=3)
        
        # Inner specular groove
        in_w, in_h = disc_w * 0.72, disc_h * 0.72
        adraw.ellipse([cx - in_w / 2, dy - in_h / 2, cx + in_w / 2, dy + in_h / 2], outline=(255, 255, 255, 140), width=2)

        # Subtle glowing data status LEDs on front rim
        for led_x_offset in [-disc_w * 0.28, 0, disc_w * 0.28]:
            adraw.ellipse([cx + led_x_offset - 4, dy + disc_depth * 0.5 - 4, cx + led_x_offset + 4, dy + disc_depth * 0.5 + 4], fill=(52, 211, 153, 255))

    # Add vertical energetic data transfer lasers between layers
    for x_offset in [-disc_w * 0.35, disc_w * 0.35]:
        lx = cx + x_offset
        adraw.line([(lx, y_positions[0]), (lx, y_positions[2] + disc_depth)], fill=(0, 229, 255, 180), width=4)
        for py in y_positions:
            adraw.ellipse([lx - 5, py - 5, lx + 5, py + 5], fill=(255, 255, 255, 255))

    # Futuristic stylized tabular data matrix brackets
    bracket_w = size * 0.28
    b_left = cx - bracket_w
    b_right = cx + bracket_w
    b_top = cy - size * 0.26
    b_bot = cy + size * 0.26
    
    # Left bracket [
    adraw.line([(b_left + 24, b_top), (b_left, b_top)], fill=(56, 189, 248, 220), width=5)
    adraw.line([(b_left, b_top), (b_left, b_bot)], fill=(56, 189, 248, 220), width=5)
    adraw.line([(b_left, b_bot), (b_left + 24, b_bot)], fill=(56, 189, 248, 220), width=5)

    # Right bracket ]
    adraw.line([(b_right - 24, b_top), (b_right, b_top)], fill=(168, 85, 247, 220), width=5)
    adraw.line([(b_right, b_top), (b_right, b_bot)], fill=(168, 85, 247, 220), width=5)
    adraw.line([(b_right, b_bot), (b_right - 24, b_bot)], fill=(168, 85, 247, 220), width=5)

    # Combine artwork with background
    final = Image.alpha_composite(bg, art)

    return final

if __name__ == '__main__':
    logo = create_data_manage_logo(1024)
    out_dir = r"C:\Users\Burhanuddin\OneDrive\Desktop\Anything Data Manage"
    png_path = f"{out_dir}\\ICON.png"
    ico_path = f"{out_dir}\\icon.ico"
    
    logo.save(png_path, "PNG")
    print(f"Saved master high-res logo: {png_path}")

    # Generate multi-resolution .ico
    icon_sizes = [(16,16), (32,32), (48,48), (64,64), (128,128), (256,256)]
    logo.save(ico_path, format="ICO", sizes=icon_sizes)
    print(f"Saved multi-resolution Windows icon: {ico_path}")
