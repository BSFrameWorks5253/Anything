import os
from PIL import Image, ImageDraw, ImageFont

def create_anything_logo():
    size = 1024
    
    # 1. Base gradient rounded rectangle
    top_color = (255, 42, 42, 255)
    bottom_color = (186, 0, 0, 255)
    
    grad = Image.new("RGBA", (size, size))
    draw_grad = ImageDraw.Draw(grad)
    for y in range(size):
        ratio = y / float(size - 1)
        r = int(top_color[0] + (bottom_color[0] - top_color[0]) * ratio)
        g = int(top_color[1] + (bottom_color[1] - top_color[1]) * ratio)
        b = int(top_color[2] + (bottom_color[2] - top_color[2]) * ratio)
        draw_grad.line([(0, y), (size, y)], fill=(r, g, b, 255))
            
    # Mask for squircle rounded rectangle
    pad = 40
    radius = 210
    mask = Image.new("L", (size, size), 0)
    draw_mask = ImageDraw.Draw(mask)
    draw_mask.rounded_rectangle([pad, pad, size - pad, size - pad], radius=radius, fill=255)
    
    # Apply mask
    squircle = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    squircle.paste(grad, (0, 0), mask=mask)
    
    # 2. Specular glass highlight rim
    rim_mask = Image.new("L", (size, size), 0)
    rim_draw = ImageDraw.Draw(rim_mask)
    rim_pad = pad + 10
    rim_draw.rounded_rectangle([rim_pad, rim_pad, size - rim_pad, size - rim_pad], radius=radius - 8, outline=255, width=16)
    
    rim_layer = Image.new("RGBA", (size, size), (255, 255, 255, 100))
    squircle.paste(rim_layer, (0, 0), mask=rim_mask)
    
    # 3. Top curved glass sheen
    sheen_mask = Image.new("L", (size, size), 0)
    sheen_draw = ImageDraw.Draw(sheen_mask)
    sheen_draw.polygon([
        (pad, pad + 180),
        (size // 3, pad + 240),
        (size * 2 // 3, pad + 160),
        (size - pad, pad + 110),
        (size - pad, pad),
        (pad, pad)
    ], fill=50)
    
    # Intersect with squircle mask by masking sheen_mask with mask
    sheen_combined = Image.new("L", (size, size), 0)
    sheen_combined.paste(sheen_mask, (0, 0), mask=mask)
    sheen_layer = Image.new("RGBA", (size, size), (255, 255, 255, 255))
    squircle.paste(sheen_layer, (0, 0), mask=sheen_combined)
    
    # 4. Typography "An" centered in bold white
    font = None
    possible_fonts = [
        "C:\\Windows\\Fonts\\segoeuib.ttf",
        "C:\\Windows\\Fonts\\arialbd.ttf",
        "C:\\Windows\\Fonts\\tahomabd.ttf",
        "C:\\Windows\\Fonts\\segoeui.ttf",
    ]
    for f in possible_fonts:
        if os.path.exists(f):
            try:
                font = ImageFont.truetype(f, 540)
                break
            except Exception:
                pass
    if not font:
        font = ImageFont.load_default()
        
    draw = ImageDraw.Draw(squircle)
    text = "An"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]
    
    x = (size - text_w) // 2 - bbox[0]
    y = (size - text_h) // 2 - bbox[1] - 30
    
    # Draw soft text shadow
    draw.text((x, y + 8), text, font=font, fill=(0, 0, 0, 80))
    # Draw crisp white text
    draw.text((x, y), text, font=font, fill=(255, 255, 255, 255))
    
    # 5. Downsample to 512x512
    final_512 = squircle.resize((512, 512), Image.Resampling.LANCZOS)
    
    project_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    public_dir = os.path.join(project_dir, "public")
    build_dir = os.path.join(project_dir, "build")
    os.makedirs(build_dir, exist_ok=True)
    
    # Save app-logo.png (512x512)
    app_logo_path = os.path.join(public_dir, "app-logo.png")
    final_512.save(app_logo_path, format="PNG")
    print(f"Saved: {app_logo_path}")
    
    # Save tray-icon.png (64x64 crisp image)
    tray_64 = squircle.resize((64, 64), Image.Resampling.LANCZOS)
    tray_icon_path = os.path.join(public_dir, "tray-icon.png")
    tray_64.save(tray_icon_path, format="PNG")
    print(f"Saved: {tray_icon_path}")
    
    # Save tray-icon-32.png
    tray_32 = squircle.resize((32, 32), Image.Resampling.LANCZOS)
    tray_32.save(os.path.join(public_dir, "tray-icon-32.png"), format="PNG")
    
    # Save multi-size icon.ico for Windows (16, 24, 32, 48, 64, 128, 256)
    ico_sizes = [(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    ico_path = os.path.join(public_dir, "icon.ico")
    final_512.save(ico_path, format="ICO", sizes=ico_sizes)
    print(f"Saved: {ico_path}")
    
    # Also save to build/icon.ico
    build_ico_path = os.path.join(build_dir, "icon.ico")
    final_512.save(build_ico_path, format="ICO", sizes=ico_sizes)
    print(f"Saved: {build_ico_path}")

if __name__ == "__main__":
    create_anything_logo()
