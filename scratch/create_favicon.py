from PIL import Image

logo_path = "/Users/apple/Documents/web/burp/public/logoicon.png"
ico_path = "/Users/apple/Documents/web/burp/app/favicon.ico"
png_path = "/Users/apple/Documents/web/burp/app/icon.png"

try:
    print(f"Opening original logo from {logo_path}")
    img = Image.open(logo_path)
    
    # Convert image to RGBA format explicitly to satisfy Turbopack requirements
    print("Converting image to RGBA...")
    img_rgba = img.convert("RGBA")
    
    # Save as multi-size ICO
    print(f"Saving multi-size ICO to {ico_path}...")
    img_rgba.save(ico_path, format="ICO", sizes=[(16, 16), (32, 32), (48, 48), (256, 256)])
    
    # Save as standard PNG icon
    print(f"Saving 32x32 PNG to {png_path}...")
    img_32 = img_rgba.resize((32, 32), Image.Resampling.LANCZOS)
    img_32.save(png_path, format="PNG")
    
    print("Favicon and icon created successfully!")
except Exception as e:
    print(f"Error creating favicon: {e}")
