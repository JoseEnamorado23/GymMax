import os
from PIL import Image, ImageDraw, ImageFont

def generate_icon(size, filename):
    # Background
    img = Image.new('RGB', (size, size), color='#16a34a') # Tailwind green-600 roughly
    draw = ImageDraw.Draw(img)
    
    # Try to load a generic font or use default
    try:
        font = ImageFont.truetype("arial.ttf", int(size/4))
    except:
        font = ImageFont.load_default()
    
    text = "GM"
    
    # Get text bounding box for centering
    bbox = draw.textbbox((0, 0), text, font=font)
    w = bbox[2] - bbox[0]
    h = bbox[3] - bbox[1]
    
    x = (size - w) / 2
    y = (size - h) / 2
    
    draw.text((x, y), text, fill="white", font=font)
    
    # Save
    out_path = os.path.join(r"C:\Users\PC\Desktop\GymMax\frontend\public", filename)
    img.save(out_path)
    print(f"Saved {out_path}")

if __name__ == "__main__":
    generate_icon(192, "pwa-192x192.png")
    generate_icon(512, "pwa-512x512.png")
    generate_icon(64, "favicon.ico")
